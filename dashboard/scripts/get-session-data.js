#!/usr/bin/env node

/**
 * Helper script to get OpenClaw session data
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function getSessionData() {
  try {
    // Get session data from OpenClaw CLI
    const cmd = 'openclaw sessions list --json';
    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);
    
    return data.sessions;
  } catch (error) {
    console.error('Error getting session data:', error.message);
    
    // Fallback: read from session store directly
    try {
      const sessionFile = path.join(process.env.HOME, '.openclaw/agents/main/sessions/sessions.json');
      const content = await fs.readFile(sessionFile, 'utf8');
      const data = JSON.parse(content);
      return Object.values(data);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      return [];
    }
  }
}

async function getAgentCosts(sessions) {
  // Model costs from config
  const modelCosts = {
    'claude-opus-4-6': { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
    'claude-sonnet-4-20250514': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    'claude-sonnet-4-5-20250514': { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    'deepseek-chat': { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28 },
    'deepseek-reasoner': { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28 },
    'moonshotai/kimi-k2.5': { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  };
  
  // Calculate costs for this month (February 2026)
  const now = new Date();
  const monthStart = new Date(2026, 1, 1); // February 1, 2026
  const monthEnd = new Date(2026, 2, 0); // February 28, 2026
  
  let totalCost = 0;
  const modelBreakdown = {};
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.updatedAt);
    
    // Only count sessions from this month
    if (sessionDate >= monthStart && sessionDate <= monthEnd) {
      const model = session.model;
      const inputTokens = session.inputTokens || 0;
      const outputTokens = session.outputTokens || 0;
      
      if (model && modelCosts[model]) {
        const costs = modelCosts[model];
        const cost = (inputTokens / 1000000) * costs.input + 
                    (outputTokens / 1000000) * costs.output;
        
        totalCost += cost;
        
        if (!modelBreakdown[model]) {
          modelBreakdown[model] = { cost: 0, inputTokens: 0, outputTokens: 0 };
        }
        modelBreakdown[model].cost += cost;
        modelBreakdown[model].inputTokens += inputTokens;
        modelBreakdown[model].outputTokens += outputTokens;
      }
    }
  });
  
  return {
    total: Math.round(totalCost * 100) / 100,
    breakdown: modelBreakdown
  };
}

async function getRecentActivity(sessions) {
  // Get recent sessions (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  const recentSessions = sessions
    .filter(s => new Date(s.updatedAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20); // Limit to 20 most recent
  
  // Map session keys to agent names
  const agentMap = {
    'agent:main:main': 'Howard',
    'agent:main:subagent': 'Subagent',
    'agent:main:cron': 'Cron Job',
    'agent:jacques': 'Jacques',
    'agent:marcel': 'Marcel'
  };
  
  const activities = [];
  
  recentSessions.forEach(session => {
    let agent = 'Unknown';
    let activity = '';
    
    // Determine agent from session key
    for (const [key, name] of Object.entries(agentMap)) {
      if (session.key.includes(key)) {
        agent = name;
        break;
      }
    }
    
    // Special handling for subagents
    if (session.key.includes('subagent')) {
      agent = 'Subagent';
    }
    
    // Determine activity type
    if (session.key.includes('cron')) {
      activity = 'Scheduled task';
    } else if (session.key.includes('slack')) {
      activity = 'Slack conversation';
    } else if (session.key.includes('telegram')) {
      activity = 'Telegram conversation';
    } else {
      activity = 'Direct session';
    }
    
    // Calculate time ago
    const sessionTime = new Date(session.updatedAt);
    const diffMs = now - sessionTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let timeAgo;
    if (diffHours < 1) {
      timeAgo = 'just now';
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    activities.push({
      agent,
      activity,
      timeAgo,
      timestamp: session.updatedAt,
      tokens: session.totalTokens || 0,
      model: session.model || 'unknown'
    });
  });
  
  return activities;
}

// Export for use in collect-data.js
module.exports = {
  getSessionData,
  getAgentCosts,
  getRecentActivity
};