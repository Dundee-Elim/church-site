import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ffmpegStatic from 'ffmpeg-static';
import YTDlpWrapModule from 'yt-dlp-wrap';
import {
  buildYoutubeThumbnailUrl,
  buildYoutubeWatchUrl,
  isAutomaticEndTime,
  isAutomaticStartTime,
  secondsToTimecode,
  validateTimecodeRange,
} from '../src/lib/sermonExtraction.js';
import {
  createServerClient,
  fetchExtractionJob,
  listExtractionJobs,
  publishDraftContentWithClient,
  updateDraftEpisodeById,
  updateExtractionJob,
  uploadBufferToStorage,
} from '../shared/sermonExtractionServer.mjs';

const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || '';
const LOCAL_ACCESS_TOKEN = process.env.SERMON_EXTRACTION_ACCESS_TOKEN || '';
const YT_DLP_CACHE_DIR = path.join(os.tmpdir(), 'dundee-elim-sermon-extraction');
const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;

let resolvedYtDlpBinaryPromise;

function parseArgs(argv) {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith('--')) {
      continue;
    }

    const key = item.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args.set(key, true);
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  return args;
}

function isActiveLiveMetadata(metadata) {
  return Boolean(
    metadata?.is_live
    || ['is_live', 'is_upcoming', 'post_live'].includes(metadata?.live_status),
  );
}

function isLikelyArchivePending({ url, metadata, errorText }) {
  if (isActiveLiveMetadata(metadata)) {
    return true;
  }

  const lower = String(errorText || '').toLowerCase();
  const pendingPhrases = [
    'live event will begin',
    'live stream recording is not available',
    'is not currently live',
    'this live event has ended',
    'video is not yet available',
    'will begin in',
    'post-live',
    'still being processed',
  ];

  if (pendingPhrases.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  return Boolean(
    metadata?.was_live
    && (String(url || '').includes('/live') || lower.includes('live')),
  );
}

function runCommand(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `${command} exited with code ${code}.`));
    });
  });
}

async function commandExists(command) {
  try {
    await runCommand(command, ['--version']);
    return true;
  } catch {
    return false;
  }
}

async function resolveYtDlpBinary() {
  if (process.env.YT_DLP_BIN) {
    return process.env.YT_DLP_BIN;
  }

  if (await commandExists('yt-dlp')) {
    return 'yt-dlp';
  }

  if (!resolvedYtDlpBinaryPromise) {
    resolvedYtDlpBinaryPromise = (async () => {
      const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : process.platform === 'darwin' ? 'yt-dlp_macos' : 'yt-dlp';
      const binaryPath = path.join(YT_DLP_CACHE_DIR, binaryName);

      await fs.mkdir(YT_DLP_CACHE_DIR, { recursive: true });

      try {
        await fs.access(binaryPath);
      } catch {
        await (YTDlpWrap.default || YTDlpWrap).downloadFromGithub(binaryPath, undefined, process.platform === 'darwin' ? 'yt-dlp_macos' : undefined);
        await fs.chmod(binaryPath, 0o755).catch(() => {});
      }

      return binaryPath;
    })();
  }

  return resolvedYtDlpBinaryPromise;
}

async function createYtDlp() {
  return new YTDlpWrap(await resolveYtDlpBinary());
}

async function loadYoutubeMetadata(url) {
  const ytDlp = await createYtDlp();
  const stdout = await ytDlp.execPromise([
    '--dump-single-json',
    '--skip-download',
    '--no-warnings',
    '--no-playlist',
    url,
  ]);

  return JSON.parse(stdout);
}

async function downloadAudioSource(url, tempDir) {
  const ytDlp = await createYtDlp();

  await ytDlp.execPromise([
    '--no-playlist',
    '--no-warnings',
    '-f',
    'bestaudio',
    '--output',
    'source.%(ext)s',
    url,
  ], { cwd: tempDir });

  const files = await fs.readdir(tempDir);
  const sourceFile = files.find((file) => file.startsWith('source.'));

  if (!sourceFile) {
    throw new Error('yt-dlp completed without producing a source file.');
  }

  return path.join(tempDir, sourceFile);
}

async function trimAndConvertToMp3(sourceFile, outputFile, startTime, endTime) {
  const ffmpegBinary = ffmpegStatic || 'ffmpeg';

  await runCommand(ffmpegBinary, [
    '-y',
    '-ss',
    startTime,
    '-to',
    endTime,
    '-i',
    sourceFile,
    '-vn',
    '-acodec',
    'libmp3lame',
    '-ar',
    '44100',
    '-b:a',
    '128k',
    outputFile,
  ]);
}

function formatYoutubeDate(value) {
  const input = String(value || '').trim();

  if (/^\d{8}$/.test(input)) {
    return `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(6, 8)}`;
  }

  return '';
}

function timestampToDate(value) {
  const timestamp = Number(value);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return '';
  }

  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function getYoutubeEpisodeDate(metadata) {
  return formatYoutubeDate(metadata?.release_date)
    || formatYoutubeDate(metadata?.upload_date)
    || timestampToDate(metadata?.release_timestamp)
    || timestampToDate(metadata?.timestamp)
    || '';
}

function getYoutubeEpisodeTitle(metadata) {
  return String(metadata?.title || metadata?.fulltitle || '').trim();
}

function getYoutubeDurationSeconds(metadata) {
  const duration = Number(metadata?.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return Math.floor(duration);
}

function parseSilenceDetectLine(line) {
  const silenceEndMatch = line.match(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/);

  if (!silenceEndMatch) {
    return null;
  }

  const silenceEnd = Number(silenceEndMatch[1]);
  const silenceDuration = Number(silenceEndMatch[2]);

  if (!Number.isFinite(silenceEnd) || !Number.isFinite(silenceDuration)) {
    return null;
  }

  return {
    silenceEnd,
    silenceDuration,
  };
}

async function detectAutomaticStartTime(sourceFile) {
  const ffmpegBinary = ffmpegStatic || 'ffmpeg';

  const { stderr } = await runCommand(ffmpegBinary, [
    '-hide_banner',
    '-nostats',
    '-i',
    sourceFile,
    '-af',
    'silencedetect=noise=-35dB:d=2.5',
    '-f',
    'null',
    '-',
  ]);

  const candidates = stderr
    .split('\n')
    .map(parseSilenceDetectLine)
    .filter(Boolean);

  // Prefer the first audio return after a meaningful quiet section. This avoids
  // starting in pre-service silence while still keeping the detector simple and
  // dependency-free for the worker.
  const meaningfulCandidate = candidates.find((candidate) => (
    candidate.silenceDuration >= 4 && candidate.silenceEnd >= 8
  ));
  const detectedSeconds = meaningfulCandidate?.silenceEnd || candidates[0]?.silenceEnd || 0;
  const startSeconds = Math.max(0, Math.floor(detectedSeconds) - 10);

  return {
    startSeconds,
    startTime: secondsToTimecode(startSeconds),
    detectedSeconds,
  };
}

async function saveJobPatch(client, job, patch, { persistJobStatus = true } = {}) {
  if (!persistJobStatus) {
    return {
      ...job,
      ...patch,
    };
  }

  return updateExtractionJob(client, job.id, patch);
}

async function markWaiting(client, job, patch = {}, options = {}) {
  return saveJobPatch(client, job, {
    ...patch,
    status: 'waiting_for_archive',
    github_run_id: GITHUB_RUN_ID,
    error_message: '',
  }, options);
}

async function markFailed(client, job, errorMessage, patch = {}, options = {}) {
  return saveJobPatch(client, job, {
    ...patch,
    status: 'failed',
    github_run_id: GITHUB_RUN_ID,
    error_message: String(errorMessage || 'Unknown extraction failure.').slice(0, 5000),
  }, options);
}

export async function processJob(client, job, { persistJobStatus = true } = {}) {
  const allowAutomaticStart = isAutomaticStartTime(job.start_time);
  const allowAutomaticEnd = isAutomaticEndTime(job.end_time);
  let range = validateTimecodeRange(job.start_time, job.end_time, { allowAutomaticStart, allowAutomaticEnd });

  if (!range.valid) {
    await markFailed(client, job, range.error, {}, { persistJobStatus });
    return;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sermon-extract-'));

  try {
    let activeJob = await saveJobPatch(client, job, {
      status: 'processing',
      github_run_id: GITHUB_RUN_ID,
      error_message: '',
      video_id: job.video_id || '',
    }, { persistJobStatus });

    const initialUrl = activeJob.video_id ? buildYoutubeWatchUrl(activeJob.video_id) : activeJob.youtube_url;
    let metadata;

    try {
      metadata = await loadYoutubeMetadata(initialUrl);
    } catch (metadataError) {
      if (isLikelyArchivePending({ url: initialUrl, errorText: metadataError.message })) {
        await markWaiting(client, activeJob, {}, { persistJobStatus });
        return;
      }

      await markFailed(client, activeJob, metadataError.message, {}, { persistJobStatus });
      return;
    }

    if (isActiveLiveMetadata(metadata)) {
      await markWaiting(client, activeJob, {
        video_id: metadata.id || activeJob.video_id || '',
      }, { persistJobStatus });
      return;
    }

    const resolvedVideoId = metadata.id || activeJob.video_id || '';
    const resolvedUrl = metadata.webpage_url || buildYoutubeWatchUrl(resolvedVideoId) || initialUrl;
    const thumbnailUrl = metadata.thumbnail || buildYoutubeThumbnailUrl(resolvedVideoId);
    const metadataTitle = getYoutubeEpisodeTitle(metadata);
    const metadataDate = getYoutubeEpisodeDate(metadata);
    const metadataDurationSeconds = getYoutubeDurationSeconds(metadata);

    if (range.automaticEnd) {
      if (metadataDurationSeconds === null) {
        await markFailed(client, activeJob, 'Unable to detect the YouTube video duration automatically. Add an end time and retry.', {}, { persistJobStatus });
        return;
      }

      range = {
        ...range,
        endSeconds: metadataDurationSeconds,
        normalizedEndTime: secondsToTimecode(metadataDurationSeconds),
        durationSeconds: range.startSeconds === null ? null : metadataDurationSeconds - range.startSeconds,
      };

      activeJob = await saveJobPatch(client, activeJob, {
        end_time: range.normalizedEndTime,
        error_message: '',
      }, { persistJobStatus });

      if (!range.automaticStart && range.endSeconds <= range.startSeconds) {
        await markFailed(client, activeJob, `Automatic end detection found ${range.normalizedEndTime}, which is not after the selected start time.`, {}, { persistJobStatus });
        return;
      }
    }

    let sourceFile;

    try {
      sourceFile = await downloadAudioSource(resolvedUrl, tempDir);
    } catch (downloadError) {
      if (isLikelyArchivePending({ url: resolvedUrl, metadata, errorText: downloadError.message })) {
        await markWaiting(client, activeJob, {
          video_id: resolvedVideoId,
        }, { persistJobStatus });
        return;
      }

      await markFailed(client, activeJob, downloadError.message, {
        video_id: resolvedVideoId,
      }, { persistJobStatus });
      return;
    }

    const outputFile = path.join(tempDir, 'sermon-audio.mp3');
    let resolvedStartTime = range.normalizedStartTime;
    let resolvedStartSeconds = range.startSeconds;

    if (range.automaticStart) {
      const detected = await detectAutomaticStartTime(sourceFile);
      resolvedStartTime = detected.startTime;
      resolvedStartSeconds = detected.startSeconds;
      range = {
        ...range,
        startSeconds: resolvedStartSeconds,
        normalizedStartTime: resolvedStartTime,
        durationSeconds: range.endSeconds - resolvedStartSeconds,
      };

      if (range.endSeconds <= resolvedStartSeconds) {
        await markFailed(client, activeJob, `Automatic start detection found ${resolvedStartTime}, which is not before the selected end time.`, {}, { persistJobStatus });
        return;
      }

      activeJob = await saveJobPatch(client, activeJob, {
        start_time: resolvedStartTime,
        error_message: '',
      }, { persistJobStatus });
    }

    await trimAndConvertToMp3(sourceFile, outputFile, range.normalizedStartTime, range.normalizedEndTime);

    activeJob = await saveJobPatch(client, activeJob, {
      status: 'uploading',
      github_run_id: GITHUB_RUN_ID,
      video_id: resolvedVideoId,
      error_message: '',
    }, { persistJobStatus });

    const buffer = await fs.readFile(outputFile);
    const uploaded = await uploadBufferToStorage(client, {
      filePath: `sermons/audio/${job.episode_id}.mp3`,
      buffer,
      contentType: 'audio/mpeg',
    });

    const updatedEpisode = await updateDraftEpisodeById(client, job.episode_id, (episode) => ({
      ...episode,
      title: metadataTitle || episode.title || 'Sermon Audio',
      date: metadataDate || episode.date || new Date().toISOString().slice(0, 10),
      youtube_url: resolvedUrl,
      start_time: range.normalizedStartTime,
      end_time: range.normalizedEndTime,
      audio_url: uploaded.url,
      duration_seconds: range.durationSeconds,
      thumbnailUrl: thumbnailUrl || episode.thumbnailUrl || '',
      status: 'published',
      publishedAt: episode.publishedAt || new Date().toISOString(),
    }));

    await publishDraftContentWithClient(client);

    await saveJobPatch(client, activeJob, {
      status: 'ready',
      github_run_id: GITHUB_RUN_ID,
      video_id: resolvedVideoId,
      audio_url: uploaded.url,
      error_message: '',
      processed_at: new Date().toISOString(),
    }, { persistJobStatus });

    console.log(`Processed episode ${job.episode_id}: ${updatedEpisode.episode.audio_url}`);
  } catch (error) {
    await markFailed(client, job, error.message, {}, { persistJobStatus });
    throw error;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = createServerClient({
    accessToken: LOCAL_ACCESS_TOKEN,
    preferServiceRole: !LOCAL_ACCESS_TOKEN,
  });
  const explicitJobId = args.get('job-id');

  if (explicitJobId) {
    const job = await fetchExtractionJob(client, { jobId: explicitJobId });

    if (!job) {
      throw new Error(`No sermon extraction job found for id ${explicitJobId}.`);
    }

    await processJob(client, job);
    return;
  }

  const jobs = await listExtractionJobs(client, {
    statuses: ['queued', 'waiting_for_archive'],
  });

  let failureCount = 0;

  for (const job of jobs) {
    try {
      await processJob(client, job);
    } catch (error) {
      failureCount += 1;
      console.error(`Failed processing queued job ${job.id}:`, error);
    }
  }

  if (failureCount > 0) {
    throw new Error(`${failureCount} queued sermon extraction job(s) failed.`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
