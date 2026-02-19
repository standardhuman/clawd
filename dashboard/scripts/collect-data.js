#!/usr/bin/env node
/**
 * Dashboard Data Collection — merges real-time agent/cost data with curated static data.
 * 
 * Static data (projects, todos, needsAttention, deadlines, sprintProgress) lives in
 * data-curated.json and is maintained by hand or by Howard.
 * 
 * Dynamic data (agents, costs, activity) is computed from OpenClaw session transcripts.
 * 
 * Runs every 15 minutes via Marcel's cron job.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(DATA_DIR, 'data.json');
const CURATED_FILE = path.join(DATA_DIR, 'data-curated.json');
const BACKUP_FILE = path.join(DATA_DIR, 'data-backup.json');
const SESSIONS_DIR = path.join(require('os').homedir(), '.openclaw', 'agents');

// Model pricing per million tokens
const MODEL_COSTS = {
  'claude-opus-4-6':        { input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 6.25 },
  'claude-opus-4-5':        { input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 6.25 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75 },
  'claude-sonnet-4-5-20250514': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75 },
  'deepseek-chat':          { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28 },
  'deepseek-reasoner':      { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28 },
  'moonshotai/kimi-k2.5':   { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
};

// Anthropic plan config
const ANTHROPIC = {
  plan: 'Max 20X',
  monthlyCost: 200,  // $200/mo for 20X Max plan
  // If ANTHROPIC_ADMIN_KEY is set, we can pull real API usage from their admin endpoint.
  // Otherwise we estimate from session transcripts.
  adminKey: process.env.ANTHROPIC_ADMIN_KEY || null,
};

// Infrastructure costs (static, update when subscriptions change)
const INFRA_COSTS = {
  hosting: [
    { name: 'Anthropic Max 20X', cost: 200, detail: 'Claude subscription (OAuth token)' },
    { name: 'Vercel Pro', cost: 20, detail: 'Hosting & deployments' },
    { name: 'Supabase', cost: 25, detail: 'Database & auth' },
    { name: 'Domains', cost: 41, detail: 'Annual renewals (amortized)' },
  ],
  services: [
    { name: 'Stripe', cost: 32, detail: 'Payment processing fees' },
    { name: 'Resend', cost: 18, detail: 'Email API' },
    { name: '1Password', cost: 8, detail: 'Family plan' },
    { name: 'Brave Search', cost: 5, detail: 'API credits' },
  ],
};

const AGENT_META = {
  main:    { name: 'Howard', emoji: '🪨', role: 'Chief of Staff', team: 'Core Team', station: 'Helm' },
  jacques: { name: 'Jacques', emoji: '🤿', role: 'Dev Partner', team: 'Core Team', station: 'Deck' },
  marcel:  { name: 'Marcel', emoji: '🎨', role: 'Creative Director', team: 'Core Team', station: 'Workshop' },
};

// Scheduled + on-demand agents (no session data, show as standby)
const EXTRA_AGENTS = [
  { name: 'Noa', emoji: '🔍', role: 'Research Analyst', team: 'Scheduled Crew', station: "Crow's Nest" },
  { name: 'Kai', emoji: '💡', role: 'Strategist', team: 'Scheduled Crew', station: 'Chart Room' },
  { name: 'Blake', emoji: '🧪', role: 'QA Specialist', team: 'On-Demand', station: 'Engine Room' },
  { name: 'Quinn', emoji: '📊', role: 'Ops & Finance', team: 'On-Demand', station: 'Supply Hold' },
  { name: 'Sage', emoji: '🤝', role: 'Sales', team: 'On-Demand', station: 'Gangway' },
  { name: 'Milo', emoji: '📣', role: 'Marketing', team: 'On-Demand', station: 'Main Deck' },
  { name: 'Reese', emoji: '🎯', role: 'Product Manager', team: 'On-Demand', station: 'Drafting Table' },
  { name: 'Avery', emoji: '⚖️', role: 'Legal', team: 'On-Demand', station: "Captain's Quarters" },
  { name: 'Cyrus', emoji: '🔒', role: 'Security', team: 'On-Demand', station: 'Stern' },
];

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function parseSessionTranscripts() {
  const monthStart = getMonthStart();
  const costsByModel = {};
  const costsByAgent = {};
  const tokensByAgent = {};
  const lastActiveByAgent = {};
  const recentMessages = [];
  const lastTaskByAgent = {};
  const sessionCountByAgent = {};
  let totalCost = 0;

  for (const agentId of Object.keys(AGENT_META)) {
    const sessDir = path.join(SESSIONS_DIR, agentId, 'sessions');
    costsByAgent[agentId] = 0;
    tokensByAgent[agentId] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 };
    lastActiveByAgent[agentId] = 0;
    lastTaskByAgent[agentId] = null;
    sessionCountByAgent[agentId] = 0;

    let files;
    try { files = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl')); } 
    catch { continue; }

    // Count sessions this month
    const monthStartDate = new Date(getMonthStart());
    for (const f of files) {
      try {
        const stat = fs.statSync(path.join(sessDir, f));
        if (stat.mtime >= monthStartDate) sessionCountByAgent[agentId]++;
      } catch {}
    }

    for (const file of files) {
      const filepath = path.join(sessDir, file);
      let content;
      try { content = fs.readFileSync(filepath, 'utf8'); } catch { continue; }

      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        let d;
        try { d = JSON.parse(line); } catch { continue; }

        const msg = d.message || {};
        const ts = msg.timestamp || d.timestamp;
        if (!ts || (typeof ts === 'number' && ts < monthStart)) continue;
        const tsMs = typeof ts === 'number' ? ts : new Date(ts).getTime();
        if (tsMs < monthStart) continue;

        // Track last activity
        if (tsMs > lastActiveByAgent[agentId]) {
          lastActiveByAgent[agentId] = tsMs;
        }

        const usage = msg.usage || {};
        const cost = usage.cost || {};
        if (cost.total) {
          const model = msg.model || 'unknown';
          costsByModel[model] = (costsByModel[model] || 0) + cost.total;
          costsByAgent[agentId] += cost.total;
          totalCost += cost.total;

          for (const k of ['input', 'output', 'cacheRead', 'cacheWrite']) {
            tokensByAgent[agentId][k] += usage[k] || 0;
          }
          tokensByAgent[agentId].total += usage.totalTokens || 0;
        }

        // Track last user message as current task
        if (msg.role === 'user' && tsMs > (lastTaskByAgent[agentId]?.ts || 0)) {
          const text = typeof msg.content === 'string' ? msg.content : 
            (msg.content || []).find(c => c.type === 'text')?.text || '';
          if (text.length > 5 && !text.startsWith('[System') && !text.startsWith('HEARTBEAT') && !text.startsWith('[cron:') && !text.startsWith('System:') && !text.match(/^\[.*\d{4}-\d{2}-\d{2}/)) {
            lastTaskByAgent[agentId] = { text: text.slice(0, 80), ts: tsMs };
          }
        }

        // Collect recent assistant messages for activity feed
        if (msg.role === 'assistant' && tsMs > Date.now() - 86400000 * 3) {
          const preview = (msg.content || []).find(c => c.type === 'text');
          if (preview && preview.text && preview.text.length > 10) {
            recentMessages.push({
              agent: agentId,
              text: preview.text.slice(0, 100),
              timestamp: tsMs,
              model: msg.model,
            });
          }
        }
      }
    }
  }

  return { costsByModel, costsByAgent, tokensByAgent, lastActiveByAgent, totalCost, recentMessages, lastTaskByAgent, sessionCountByAgent };
}

function getDeepSeekBalance() {
  try {
    const result = execSync(
      'curl -s https://api.deepseek.com/user/balance -H "Authorization: Bearer ***REDACTED_DEEPSEEK_KEY***"',
      { timeout: 5000, encoding: 'utf8' }
    );
    const data = JSON.parse(result);
    return parseFloat(data.balance_infos?.[0]?.total_balance || '0');
  } catch { return null; }
}

function formatRelativeTime(tsMs) {
  if (!tsMs) return 'never';
  const delta = Date.now() - tsMs;
  if (delta < 60000) return 'just now';
  if (delta < 3600000) return `${Math.round(delta / 60000)}m ago`;
  if (delta < 86400000) return `${Math.round(delta / 3600000)}h ago`;
  return `${Math.round(delta / 86400000)}d ago`;
}

function buildAgentData(parsed) {
  const agents = [];

  // Core agents with real data
  for (const [agentId, meta] of Object.entries(AGENT_META)) {
    const cost = parsed.costsByAgent[agentId] || 0;
    const tokens = parsed.tokensByAgent[agentId] || {};
    const lastActive = parsed.lastActiveByAgent[agentId] || 0;
    const isActive = lastActive > Date.now() - 300000; // 5 min

    const agentNameLower = meta.name.toLowerCase();
    agents.push({
      ...meta,
      avatar: `/avatars/${agentNameLower}-robot-v2.png`,
      status: isActive ? 'active' : 'standby',
      costThisMonth: Math.round(cost * 100) / 100,
      totalTokens: tokens.total || 0,
      lastActive: formatRelativeTime(lastActive),
      lastActiveTs: lastActive,
      currentTask: parsed.lastTaskByAgent[agentId]?.text || 'Awaiting orders',
      tasksCompleted: parsed.sessionCountByAgent[agentId] || 0,
      productivity: lastActive > 0 ? Math.min(99, Math.round(50 + (tokens.total || 0) / 10000000)) : 0,
      team: meta.team,
      station: meta.station,
    });
  }

  // Subagent costs (Noa, Kai, etc. run as main subagents)
  // Their costs are included in main's total. We can't easily separate yet.
  for (const extra of EXTRA_AGENTS) {
    const agentNameLower = extra.name.toLowerCase();
    agents.push({
      ...extra,
      avatar: `/avatars/${agentNameLower}-robot-v2.png`,
      status: 'standby',
      costThisMonth: 0,
      totalTokens: 0,
      lastActive: 'standby',
      lastActiveTs: 0,
      currentTask: 'Awaiting orders',
      tasksCompleted: 0,
      productivity: 0,
    });
  }

  return agents;
}

function buildApiCosts(parsed) {
  const models = [];
  for (const [model, cost] of Object.entries(parsed.costsByModel).sort((a, b) => b[1] - a[1])) {
    models.push({
      name: model,
      cost: Math.round(cost * 100) / 100,
      percent: parsed.totalCost > 0 ? Math.round((cost / parsed.totalCost) * 100) : 0,
    });
  }
  return models;
}

function getAnthropicApiUsage() {
  // If we have an admin API key, pull real usage from Anthropic
  if (!ANTHROPIC.adminKey) return null;
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const result = execSync(
      `curl -s "https://api.anthropic.com/v1/organizations/usage?start_date=${monthStart}" ` +
      `-H "x-api-key: ${ANTHROPIC.adminKey}" -H "anthropic-version: 2023-06-01"`,
      { timeout: 10000, encoding: 'utf8' }
    );
    const data = JSON.parse(result);
    if (data.error) return null;
    return data;
  } catch { return null; }
}

function buildOrganization(parsed, agents) {
  // Separate Anthropic (estimated from transcripts) vs other API costs
  const anthropicModels = ['claude-opus-4-6', 'claude-opus-4-5', 'claude-sonnet-4-20250514', 'claude-sonnet-4-5-20250514'];
  let anthropicApiEquivalent = 0;
  let otherApiCost = 0;

  for (const [model, cost] of Object.entries(parsed.costsByModel)) {
    if (anthropicModels.some(m => model.includes(m.replace('claude-', '')))) {
      anthropicApiEquivalent += cost;
    } else {
      otherApiCost += cost;
    }
  }

  anthropicApiEquivalent = Math.round(anthropicApiEquivalent * 100) / 100;
  otherApiCost = Math.round(otherApiCost * 100) / 100;

  // Check if we have real Anthropic API usage data
  const anthropicApiUsage = getAnthropicApiUsage();

  const totalInfra = INFRA_COSTS.hosting.reduce((s, i) => s + i.cost, 0) +
                     INFRA_COSTS.services.reduce((s, i) => s + i.cost, 0);

  // Actual cost = Max plan + other APIs + infra
  const actualTotal = ANTHROPIC.monthlyCost + otherApiCost + totalInfra;
  // API-equivalent = what we'd pay on Anthropic API + other APIs + infra (minus Max plan)
  const apiEquivInfra = totalInfra - ANTHROPIC.monthlyCost; // remove Max from infra for this calc
  const apiEquivTotal = anthropicApiEquivalent + otherApiCost + apiEquivInfra +
    INFRA_COSTS.services.reduce((s, i) => s + i.cost, 0) +
    INFRA_COSTS.hosting.filter(h => h.name !== 'Anthropic Max 20X').reduce((s, i) => s + i.cost, 0);

  return {
    monthlyCosts: {
      // What we're actually paying
      actual: Math.round(actualTotal * 100) / 100,
      // What it would cost on Anthropic API instead of Max
      apiEquivalent: Math.round((anthropicApiEquivalent + otherApiCost +
        INFRA_COSTS.hosting.filter(h => h.name !== 'Anthropic Max 20X').reduce((s, i) => s + i.cost, 0) +
        INFRA_COSTS.services.reduce((s, i) => s + i.cost, 0)) * 100) / 100,
      infrastructure: totalInfra,
      target: 500,
    },
    anthropic: {
      plan: ANTHROPIC.plan,
      planCost: ANTHROPIC.monthlyCost,
      apiEquivalentUsage: anthropicApiEquivalent,
      savings: Math.round((anthropicApiEquivalent - ANTHROPIC.monthlyCost) * 100) / 100,
      // Real API usage if available (for when using API key)
      apiUsage: anthropicApiUsage,
      source: anthropicApiUsage ? 'api' : 'transcript-estimate',
    },
    otherApis: {
      deepseek: {
        cost: Math.round((parsed.costsByModel['deepseek-chat'] || 0) * 100) / 100,
        balance: getDeepSeekBalance(),
      },
      kimi: { cost: 0, note: 'Free via NVIDIA' },
      gemini: { cost: 0, note: 'Free tier (image model)' },
    },
    costsByModel: buildApiCosts(parsed),
    costsByAgent: Object.entries(parsed.costsByAgent).map(([id, cost]) => ({
      agent: AGENT_META[id]?.name || id,
      cost: Math.round(cost * 100) / 100,
    })).sort((a, b) => b.cost - a.cost),
    infrastructure: INFRA_COSTS,
  };
}

function buildRecentActivity(parsed) {
  // Sort by timestamp, take last 20
  return parsed.recentMessages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
    .map(m => ({
      icon: AGENT_META[m.agent]?.emoji || '🔧',
      text: `${AGENT_META[m.agent]?.name || m.agent}: ${m.text.replace(/\n/g, ' ').slice(0, 80)}`,
      time: formatRelativeTime(m.timestamp),
      agent: AGENT_META[m.agent]?.name || m.agent,
    }));
}

function main() {
  console.log('Collecting real data from session transcripts...');
  const parsed = parseSessionTranscripts();
  console.log(`Found $${parsed.totalCost.toFixed(2)} in API costs across ${Object.keys(parsed.costsByModel).length} models`);

  // Load curated static data
  let curated = {};
  try {
    curated = JSON.parse(fs.readFileSync(CURATED_FILE, 'utf8'));
    console.log('Loaded curated data');
  } catch (e) {
    console.warn('No curated data file found, dynamic data only');
  }

  // Build dynamic data
  const agents = buildAgentData(parsed);
  const organization = buildOrganization(parsed, agents);
  const recentActivity = buildRecentActivity(parsed);

  // Merge: curated static fields + dynamic computed fields
  const data = {
    // Static (from data-curated.json, maintained by hand)
    lastUpdated: new Date().toISOString(),
    needsAttention: curated.needsAttention || [],
    sprintProgress: curated.sprintProgress || {},
    projects: curated.projects || [],
    todos: curated.todos || {},
    timeAllocation: curated.timeAllocation || [],
    deadlines: curated.deadlines || [],

    // Dynamic (computed from session transcripts)
    agents,
    organization,
    recentActivity,
    billing: {
      subscriptions: [
        ...INFRA_COSTS.hosting.map(i => ({ name: i.name, cost: i.cost, period: 'monthly', status: 'active' })),
        ...INFRA_COSTS.services.map(i => ({ name: i.name, cost: i.cost, period: 'monthly', status: 'active' })),
      ],
      monthlySummary: {
        actual: organization.monthlyCosts.actual,
        apiEquivalent: organization.monthlyCosts.apiEquivalent,
        anthropicPlan: organization.anthropic.planCost,
        anthropicApiEquiv: organization.anthropic.apiEquivalentUsage,
        anthropicSavings: organization.anthropic.savings,
        otherApis: organization.otherApis.deepseek.cost,
        infrastructure: organization.monthlyCosts.infrastructure,
      },
    },

    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '3.0',
      source: 'Real data from session transcripts + curated static data',
    },
  };

  // Backup current
  try {
    const existing = fs.readFileSync(OUTPUT_FILE, 'utf8');
    fs.writeFileSync(BACKUP_FILE, existing);
  } catch {}

  // Write
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Written to ${OUTPUT_FILE}`);
  console.log(`Actual cost: $${organization.monthlyCosts.actual}/mo (Max $${organization.anthropic.planCost} + $${organization.otherApis.deepseek.cost} DeepSeek + $${organization.monthlyCosts.infrastructure - ANTHROPIC.monthlyCost} other infra)`);
  console.log(`API-equivalent: $${organization.monthlyCosts.apiEquivalent}/mo (saving $${organization.anthropic.savings} vs API pricing)`);
  if (organization.anthropic.source === 'api') console.log('Anthropic usage: from API (real)');
  else console.log('Anthropic usage: estimated from session transcripts');
}

main();
