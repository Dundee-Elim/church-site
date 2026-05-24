import { parseSiteContent } from '../src/content/siteContentSchema.js';
import { defaultSiteContent } from '../src/content/defaultSiteContent.js';
import {
  createServerClient,
  fetchDraftRow,
  upsertDraftEpisode,
} from '../shared/sermonExtractionServer.mjs';
import { processJob } from './sermon-extraction-worker.mjs';

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
  }).filter((item) => item.id && item.title && item.watchUrl);
}

function getEpisodeVideoId(episode) {
  if (episode?.video_id) {
    return episode.video_id;
  }

  return String(episode?.youtube_url || '').match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1] || '';
}

function getSyncLimit() {
  const limit = Number(process.env.SERMON_YOUTUBE_AUTO_SYNC_LIMIT || 0);
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;
}

async function fetchYoutubeFeed(channelId) {
  let resolvedChannelId = channelId;

  if (String(channelId).trim().startsWith('@')) {
    const handleResponse = await fetch(`https://www.youtube.com/${encodeURIComponent(channelId)}`);

    if (!handleResponse.ok) {
      throw new Error(`Unable to resolve YouTube handle ${channelId}.`);
    }

    const html = await handleResponse.text();
    resolvedChannelId = html.match(/"channelId":"([^"]+)"/)?.[1]
      || html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/)?.[1]
      || '';

    if (!resolvedChannelId) {
      throw new Error(`Unable to find a channel ID for YouTube handle ${channelId}.`);
    }
  }

  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(resolvedChannelId)}`);

  if (!response.ok) {
    throw new Error(`Unable to load YouTube feed for channel ${resolvedChannelId}.`);
  }

  return parseFeed(await response.text());
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Automatic YouTube-to-audio publishing needs the Supabase service role key in .env.local.');
  }

  const client = createServerClient({ preferServiceRole: true });
  const draftRow = await fetchDraftRow(client);
  const content = parseSiteContent(draftRow.content || defaultSiteContent);
  const channelId = content?.settings?.links?.youtubeChannelId || '';

  if (!channelId) {
    console.log('No YouTube channel ID configured. Nothing to sync.');
    return;
  }

  const videos = await fetchYoutubeFeed(channelId);
  const existingVideoIds = new Set(
    (content?.sermons?.audioSermons || [])
      .filter((episode) => episode?.audio_url)
      .map(getEpisodeVideoId)
      .filter(Boolean),
  );
  const limit = getSyncLimit();
  const missingVideos = videos
    .filter((video) => !existingVideoIds.has(video.id))
    .slice(0, limit || undefined);

  if (missingVideos.length === 0) {
    console.log('No new YouTube sermons need audio extraction.');
    return;
  }

  for (const video of missingVideos) {
    const episodeId = `audio-${video.id}`;

    await upsertDraftEpisode(client, {
      episode_id: episodeId,
      id: episodeId,
      title: video.title,
      date: String(video.publishedAt || '').slice(0, 10),
      youtube_url: video.watchUrl,
      video_id: video.id,
      thumbnailUrl: video.thumbnailUrl,
      start_time: 'auto',
      end_time: 'auto',
      status: 'draft',
    }, { clearAudio: true });

    const job = {
      id: `youtube-auto-sync-${video.id}`,
      episode_id: episodeId,
      youtube_url: video.watchUrl,
      video_id: video.id,
      start_time: 'auto',
      end_time: 'auto',
      requested_by: 'youtube-auto-sync',
    };

    console.log(`Processing YouTube sermon ${video.id}: ${video.title}`);
    await processJob(client, job, { persistJobStatus: false });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
