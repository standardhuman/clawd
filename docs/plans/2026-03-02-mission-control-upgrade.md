# Mission Control Upgrade Plan

*Inspired by Alex Finn's Mission Control — adapted for our org*

**Date:** March 2, 2026
**Status:** Planning

---

## Vision

Upgrade our dashboard (team.briancline.co) from a static crew page into a full Mission Control — a unified control surface for Brian to see, manage, and direct the entire AI organization. Combined with increased cron density and reverse prompting, this turns the team from reactive to proactive.

---

## Phase 1: Foundation (This Week)

### 1A. Reverse Prompting in Dawn Patrol
- Add a section where Howard proposes the day's #1 focus based on all available context
- Not just triage — a genuine recommendation with reasoning
- "Based on yesterday's work, today's calendar, open projects, and deadlines, here's where I think you should spend your time"

### 1B. Cron Density — Fill the Dead Zones
Current schedule has gaps: nothing 7am-noon, nothing noon-6:30pm.

**Add:**
- **10:00 AM — Progress Pulse**: Quick scan of active agent sessions. Any stuck tasks? Any completions to report? Silent if nothing to say.
- **2:00 PM — Afternoon Checkpoint**: Memory capture of morning work. What happened since Dawn Patrol? Write it to daily notes before context fades.
- **5:00 PM — Pre-Debrief Staging**: Collect data for Evening Debrief so the 6:30 run is richer. Also trigger any agents to flush their session memories.

**Why this fixes the memory/docs gap:** Each checkpoint is a forced write point. Instead of relying on agents to voluntarily update memory (they often don't mid-session), we schedule it.

### 1C. Memory Maintenance Cron
- **Daily doc freshness check**: Scan key docs (MEMORY.md, Obsidian vault, HANDOFF.md files) for staleness
- Flag anything not updated in >7 days that should be current
- Auto-update Obsidian docs that can be derived from other sources (e.g., tax overview from tax doc folder)

---

## Phase 2: Dashboard Upgrade (Next Week)

Rebuild team.briancline.co as a proper Mission Control. Keep the nautical theme but add real functionality.

### Pages to Build:

**Tasks** (Kanban)
- Columns: Backlog / In Progress / Review / Done
- Cards show: task name, assigned agent, priority, age
- Live activity feed sidebar showing recent agent actions
- "New Task" button that creates a task and dispatches to the right agent

**Calendar**
- Weekly grid view of all cron jobs
- Color-coded by type (research, memory, briefing, maintenance)
- Shows next-run time for each job
- Visual density indicator — immediately see gaps

**Projects**
- Cards for each active project (Pro App, Marketplace, Billing Dashboard, Detailing Site, Blisscapes, TMC, etc.)
- Completion %, assigned lead, status badge (Active/Planning/Blocked)
- Click into project for recent activity and linked docs

**Memory**
- Daily journal browser (left sidebar: date list, main area: day's content)
- Long-term memory viewer (searchable MEMORY.md)
- Staleness indicators — highlights stale sections
- "Last updated" timestamps throughout

**Docs**
- Searchable index of ~/clawd/docs/ and Obsidian vault
- Tags/categories (Plans, Cases, Architecture, Research, Tax, etc.)
- Quick preview on click

**Team**
- Current crew page but enhanced with:
  - Live status per agent (idle/working/errored)
  - Current task assignment
  - Token usage today
  - Role cards with skill tags (like Alex's)

**System**
- Gateway status
- Model configuration
- Cron job status (running/failed/next-run)
- Cost tracking (daily/weekly/monthly token spend)
- Disk usage, session counts

### Nice-to-Haves (Phase 2.5):

**Council**
- Multi-model deliberation tool
- Send a question to Claude + DeepSeek + Kimi, compare responses
- Useful for strategy, architecture, legal questions
- Opt-in, not automatic

**Radar**
- Noa's research briefs displayed as a trend feed
- Kai's strategy pitches in a timeline
- Filterable by topic, date, relevance

**Approvals**
- Queue of items waiting for Brian's sign-off
- External comms (emails, social posts) drafted by agents
- Code deploys pending review
- Financial decisions

---

## Phase 3: Documentation Auto-Maintenance

The real gap isn't missing dashboards — it's that our docs and memory drift out of date because updates depend on agents remembering to do it.

### Automated Doc Maintenance:

1. **HANDOFF.md freshness**: Cron checks all HANDOFF.md files across agent workspaces. If any are >3 days old and the agent has had sessions since, flag for update.

2. **Obsidian vault sync**: After any agent creates a doc in ~/clawd/docs/ that's human-readable, auto-copy to Obsidian vault (the Obsidian-First Rule, but enforced by automation not just convention).

3. **MEMORY.md gardening**: Weekly cron that reads MEMORY.md, checks for outdated sections (resolved issues still listed as open, completed tasks still in "next steps"), and proposes edits.

4. **Project status reconciliation**: Weekly check that project status in the dashboard matches reality (compare git activity, recent sessions, deploy logs).

5. **Agent workspace health**: Monthly scan of all 13 agent workspaces for: missing IDENTITY.md, stale MEMORY.md, orphaned files, workspace size.

---

## Technical Approach

- **URL:** dashboard.briancline.co (currently redirects to Mac Mini via Tailscale)
- **Framework:** React + Vite + Tailwind (Marcel's standard stack)
- **Data source:** OpenClaw gateway API for agent status, cron jobs, sessions. Local filesystem for docs/memory. Git for project activity.
- **Backend:** Lightweight Express API on the Mac Mini (like billing dashboard) that aggregates data sources
- **Auth:** Tailscale-gated (same as billing dashboard)
- **Team org chart:** Integrated as a page within the dashboard (not separate at team.briancline.co)
- **Marcel builds it** — it's a web app, it's his domain
- **Style:** Dark theme, similar feel to Alex's Mission Control — clean, functional, information-dense

---

## Implementation Order

| Step | What | Who | When |
|------|------|-----|------|
| 1 | Reverse prompting in Dawn Patrol | Howard | Tomorrow |
| 2 | Add 3 midday cron jobs | Howard | Tomorrow |
| 3 | Memory maintenance cron | Howard | This week |
| 4 | Dashboard spec for Marcel | Reese | This week |
| 5 | Dashboard build Phase 2 | Marcel | Next week |
| 6 | Council prototype | Howard/Kai | Week of Mar 10 |
| 7 | Doc auto-maintenance crons | Howard | Week of Mar 10 |
| 8 | Dashboard Phase 2.5 | Marcel | Week of Mar 17 |

---

## Cost Considerations

- 3 new midday crons: ~$2-5/day additional (lightweight, short timeouts)
- Memory maintenance cron: ~$1/day
- Dashboard backend: $0 (runs on Mac Mini)
- Council queries: ~$0.50-1 per deliberation (3 models × 1 query)
- Total estimated increase: ~$5-8/day ($150-240/month)

Current spend: ~$18/day ($550/month). New total: ~$23-26/day ($700-790/month).

Worth it if it meaningfully improves output quality and Brian's situational awareness.
