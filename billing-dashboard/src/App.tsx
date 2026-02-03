import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface Boat {
  Boat: string;
  Date: string;
  HullTotal: string;
  Anode: string;
  AnodeType: string;
  Total: string;
  email: string | null;
  billed: boolean;
}

interface BillingData {
  month: string;
  boats: Boat[];
  summary: {
    total: number;
    billed: number;
    pending: number;
    amount: string;
  };
}

type FilterType = 'all' | 'ready' | 'noEmail' | 'billed';

function App() {
  const [months, setMonths] = useState<{id: string, name: string}[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [selectedBoats, setSelectedBoats] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingBoat, setSendingBoat] = useState<string | null>(null);
  const [previewBoat, setPreviewBoat] = useState<Boat | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateYear, setGenerateYear] = useState('2026');
  const [generateMonth, setGenerateMonth] = useState('2');
  const [generating, setGenerating] = useState(false);

  const generateBilling = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/generate/${generateYear}/${generateMonth}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Generated ${data.month}: ${data.count} boats` });
        // Reload months list
        const monthsRes = await fetch(`${API_URL}/months`);
        setMonths(await monthsRes.json());
        setShowGenerate(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate billing' });
    }
    setGenerating(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Load months on startup
  useEffect(() => {
    fetch(`${API_URL}/months`)
      .then(r => r.json())
      .then(setMonths)
      .catch(console.error);
    
    fetch(`${API_URL}/stripe-key/status`)
      .then(r => r.json())
      .then(d => setStripeConfigured(d.configured))
      .catch(console.error);
  }, []);

  // Load billing data when month changes
  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    fetch(`${API_URL}/billing/${selectedMonth}`)
      .then(r => r.json())
      .then(data => {
        setBillingData(data);
        setSelectedBoats(new Set());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const configureStripe = async () => {
    if (!stripeKey) return;
    const res = await fetch(`${API_URL}/stripe-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: stripeKey })
    });
    if (res.ok) {
      setStripeConfigured(true);
      setStripeKey('');
      setMessage({ type: 'success', text: 'Stripe key configured' });
    } else {
      setMessage({ type: 'error', text: 'Invalid Stripe key' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const sendInvoice = async (boat: Boat) => {
    if (!stripeConfigured || !boat.email) return;
    
    setSendingBoat(boat.Boat);
    try {
      const monthName = months.find(m => m.id === selectedMonth)?.name || selectedMonth;
      const res = await fetch(`${API_URL}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boat: boat.Boat,
          hull: boat.HullTotal,
          anode: boat.Anode,
          anodeType: boat.AnodeType,
          total: boat.Total,
          email: boat.email,
          month: monthName
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update local state
        setBillingData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            boats: prev.boats.map(b => 
              b.Boat === boat.Boat ? { ...b, billed: true } : b
            ),
            summary: {
              ...prev.summary,
              billed: prev.summary.billed + 1,
              pending: prev.summary.pending - 1
            }
          };
        });
        setSelectedBoats(prev => {
          const next = new Set(prev);
          next.delete(boat.Boat);
          return next;
        });
        setMessage({ type: 'success', text: `${boat.Boat}: ${data.status === 'charged' ? 'Charged' : 'Invoice sent'}` });
      } else {
        setMessage({ type: 'error', text: `${boat.Boat}: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `${boat.Boat}: Failed to send` });
    }
    setSendingBoat(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const sendSelected = async () => {
    if (!billingData) return;
    const toSend = billingData.boats.filter(b => 
      selectedBoats.has(b.Boat) && !b.billed && b.email
    );
    
    for (const boat of toSend) {
      await sendInvoice(boat);
      await new Promise(r => setTimeout(r, 500)); // Small delay between sends
    }
  };

  const filteredBoats = billingData?.boats.filter(b => {
    switch (filter) {
      case 'ready': return !b.billed && b.email;
      case 'noEmail': return !b.email;
      case 'billed': return b.billed;
      default: return true;
    }
  }) || [];

  const readyBoats = filteredBoats.filter(b => !b.billed && b.email);
  const selectedReadyCount = [...selectedBoats].filter(name => 
    readyBoats.some(b => b.Boat === name)
  ).length;

  const toggleSelectAll = () => {
    if (selectedReadyCount === readyBoats.length) {
      setSelectedBoats(new Set());
    } else {
      setSelectedBoats(new Set(readyBoats.map(b => b.Boat)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SailorSkills Billing</h1>
        
        {/* Stripe Key Config */}
        {!stripeConfigured && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 mb-2">Stripe key required</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="rk_live_... or sk_live_..."
                value={stripeKey}
                onChange={e => setStripeKey(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2"
              />
              <button
                onClick={configureStripe}
                className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded"
              >
                Configure
              </button>
            </div>
          </div>
        )}
        
        {/* Message Toast */}
        {message && (
          <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Month Selector & Summary */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
          >
            <option value="">Select month...</option>
            {months.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowGenerate(true)}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm"
          >
            + Generate Month
          </button>
          
          {billingData && (
            <div className="flex gap-6 text-sm">
              <span className="text-gray-400">
                Total: <span className="text-white font-medium">{billingData.summary.total} boats</span>
              </span>
              <span className="text-gray-400">
                Amount: <span className="text-white font-medium">${billingData.summary.amount}</span>
              </span>
              <span className="text-green-400">
                Billed: {billingData.summary.billed}
              </span>
              <span className="text-yellow-400">
                Pending: {billingData.summary.pending}
              </span>
            </div>
          )}
        </div>
        
        {/* Filters & Actions */}
        {billingData && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(['all', 'ready', 'noEmail', 'billed'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === f 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'ready' ? 'Ready' : f === 'noEmail' ? 'No Email' : 'Billed'}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {selectedReadyCount > 0 && (
                <button
                  onClick={sendSelected}
                  disabled={!stripeConfigured || sendingBoat !== null}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-4 py-2 rounded"
                >
                  Send {selectedReadyCount} Selected
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Billing Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : billingData ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedReadyCount === readyBoats.length && readyBoats.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left">Boat</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-right">Hull</th>
                  <th className="p-3 text-right">Anode</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoats.map(boat => (
                  <tr 
                    key={boat.Boat} 
                    className={`border-t border-gray-700 hover:bg-gray-750 ${
                      sendingBoat === boat.Boat ? 'bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedBoats.has(boat.Boat)}
                        onChange={e => {
                          const next = new Set(selectedBoats);
                          if (e.target.checked) next.add(boat.Boat);
                          else next.delete(boat.Boat);
                          setSelectedBoats(next);
                        }}
                        disabled={boat.billed || !boat.email}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 font-medium">
                      <button 
                        onClick={() => setPreviewBoat(boat)}
                        className="hover:text-blue-400"
                      >
                        {boat.Boat}
                      </button>
                    </td>
                    <td className="p-3 text-gray-400">{boat.Date}</td>
                    <td className="p-3 text-right">${boat.HullTotal}</td>
                    <td className="p-3 text-right text-gray-400">
                      {parseFloat(boat.Anode) > 0 ? `$${boat.Anode}` : '-'}
                    </td>
                    <td className="p-3 text-right font-medium">${boat.Total}</td>
                    <td className="p-3 text-sm">
                      {boat.email || <span className="text-red-400">Missing</span>}
                    </td>
                    <td className="p-3 text-center">
                      {boat.billed ? (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-green-600">Billed</span>
                      ) : boat.email ? (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-600">Pending</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-gray-600">No Email</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {!boat.billed && boat.email && (
                        <button
                          onClick={() => sendInvoice(boat)}
                          disabled={!stripeConfigured || sendingBoat !== null}
                          className="text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-3 py-1 rounded"
                        >
                          {sendingBoat === boat.Boat ? 'Sending...' : 'Send'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Select a month to view billing data
          </div>
        )}
        
        {/* Generate Month Modal */}
        {showGenerate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowGenerate(false)}>
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Generate Monthly Billing</h2>
              <p className="text-gray-400 text-sm mb-4">
                Pulls boats from Notion where Plan is "Subbed" or "One-time" and service date is in the selected month.
              </p>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Month</label>
                  <select
                    value={generateMonth}
                    onChange={e => setGenerateMonth(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-sm text-gray-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={generateYear}
                    onChange={e => setGenerateYear(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <p className="text-yellow-400 text-sm mb-4">
                ⚠️ Growth surcharges not included — edit CSV after generating
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerate(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={generateBilling}
                  disabled={generating}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 py-2 rounded"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Preview Modal */}
        {previewBoat && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewBoat(null)}>
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Invoice Preview</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Vessel</span>
                  <span className="font-medium">{previewBoat.Boat}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Service Date</span>
                  <span>{months.find(m => m.id === selectedMonth)?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Customer Email</span>
                  <span>{previewBoat.email || <span className="text-red-400">Missing</span>}</span>
                </div>
                
                <div className="bg-gray-700 rounded p-4 mt-4">
                  <div className="flex justify-between py-1">
                    <span>Hull Cleaning - {previewBoat.Boat}</span>
                    <span>${previewBoat.HullTotal}</span>
                  </div>
                  {parseFloat(previewBoat.Anode) > 0 && (
                    <div className="flex justify-between py-1">
                      <span>Anode: {previewBoat.AnodeType}</span>
                      <span>${previewBoat.Anode}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-600 mt-2 font-bold">
                    <span>Total</span>
                    <span>${previewBoat.Total}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPreviewBoat(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded"
                >
                  Close
                </button>
                {!previewBoat.billed && previewBoat.email && (
                  <button
                    onClick={() => { sendInvoice(previewBoat); setPreviewBoat(null); }}
                    disabled={!stripeConfigured || sendingBoat !== null}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 py-2 rounded"
                  >
                    Send Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
