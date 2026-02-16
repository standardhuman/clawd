import { useState, useEffect } from 'react';

interface Client {
  boat: string;
  firstName: string;
  email: string;
  plan: string;
  startTime: string | null;
  serviceLogUrl: string | null;
}

interface EmailPreview {
  boat: string;
  firstName: string;
  email: string;
  subject: string;
  body: string;
  serviceLogUrl?: string | null;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
}

interface Props {
  apiUrl: string;
}

export function EmailPanel({ apiUrl }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [previews, setPreviews] = useState<EmailPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<'upcoming' | 'post-service'>('upcoming');
  const [seasonalMessage, setSeasonalMessage] = useState("Hope you're enjoying the new year! Here's a quick heads-up about your upcoming service.");
  const [closingMessage, setClosingMessage] = useState("If you have any questions or need to adjust your schedule, just reply to this email.");
  const [serviceDate, setServiceDate] = useState('');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const monthName = new Date().toLocaleString('en-US', { month: 'long' });

  // Load scheduled clients
  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/email/clients`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load clients' });
    }
    setLoading(false);
  };

  useEffect(() => { loadClients(); }, []);

  // Generate previews
  const generatePreviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/email/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          boats: clients.map(c => c.boat),
          seasonalMessage,
          closingMessage,
          serviceDate,
          note,
          monthName
        })
      });
      const data = await res.json();
      setPreviews(data.previews || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate previews' });
    }
    setLoading(false);
  };

  // Send all emails
  const sendAll = async () => {
    setSending(true);
    setShowConfirm(false);
    
    for (let i = 0; i < previews.length; i++) {
      if (previews[i].status === 'sent') continue;
      
      setPreviews(prev => prev.map((p, j) => j === i ? { ...p, status: 'sending' } : p));
      
      try {
        const res = await fetch(`${apiUrl}/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: previews[i].email,
            subject: previews[i].subject,
            body: previews[i].body,
            boat: previews[i].boat
          })
        });
        const data = await res.json();
        
        setPreviews(prev => prev.map((p, j) => j === i ? { 
          ...p, 
          status: data.success ? 'sent' : 'failed',
          error: data.error 
        } : p));
      } catch {
        setPreviews(prev => prev.map((p, j) => j === i ? { ...p, status: 'failed', error: 'Network error' } : p));
      }
      
      // Small delay between sends
      await new Promise(r => setTimeout(r, 300));
    }
    
    setSending(false);
    const sentCount = previews.filter(p => p.status !== 'failed').length;
    setMessage({ type: 'success', text: `Sent ${sentCount} emails` });
    setTimeout(() => setMessage(null), 5000);
  };

  // Send a single email
  const sendOne = async (index: number) => {
    const preview = previews[index];
    if (!preview || preview.status === 'sent') return;

    setPreviews(prev => prev.map((p, j) => j === index ? { ...p, status: 'sending' } : p));

    try {
      const res = await fetch(`${apiUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: preview.email,
          subject: preview.subject,
          body: preview.body,
          boat: preview.boat
        })
      });
      const data = await res.json();

      setPreviews(prev => prev.map((p, j) => j === index ? {
        ...p,
        status: data.success ? 'sent' : 'failed',
        error: data.error
      } : p));

      if (data.success) {
        setMessage({ type: 'success', text: `Sent to ${preview.firstName} (${preview.boat})` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setPreviews(prev => prev.map((p, j) => j === index ? { ...p, status: 'failed', error: 'Network error' } : p));
    }
  };

  // Remove a client from the preview list
  const removePreview = (boat: string) => {
    setPreviews(prev => prev.filter(p => p.boat !== boat));
  };

  const sentCount = previews.filter(p => p.status === 'sent').length;
  const failedCount = previews.filter(p => p.status === 'failed').length;
  const pendingCount = previews.filter(p => p.status === 'pending').length;

  return (
    <div>
      {message && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg z-50 ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>{message.text}</div>
      )}

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Template</label>
            <select
              value={template}
              onChange={e => setTemplate(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="upcoming">📅 Upcoming Service</option>
              <option value="post-service">✅ Post-Service</option>
            </select>
          </div>
          
          <button
            onClick={loadClients}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded mt-5"
          >
            🔄 Refresh Clients
          </button>
          
          <div className="ml-auto text-sm text-gray-400">
            {clients.length} clients loaded
          </div>
        </div>

        {/* Seasonal/closing messages */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Seasonal Message</label>
            <textarea
              value={seasonalMessage}
              onChange={e => setSeasonalMessage(e.target.value)}
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Closing Message</label>
            <textarea
              value={closingMessage}
              onChange={e => setClosingMessage(e.target.value)}
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Post-service specific fields */}
        {template === 'post-service' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Service Date</label>
              <input
                type="date"
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Note</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2 text-xs text-gray-500">
              Service log URLs are pulled automatically from each boat's Notion record.
            </div>
          </div>
        )}

        <button
          onClick={generatePreviews}
          disabled={loading || clients.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-6 py-2 rounded font-medium"
        >
          {loading ? 'Loading...' : `📧 Preview Emails for ${clients.length} Clients`}
        </button>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Email Previews</h2>
              <span className="text-sm text-gray-400">
                {pendingCount > 0 && <span className="text-yellow-400">{pendingCount} pending</span>}
                {sentCount > 0 && <span className="text-green-400 ml-2">✓ {sentCount} sent</span>}
                {failedCount > 0 && <span className="text-red-400 ml-2">✗ {failedCount} failed</span>}
              </span>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={sending}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-6 py-2 rounded font-medium"
              >
                {sending ? 'Sending...' : `🚀 Send All (${pendingCount})`}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {previews.map((preview, index) => (
              <div key={preview.boat} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                preview.status === 'sent' ? 'border-green-500' :
                preview.status === 'failed' ? 'border-red-500' :
                preview.status === 'sending' ? 'border-blue-500 animate-pulse' :
                'border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{preview.boat}</span>
                    <span className="text-sm text-gray-400">→ {preview.email}</span>
                    {preview.serviceLogUrl ? (
                      <a href={preview.serviceLogUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">📋 Log</a>
                    ) : (
                      <span className="text-xs text-yellow-500">⚠️ No log URL</span>
                    )}
                    {preview.status === 'sent' && <span className="text-green-400 text-sm">✓ Sent</span>}
                    {preview.status === 'failed' && <span className="text-red-400 text-sm">✗ {preview.error}</span>}
                    {preview.status === 'sending' && <span className="text-blue-400 text-sm">Sending...</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {preview.status === 'pending' && (
                      <>
                        <button
                          onClick={() => sendOne(index)}
                          className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm font-medium"
                        >
                          📧 Send
                        </button>
                        <button onClick={() => removePreview(preview.boat)} className="text-gray-500 hover:text-red-400 text-sm">✕</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-1"><strong>Subject:</strong> {preview.subject}</div>
                <div className="text-sm text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto bg-gray-900 rounded p-3 mt-2">
                  {preview.body}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowConfirm(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Confirm Send</h2>
            <p className="text-gray-300 mb-4">
              Send {pendingCount} email{pendingCount !== 1 ? 's' : ''} via <strong>brian@sailorskills.com</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded">Cancel</button>
              <button onClick={sendAll} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded font-medium">Send All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
