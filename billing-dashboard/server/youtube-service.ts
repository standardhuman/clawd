/**
 * YouTube Upload Service — ported from BOATY's youtube_api.py
 * 
 * Uses existing OAuth credentials from sailorskills-video.
 */

import { google, youtube_v3 } from 'googleapis';
import { readFileSync, writeFileSync, existsSync, statSync, createReadStream } from 'fs';
import { join } from 'path';

// ── Config ──────────────────────────────────────────────────────────────────

const BOATY_DIR = join(process.env.HOME || '', 'AI/business/sailorskills-platform/sailorskills-video');
const CLIENT_SECRETS_PATH = join(BOATY_DIR, 'client_secrets.json');
const TOKEN_PATH = join(BOATY_DIR, 'token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

// ── Types ───────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  title: string;
  videoCount: number;
}

export interface UploadProgress {
  videoPath: string;
  filename: string;
  boatName: string;
  progress: number;      // 0-1
  bytesUploaded: number;
  totalBytes: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';
  videoId?: string;
  error?: string;
  youtubeUrl?: string;
}

export interface UploadQueueStatus {
  active: boolean;
  total: number;
  completed: number;
  failed: number;
  cancelRequested: boolean;
  paused: boolean;
  uploads: UploadProgress[];
}

// ── State ───────────────────────────────────────────────────────────────────

let youtube: youtube_v3.Youtube | null = null;
let playlistCache: Playlist[] | null = null;
let playlistCacheTime = 0;
const CACHE_TTL = 3600_000; // 1 hour

let uploadQueue: UploadProgress[] = [];
let uploadActive = false;
let cancelRequested = false;
let paused = false;

// ── Auth ────────────────────────────────────────────────────────────────────

function getOAuth2Client() {
  if (!existsSync(CLIENT_SECRETS_PATH)) {
    throw new Error(`Client secrets not found at ${CLIENT_SECRETS_PATH}`);
  }
  const secrets = JSON.parse(readFileSync(CLIENT_SECRETS_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = secrets.installed || secrets.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0]);
}

function getAuthenticatedService(): youtube_v3.Youtube {
  if (youtube) return youtube;

  const oauth2Client = getOAuth2Client();

  if (!existsSync(TOKEN_PATH)) {
    throw new Error('YouTube token not found. Run BOATY Flask app first to authenticate.');
  }

  const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2Client.setCredentials(token);

  // Auto-refresh and save
  oauth2Client.on('tokens', (newTokens) => {
    const merged = { ...token, ...newTokens };
    writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
    console.log('YouTube token refreshed and saved');
  });

  youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  return youtube;
}

export function isYouTubeConfigured(): boolean {
  return existsSync(CLIENT_SECRETS_PATH) && existsSync(TOKEN_PATH);
}

// ── Playlists ───────────────────────────────────────────────────────────────

export async function getPlaylists(forceRefresh = false): Promise<Playlist[]> {
  if (!forceRefresh && playlistCache && (Date.now() - playlistCacheTime) < CACHE_TTL) {
    return playlistCache;
  }

  const yt = getAuthenticatedService();
  const playlists: Playlist[] = [];
  let pageToken: string | undefined;

  do {
    const res = await yt.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
      pageToken,
    });

    for (const item of res.data.items || []) {
      playlists.push({
        id: item.id!,
        title: item.snippet?.title || '',
        videoCount: item.contentDetails?.itemCount || 0,
      });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  playlistCache = playlists;
  playlistCacheTime = Date.now();
  console.log(`Cached ${playlists.length} YouTube playlists`);
  return playlists;
}

export async function findMatchingPlaylist(boatName: string): Promise<Playlist | null> {
  const playlists = await getPlaylists();
  const lower = boatName.toLowerCase();

  // Exact, prefix, contains
  return playlists.find(p => p.title.toLowerCase() === lower)
    || playlists.find(p => p.title.toLowerCase().startsWith(lower))
    || playlists.find(p => lower.includes(p.title.toLowerCase()) || p.title.toLowerCase().includes(lower))
    || null;
}

export async function createPlaylist(boatName: string, privacy = 'unlisted'): Promise<Playlist> {
  const yt = getAuthenticatedService();
  const res = await yt.playlists.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title: boatName },
      status: { privacyStatus: privacy },
    },
  });

  playlistCache = null; // Invalidate
  return {
    id: res.data.id!,
    title: res.data.snippet?.title || boatName,
    videoCount: 0,
  };
}

// ── Upload ──────────────────────────────────────────────────────────────────

async function uploadSingleVideo(
  entry: UploadProgress,
  privacy: string,
  playlistId?: string
): Promise<void> {
  if (cancelRequested) {
    entry.status = 'cancelled';
    return;
  }

  const yt = getAuthenticatedService();
  entry.status = 'uploading';
  entry.totalBytes = statSync(entry.videoPath).size;

  try {
    const res = await yt.videos.insert(
      {
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: entry.filename.replace(/\.[^.]+$/, ''),
            tags: ['boat', 'marine', 'hull cleaning'],
          },
          status: { privacyStatus: privacy },
        },
        media: {
          body: createReadStream(entry.videoPath),
        },
      },
      {
        onUploadProgress: (evt: { bytesRead: number }) => {
          entry.bytesUploaded = evt.bytesRead;
          entry.progress = entry.totalBytes > 0 ? evt.bytesRead / entry.totalBytes : 0;
        },
      }
    );

    entry.videoId = res.data.id || undefined;
    entry.youtubeUrl = entry.videoId ? `https://youtu.be/${entry.videoId}` : undefined;
    entry.progress = 1;
    entry.status = 'complete';

    // Add to playlist
    if (playlistId && entry.videoId) {
      try {
        await yt.playlistItems.insert({
          part: ['snippet'],
          requestBody: {
            snippet: {
              playlistId,
              resourceId: { kind: 'youtube#video', videoId: entry.videoId },
            },
          },
        });
      } catch (err: any) {
        console.error(`Failed to add ${entry.videoId} to playlist ${playlistId}:`, err.message);
      }
    }

    console.log(`Uploaded: ${entry.filename} → ${entry.youtubeUrl}`);
  } catch (err: any) {
    entry.status = 'failed';
    entry.error = err.message;
    console.error(`Upload failed for ${entry.filename}:`, err.message);
  }
}

export async function startUpload(
  videos: { path: string; filename: string; boatName: string }[],
  privacy = 'unlisted',
  autoCreatePlaylists = true
): Promise<void> {
  if (uploadActive) throw new Error('Upload already in progress');

  uploadActive = true;
  cancelRequested = false;
  paused = false;

  uploadQueue = videos.map(v => ({
    videoPath: v.path,
    filename: v.filename,
    boatName: v.boatName,
    progress: 0,
    bytesUploaded: 0,
    totalBytes: 0,
    status: 'pending' as const,
  }));

  // Process uploads sequentially (YouTube rate limits)
  (async () => {
    for (const entry of uploadQueue) {
      if (cancelRequested) {
        entry.status = 'cancelled';
        continue;
      }

      // Pause support
      while (paused && !cancelRequested) {
        await new Promise(r => setTimeout(r, 1000));
      }

      // Find or create playlist
      let playlistId: string | undefined;
      try {
        let playlist = await findMatchingPlaylist(entry.boatName);
        if (!playlist && autoCreatePlaylists) {
          playlist = await createPlaylist(entry.boatName, privacy);
        }
        playlistId = playlist?.id;
      } catch (err: any) {
        console.error(`Playlist error for ${entry.boatName}:`, err.message);
      }

      await uploadSingleVideo(entry, privacy, playlistId);
    }

    uploadActive = false;
    console.log(`Upload queue complete: ${uploadQueue.filter(u => u.status === 'complete').length}/${uploadQueue.length} succeeded`);
  })();
}

export function getUploadStatus(): UploadQueueStatus {
  return {
    active: uploadActive,
    total: uploadQueue.length,
    completed: uploadQueue.filter(u => u.status === 'complete').length,
    failed: uploadQueue.filter(u => u.status === 'failed').length,
    cancelRequested,
    paused,
    uploads: uploadQueue,
  };
}

export function cancelUpload() {
  cancelRequested = true;
}

export function pauseUpload() {
  paused = true;
}

export function resumeUpload() {
  paused = false;
}

export function clearUploadStatus() {
  if (uploadActive) throw new Error('Cannot clear while uploads are active');
  uploadQueue = [];
}
