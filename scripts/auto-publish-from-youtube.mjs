#!/usr/bin/env node
import { loadEnv } from 'vite';
import { spawn } from 'node:child_process';
import path from 'node:path';
import {
  createServiceRoleClient,
  fetchDraftRow,
  upsertDraftEpisode,
  upsertExtractionJob,
  listExtractionJobs,
} from '../shared/sermonExtractionServer.mjs';

Object.assign(process.env, loadEnv('development', process.cwd(), ''));

function decodeXml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
  return decodeXml(match?.[1] || '');
}

function extractThumbnail(block, videoId) {
  const explicitThumbnail = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];
  return explicitThumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
}

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const block = match[1];
    const id = extractTag(block, 'yt:videoId');

    return {
      id,
      title: extractTag(block, 'title'),
      publishedAt: extractTag(block, 'published'),
      thumbnailUrl: extractThumbnail(block, id),
      watchUrl: id ? `https://www.youtube.com/watch?v=${id}` : '',
    };
  }).filter((item) => item.id && item.title);
}

async function fetchYoutubeVideos(channelId) {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
  if (!res.ok) throw new Error('Unable to fetch YouTube feed');
  const xml = await res.text();
  return parseFeed(xml);
}

async function main() {
  try {
    const client = createServiceRoleClient();

    const draftRow = await fetchDraftRow(client);
    const content = draftRow.content || {};
    const channelId = content?.settings?.links?.youtubeChannelId || process.env.YOUTUBE_CHANNEL_ID;

    if (!channelId) {
      console.error('No YouTube channel ID found in site content or YOUTUBE_CHANNEL_ID env var.');
      process.exit(1);
    }

    console.log('Fetching YouTube feed for channel', channelId);
    const videos = await fetchYoutubeVideos(channelId);
    console.log(`Found ${videos.length} videos in feed`);

    const existingEpisodes = (content?.sermons?.audioSermons || []).map((e) => e.video_id).filter(Boolean);

    let queued = 0;

    for (const video of videos) {
      if (existingEpisodes.includes(video.id)) continue;

      const episodeId = `audio-${video.id}`;

      console.log('Creating draft episode for', video.id);
      const upserted = await upsertDraftEpisode(client, {
        episode_id: episodeId,
        id: episodeId,
        title: video.title,
        date: (video.publishedAt || '').slice(0, 10),
        youtube_url: video.watchUrl,
        video_id: video.id,
        thumbnailUrl: video.thumbnailUrl || '',
        start_time: 'auto',
        end_time: 'auto',
        status: 'draft',
      });

      console.log('Upserted draft episode:', upserted.episode.id);

      console.log('Creating extraction job (queued)');
      const job = await upsertExtractionJob(client, {
        episode_id: upserted.episode.id,
        youtube_url: upserted.episode.youtube_url,
        video_id: upserted.episode.video_id,
        start_time: upserted.episode.start_time || 'auto',
        end_time: upserted.episode.end_time || 'auto',
        status: 'queued',
        requested_by: 'system',
      });

      console.log('Job created:', job.id);
      queued += 1;
    }

    if (queued > 0) {
      console.log(`Queued ${queued} extraction job(s); starting local worker to process queued jobs.`);
      const workerPath = path.resolve(process.cwd(), 'scripts', 'sermon-extraction-worker.mjs');
      const child = spawn(process.execPath, [workerPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
        },
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
    } else {
      console.log('No new videos found to queue.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Auto-publish error:', err.message || err);
    process.exit(1);
  }
}

main();
