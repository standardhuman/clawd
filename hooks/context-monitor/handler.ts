import type { HookHandler } from 'clawdbot/hooks';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const STATE_FILE = join(homedir(), '.clawdbot', 'context-monitor-state.json');

interface SessionState {
  lastAlertedThreshold: number;
  acknowledged: boolean;
}

interface MonitorState {
  sessions: Record<string, SessionState>;
  thresholds: number[];
  note: string;
}

const handler: HookHandler = async (event) => {
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  const sessionKey = event.sessionKey;
  
  try {
    if (!existsSync(STATE_FILE)) {
      return;
    }

    const state: MonitorState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    
    // Reset the session's alert state
    state.sessions[sessionKey] = {
      lastAlertedThreshold: 0,
      acknowledged: true
    };
    
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`[context-monitor] Reset alert state for ${sessionKey}`);
  } catch (err) {
    console.error('[context-monitor] Failed to reset state:', err instanceof Error ? err.message : String(err));
  }
};

export default handler;
