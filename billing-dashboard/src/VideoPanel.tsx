import { useState, useEffect, useCallback } from 'react';
import { API_URL } from './App';

interface VideoFile {
  name: string;
  path: string;
  sizeMb: number;
  ext: string;
  modifiedAt: string;
}

interface RenameAssignment {
  index: number;
  sourceName: string;
  sourcePath: string;
  boatName: string;
  date: string;
  type: string;
  position: number;
  previewName: string;
}

export function VideoPanel() {
  const [sourceVideos, setSourceVideos] = useState<VideoFile[]>([]);
  const [uploadReady, setUploadReady] = useState<Record<string, VideoFile[]>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rename form state
  const [boatNames, setBoatNames] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [videosPerBoat, setVideosPerBoat] = useState(2);
  const [preview, setPreview] = useState<RenameAssignment[] | null>(null);
  const [unassigned, setUnassigned] = useState<VideoFile[]>([]);

  // Durations
  const [durations, setDurations] = useState<Record<string, { durationMinutes: number; videoCount: number; date: string }>>({});

  // YouTube
  const [ytConfigured, setYtConfigured] = useState(false);
  const [ytUploading, setYtUploading] = useState(false);
  const [ytStatus, setYtStatus] = useState<any>(null);
  const [ytPollTimer, setYtPollTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const flash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [srcRes, upRes] = await Promise.all([
        fetch(`${API_URL}/videos/source`),
        fetch(`${API_URL}/videos/upload-ready`),
      ]);
      setSourceVideos((await srcRes.json()).videos || []);
      setUploadReady((await upRes.json()).videos || {});
    } catch { flash('error', 'Failed to load videos'); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); checkYouTube(); }, [refresh]);

  // Poll upload status while active
  useEffect(() => {
    if (ytUploading && !ytPollTimer) {
      const timer = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/youtube/upload-status`);
          const data = await res.json();
          setYtStatus(data);
          if (!data.active) {
            setYtUploading(false);
          }
        } catch {}
      }, 2000);
      setYtPollTimer(timer);
    }
    if (!ytUploading && ytPollTimer) {
      clearInterval(ytPollTimer);
      setYtPollTimer(null);
    }
    return () => { if (ytPollTimer) clearInterval(ytPollTimer); };
  }, [ytUploading, ytPollTimer]);

  const checkYouTube = async () => {
    try {
      const res = await fetch(`${API_URL}/youtube/status`);
      const data = await res.json();
      setYtConfigured(data.configured);
      if (data.upload?.active) {
        setYtStatus(data.upload);
        setYtUploading(true);
      }
    } catch {}
  };

  const handlePreview = async () => {
    const names = boatNames.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) return flash('error', 'Enter at least one boat name');
    try {
      const res = await fetch(`${API_URL}/videos/preview-rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boat_names: names, selected_date: selectedDate, videos_per_boat: videosPerBoat }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.assignments);
        setUnassigned(data.unassigned || []);
      } else {
        flash('error', data.error || 'Preview failed');
      }
    } catch { flash('error', 'Preview request failed'); }
  };

  const handleRename = async () => {
    if (!preview?.length) return;
    try {
      const res = await fetch(`${API_URL}/videos/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: preview }),
      });
      const data = await res.json();
      if (data.success) {
        flash('success', `Renamed ${data.renamed} videos`);
        setPreview(null);
        setBoatNames('');
        refresh();
      } else {
        flash('error', data.error || 'Rename failed');
      }
    } catch { flash('error', 'Rename request failed'); }
  };

  const handleUndo = async () => {
    try {
      const res = await fetch(`${API_URL}/videos/undo-rename`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        flash('success', `Undid ${data.undone} renames`);
        setPreview(null);
        refresh();
      } else {
        flash('error', data.error || 'Undo failed');
      }
    } catch { flash('error', 'Undo request failed'); }
  };

  const handleArchive = async (filenames: string[]) => {
    try {
      const res = await fetch(`${API_URL}/videos/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames }),
      });
      const data = await res.json();
      if (data.success) {
        flash('success', `Archived ${data.archived} videos`);
        refresh();
      }
    } catch { flash('error', 'Archive failed'); }
  };

  const handleYouTubeUpload = async () => {
    const allVideos = Object.entries(uploadReady).flatMap(([boat, vids]) =>
      vids.map(v => ({ path: v.path, filename: v.name, boatName: boat }))
    );
    if (!allVideos.length) return flash('error', 'No videos to upload');
    try {
      const res = await fetch(`${API_URL}/youtube/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: allVideos, privacy: 'unlisted', autoCreatePlaylists: true }),
      });
      const data = await res.json();
      if (data.success) {
        flash('success', `Started uploading ${data.total} videos`);
        setYtUploading(true);
      } else {
        flash('error', data.error || 'Upload failed');
      }
    } catch { flash('error', 'Upload request failed'); }
  };

  const handleYtCancel = async () => {
    await fetch(`${API_URL}/youtube/cancel`, { method: 'POST' });
    flash('success', 'Cancel requested');
  };

  const handleYtPause = async () => {
    await fetch(`${API_URL}/youtube/${ytStatus?.paused ? 'resume' : 'pause'}`, { method: 'POST' });
  };

  const loadDurations = async () => {
    try {
      const res = await fetch(`${API_URL}/videos/durations`);
      const data = await res.json();
      setDurations(data.durations || {});
    } catch { flash('error', 'Failed to load durations'); }
  };

  const uploadReadyCount = Object.values(uploadReady).reduce((sum, vids) => sum + vids.length, 0);
  const boatCount = Object.keys(uploadReady).length;

  return (
    <div className="space-y-6">
      {/* Status message */}
      {message && (
        <div className={`px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Source Videos + Rename */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            📹 Source Videos
            <span className="ml-2 text-sm font-normal text-gray-500">
              {sourceVideos.length} video{sourceVideos.length !== 1 ? 's' : ''} in source folder
            </span>
          </h3>
          <button
            onClick={refresh}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {loading ? '↻ Loading...' : '↻ Refresh'}
          </button>
        </div>

        {sourceVideos.length > 0 && (
          <div className="space-y-4">
            {/* Source file list */}
            <div className="max-h-40 overflow-auto border rounded p-2 bg-gray-50">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 text-xs">
                  <th className="pb-1">#</th><th className="pb-1">File</th><th className="pb-1 text-right">Size</th>
                </tr></thead>
                <tbody>
                  {sourceVideos.map((v, i) => (
                    <tr key={v.name} className="border-t border-gray-100">
                      <td className="py-0.5 text-gray-400">{i + 1}</td>
                      <td className="py-0.5 font-mono text-xs truncate max-w-[300px]">{v.name}</td>
                      <td className="py-0.5 text-right text-gray-500">{v.sizeMb} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rename form */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Boat Names (one per line, in dive order)
                </label>
                <textarea
                  value={boatNames}
                  onChange={e => setBoatNames(e.target.value)}
                  placeholder={"Sea Whisper\nBlue Moon\nWindchaser"}
                  rows={Math.max(3, boatNames.split('\n').length)}
                  className="w-full border rounded px-3 py-2 text-sm font-mono resize-y"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="border rounded px-2 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Videos/boat</label>
                  <select
                    value={videosPerBoat}
                    onChange={e => setVideosPerBoat(Number(e.target.value))}
                    className="border rounded px-2 py-2 text-sm w-full"
                  >
                    <option value={1}>1 (Inspection)</option>
                    <option value={2}>2 (Before/After)</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handlePreview}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Preview
                </button>
                {preview && (
                  <button
                    onClick={handleRename}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    ✓ Rename {preview.length}
                  </button>
                )}
                <button
                  onClick={handleUndo}
                  className="w-full text-gray-500 hover:text-red-600 px-4 py-1 rounded text-xs border"
                >
                  Undo Last
                </button>
              </div>
            </div>

            {/* Preview table */}
            {preview && preview.length > 0 && (
              <div className="border rounded p-2 bg-blue-50">
                <p className="text-xs font-medium text-blue-700 mb-1">Rename Preview</p>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-blue-500">
                    <th>Source</th><th>→</th><th>New Name</th><th>Type</th>
                  </tr></thead>
                  <tbody>
                    {preview.map((a, i) => (
                      <tr key={i} className="border-t border-blue-100">
                        <td className="py-0.5 font-mono text-xs truncate max-w-[200px]">{a.sourceName}</td>
                        <td className="py-0.5 text-blue-400">→</td>
                        <td className="py-0.5 font-mono text-xs font-medium">{a.previewName}</td>
                        <td className="py-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            a.type === 'Before' ? 'bg-amber-100 text-amber-700' :
                            a.type === 'After' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{a.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {unassigned.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{unassigned.length} unassigned video{unassigned.length !== 1 ? 's' : ''}</p>
                )}
              </div>
            )}
          </div>
        )}

        {sourceVideos.length === 0 && !loading && (
          <p className="text-sm text-gray-400">No videos in source folder (200-500 MB filter)</p>
        )}
      </div>

      {/* Upload Ready */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            📤 Ready for Upload
            <span className="ml-2 text-sm font-normal text-gray-500">
              {uploadReadyCount} video{uploadReadyCount !== 1 ? 's' : ''} across {boatCount} boat{boatCount !== 1 ? 's' : ''}
            </span>
          </h3>
          <div className="space-x-2">
            <button onClick={loadDurations} className="text-sm text-blue-600 hover:text-blue-800">
              ⏱ Durations
            </button>
            {uploadReadyCount > 0 && (
              <button
                onClick={() => {
                  const allFiles = Object.values(uploadReady).flat().map(v => v.name);
                  if (confirm(`Archive all ${allFiles.length} videos?`)) handleArchive(allFiles);
                }}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                📦 Archive All
              </button>
            )}
          </div>
        </div>

        {boatCount > 0 ? (
          <div className="space-y-2">
            {Object.entries(uploadReady).sort(([a], [b]) => a.localeCompare(b)).map(([boat, vids]) => {
              const key = Object.keys(durations).find(k => k.startsWith(boat + '|'));
              const dur = key ? durations[key] : null;
              return (
                <div key={boat} className="border rounded p-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{boat}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {vids.length} video{vids.length !== 1 ? 's' : ''} · {vids.reduce((s, v) => s + v.sizeMb, 0).toFixed(0)} MB
                    </span>
                    {dur && (
                      <span className="text-sm text-purple-600 ml-2">⏱ {dur.durationMinutes} min</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleArchive(vids.map(v => v.name))}
                      className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 rounded px-2 py-1"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No renamed videos ready for upload</p>
        )}

        {/* YouTube Upload Button */}
        {uploadReadyCount > 0 && ytConfigured && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">YouTube Upload</h4>
                <p className="text-xs text-gray-500">Upload all {uploadReadyCount} videos to YouTube (unlisted, auto-create playlists)</p>
              </div>
              {!ytUploading ? (
                <button
                  onClick={handleYouTubeUpload}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                >
                  ▶ Upload to YouTube
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleYtPause} className="border px-3 py-1 rounded text-sm">
                    {ytStatus?.paused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button onClick={handleYtCancel} className="border border-red-300 text-red-600 px-3 py-1 rounded text-sm">
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!ytConfigured && uploadReadyCount > 0 && (
          <p className="mt-3 text-xs text-amber-600">
            ⚠ YouTube not configured — run BOATY Flask app once to set up OAuth credentials
          </p>
        )}
      </div>

      {/* YouTube Upload Progress */}
      {ytStatus && ytStatus.uploads?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-3">
            📺 YouTube Upload Progress
            <span className="ml-2 text-sm font-normal text-gray-500">
              {ytStatus.completed}/{ytStatus.total} complete
              {ytStatus.failed > 0 && <span className="text-red-500 ml-1">({ytStatus.failed} failed)</span>}
            </span>
          </h3>
          <div className="space-y-2">
            {ytStatus.uploads.map((u: any, i: number) => (
              <div key={i} className="border rounded p-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{u.boatName}</span>
                    <span className="text-gray-400 ml-2 text-xs">{u.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.status === 'complete' && u.youtubeUrl && (
                      <a href={u.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                        {u.youtubeUrl}
                      </a>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      u.status === 'complete' ? 'bg-green-100 text-green-700' :
                      u.status === 'uploading' ? 'bg-blue-100 text-blue-700' :
                      u.status === 'failed' ? 'bg-red-100 text-red-700' :
                      u.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                      'bg-gray-50 text-gray-400'
                    }`}>{u.status}</span>
                  </div>
                </div>
                {u.status === 'uploading' && (
                  <div className="mt-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${Math.round(u.progress * 100)}%` }}
                    />
                  </div>
                )}
                {u.status === 'failed' && u.error && (
                  <p className="text-xs text-red-500 mt-1">{u.error}</p>
                )}
              </div>
            ))}
          </div>
          {!ytStatus.active && (
            <button
              onClick={async () => {
                await fetch(`${API_URL}/youtube/clear`, { method: 'POST' });
                setYtStatus(null);
                refresh();
              }}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear status
            </button>
          )}
        </div>
      )}
    </div>
  );
}
