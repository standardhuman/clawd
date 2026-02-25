/**
 * Video Service — ported from BOATY Flask app (sailorskills-video)
 * 
 * Handles: video scanning, renaming, YouTube upload, duration extraction
 */

import { readdirSync, statSync, renameSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { execSync } from 'child_process';

// ── Config ──────────────────────────────────────────────────────────────────

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.mts']);
const MIN_SIZE_MB = 200;
const MAX_SIZE_MB = 500;

export interface VideoConfig {
  sourceDir: string;
  uploadDir: string;
  archiveDir: string;
  minSizeMb: number;
  maxSizeMb: number;
}

const DEFAULT_CONFIG: VideoConfig = {
  sourceDir: '/Users/brian/Downloads/*BOATY Video Files/source',
  uploadDir: '/Users/brian/Downloads/*BOATY Video Files/upload',
  archiveDir: '/Users/brian/Downloads/*BOATY Video Files/archive',
  minSizeMb: MIN_SIZE_MB,
  maxSizeMb: MAX_SIZE_MB,
};

let config = { ...DEFAULT_CONFIG };

export function setVideoConfig(c: Partial<VideoConfig>) {
  config = { ...config, ...c };
  // Ensure dirs exist
  for (const dir of [config.sourceDir, config.uploadDir, config.archiveDir]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface VideoFile {
  name: string;
  path: string;
  sizeMb: number;
  sizeBytes: number;
  ext: string;
  modifiedAt: string;
}

export interface RenameAssignment {
  index: number;
  sourceName: string;
  sourcePath: string;
  boatName: string;
  date: string;       // YYYY-MM-DD
  type: string;       // Before, After, Inspection, Other
  position: number;
  previewName: string;
}

export interface VideoMetadata {
  durationSeconds: number;
  creationTime: string | null;
  filename: string;
}

// ── Rename log for undo ─────────────────────────────────────────────────────

let renameLog: { from: string; to: string }[] = [];

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  let clean = name
    .replace(/[/\\:*?"<>|\n\r\t]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^[-\s]+|[-\s]+$/g, '');
  return clean || 'unnamed';
}

function isVideoFile(name: string): boolean {
  return VIDEO_EXTENSIONS.has(extname(name).toLowerCase());
}

// ── Core functions ──────────────────────────────────────────────────────────

export function getSourceVideos(): VideoFile[] {
  if (!existsSync(config.sourceDir)) return [];
  
  return readdirSync(config.sourceDir)
    .filter(f => isVideoFile(f) && !f.startsWith('.'))
    .map(f => {
      const fullPath = join(config.sourceDir, f);
      const stat = statSync(fullPath);
      const sizeMb = stat.size / (1024 * 1024);
      return {
        name: f,
        path: fullPath,
        sizeMb: Math.round(sizeMb * 10) / 10,
        sizeBytes: stat.size,
        ext: extname(f).toLowerCase(),
        modifiedAt: stat.mtime.toISOString(),
      };
    })
    .filter(v => v.sizeMb >= config.minSizeMb && v.sizeMb <= config.maxSizeMb)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

export function getUploadReadyVideos(): Record<string, VideoFile[]> {
  if (!existsSync(config.uploadDir)) return {};
  
  const files = readdirSync(config.uploadDir)
    .filter(f => isVideoFile(f) && !f.startsWith('.'))
    .map(f => {
      const fullPath = join(config.uploadDir, f);
      const stat = statSync(fullPath);
      return {
        name: f,
        path: fullPath,
        sizeMb: Math.round(stat.size / (1024 * 1024) * 10) / 10,
        sizeBytes: stat.size,
        ext: extname(f).toLowerCase(),
        modifiedAt: stat.mtime.toISOString(),
      };
    });

  // Group by boat name (everything before the date pattern MM-DD-YYYY)
  const grouped: Record<string, VideoFile[]> = {};
  for (const file of files) {
    const match = file.name.match(/^(.+?)\s+\d{2}-\d{2}-\d{4}/);
    const boatName = match ? match[1].trim() : 'Unknown';
    if (!grouped[boatName]) grouped[boatName] = [];
    grouped[boatName].push(file);
  }
  return grouped;
}

export function previewRename(
  boatNames: string[],
  selectedDate: string, // YYYY-MM-DD
  videosPerBoat: number = 2
): { assignments: RenameAssignment[]; unassigned: VideoFile[]; totalVideos: number } {
  const sourceVideos = getSourceVideos();
  if (!sourceVideos.length) return { assignments: [], unassigned: [], totalVideos: 0 };

  // Format date as MM-DD-YYYY
  const [y, m, d] = selectedDate.split('-');
  const dateStr = `${m}-${d}-${y}`;

  const assignments: RenameAssignment[] = [];
  let videoIndex = 0;

  for (const boatName of boatNames.map(n => n.trim()).filter(Boolean)) {
    for (let i = 0; i < videosPerBoat; i++) {
      if (videoIndex >= sourceVideos.length) break;

      const source = sourceVideos[videoIndex];
      let videoType = 'Other';
      if (videosPerBoat === 1) videoType = 'Inspection';
      else if (videosPerBoat === 2) videoType = i === 0 ? 'Before' : 'After';
      else {
        if (i === 0) videoType = 'Before';
        else if (i === videosPerBoat - 1) videoType = 'After';
        else videoType = `Item ${i}`;
      }

      const suffix = videoType !== 'Other' ? ` (${videoType})` : '';
      const ext = extname(source.name);
      const previewName = sanitizeFilename(`${boatName} ${dateStr} ${i + 1}${suffix}`) + ext;

      assignments.push({
        index: videoIndex,
        sourceName: source.name,
        sourcePath: source.path,
        boatName,
        date: selectedDate,
        type: videoType,
        position: i + 1,
        previewName,
      });
      videoIndex++;
    }
  }

  const unassigned = sourceVideos.slice(videoIndex);
  return { assignments, unassigned, totalVideos: sourceVideos.length };
}

export function renameVideos(assignments: RenameAssignment[]): { success: boolean; renamed: number; error?: string } {
  renameLog = [];
  let renamed = 0;

  try {
    for (const a of assignments) {
      const dest = join(config.uploadDir, a.previewName);
      if (existsSync(dest)) {
        return { success: false, renamed, error: `File already exists: ${a.previewName}` };
      }
      renameSync(a.sourcePath, dest);
      renameLog.push({ from: a.sourcePath, to: dest });
      renamed++;
    }
    return { success: true, renamed };
  } catch (err: any) {
    return { success: false, renamed, error: err.message };
  }
}

export function undoRename(): { success: boolean; undone: number; error?: string } {
  if (!renameLog.length) return { success: false, undone: 0, error: 'Nothing to undo' };

  let undone = 0;
  try {
    for (const entry of [...renameLog].reverse()) {
      if (existsSync(entry.to)) {
        renameSync(entry.to, entry.from);
        undone++;
      }
    }
    renameLog = [];
    return { success: true, undone };
  } catch (err: any) {
    return { success: false, undone, error: err.message };
  }
}

export function archiveVideos(filenames: string[]): { success: boolean; archived: number } {
  let archived = 0;
  for (const name of filenames) {
    const src = join(config.uploadDir, name);
    const dest = join(config.archiveDir, name);
    if (existsSync(src)) {
      renameSync(src, dest);
      archived++;
    }
  }
  return { success: true, archived };
}

// ── Duration extraction (via ffprobe) ───────────────────────────────────────

export function getVideoMetadata(filepath: string): VideoMetadata | null {
  try {
    const result = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${filepath}"`,
      { timeout: 30000 }
    );
    const data = JSON.parse(result.toString());
    const duration = parseFloat(data.format?.duration || '0');
    const creationTime = data.format?.tags?.creation_time || null;
    return {
      durationSeconds: Math.round(duration),
      creationTime,
      filename: basename(filepath),
    };
  } catch {
    return null;
  }
}

export function calculateJobDurations(dir?: string): Record<string, { durationMinutes: number; videoCount: number; date: string }> {
  const targetDir = dir || config.uploadDir;
  if (!existsSync(targetDir)) return {};

  const files = readdirSync(targetDir).filter(f => isVideoFile(f)).sort();
  
  // Group by boat+date
  const jobs: Record<string, { files: string[]; date: string }> = {};
  for (const file of files) {
    const match = file.match(/^(.+?)\s+(\d{2}-\d{2}-\d{4})/);
    if (!match) continue;
    const key = `${match[1]}|${match[2]}`;
    if (!jobs[key]) jobs[key] = { files: [], date: match[2] };
    jobs[key].files.push(join(targetDir, file));
  }

  // Calculate durations from first/last video creation times
  const results: Record<string, { durationMinutes: number; videoCount: number; date: string }> = {};
  for (const [key, job] of Object.entries(jobs)) {
    const metas = job.files.map(f => getVideoMetadata(f)).filter(Boolean) as VideoMetadata[];
    if (metas.length === 0) continue;

    // Sum video durations as fallback
    const totalSeconds = metas.reduce((sum, m) => sum + m.durationSeconds, 0);
    
    // Try creation time span (before start → after end)
    const times = metas
      .map(m => m.creationTime ? new Date(m.creationTime).getTime() : 0)
      .filter(t => t > 0)
      .sort();
    
    let durationMinutes: number;
    if (times.length >= 2) {
      // Duration = last creation time + last video duration - first creation time
      const lastMeta = metas[metas.length - 1];
      durationMinutes = Math.round(((times[times.length - 1] + lastMeta.durationSeconds * 1000) - times[0]) / 60000);
    } else {
      durationMinutes = Math.round(totalSeconds / 60);
    }

    results[key] = {
      durationMinutes: Math.max(1, durationMinutes),
      videoCount: metas.length,
      date: job.date,
    };
  }
  return results;
}
