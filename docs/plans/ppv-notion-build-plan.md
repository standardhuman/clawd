# PPV System Build Plan — Notion Implementation

*Based on August Bradley's Pillars, Pipelines & Vaults framework*
*Adapted for Brian Cline's AI agent organization*

---

## What We're Building

Five interconnected Notion databases that form the full PPV cascade:

```
┌──────────────┐
│   PILLARS    │  6 life areas (already defined)
└──────┬───────┘
       │ ← linked
┌──────┴───────┐
│ VALUE GOALS  │  Aspirational outcomes per pillar
└──────┬───────┘
       │ ← linked
┌──────┴───────┐
│GOAL OUTCOMES │  Quarterly measurable targets (OKR-style)
└──────┬───────┘
       │ ← linked
┌──────┴───────┐
│   PROJECTS   │  Concrete work packages
└──────┬───────┘
       │ ← linked
┌──────┴───────┐
│   ACTIONS    │  Individual tasks (agent or human)
└──────┴───────┘
```

Plus two support databases:
- **Review Log** — tracks daily/weekly/monthly/quarterly reviews
- **Vaults** (knowledge resources linked to pillars/projects)

---

## Database Schemas

### 1. Pillars
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "🧭 Physical & Emotional Wellbeing" |
| Priority | Number | 1-6 ordering |
| Icon | Text | Emoji |
| Status | Select | Active, Paused, Archived |
| Agents | Multi-select | Howard, Noa, Jacques, etc. |
| Description | Text | What this pillar means |
| Value Goals | Relation → Value Goals | |
| Health | Formula | Rollup from goal outcomes (% on track) |

### 2. Value Goals
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "Build SailorSkills into the go-to hull cleaning platform" |
| Pillar | Relation → Pillars | |
| Timeframe | Select | 2026, Ongoing |
| Status | Select | Active, Achieved, Deferred |
| Goal Outcomes | Relation → Goal Outcomes | |
| Progress | Formula | Rollup from goal outcomes |

### 3. Goal Outcomes (Quarterly OKRs)
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "Add 8 new clients in Q1 2026" |
| Value Goal | Relation → Value Goals | |
| Quarter | Select | Q1 2026, Q2 2026, Q3 2026, Q4 2026 |
| Target | Text | Measurable target |
| Current | Text | Current value |
| Status | Select | Not Started, In Progress, At Risk, Achieved, Missed |
| Owner | Select | Brian, Howard, Jacques, etc. |
| Projects | Relation → Projects | |
| Due Date | Date | End of quarter |

### 4. Projects
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "SailorSkills Pro - Follow-up Tasks" |
| Goal Outcome | Relation → Goal Outcomes | |
| Pillar | Rollup | From Goal Outcome → Value Goal → Pillar |
| Status | Select | Backlog, Active, Blocked, Done, Cancelled |
| Owner | Select | Brian, Howard, Jacques, Marcel, etc. |
| Pipeline | Select | Innovation, Sales, Marketing, Operations, Platform |
| Priority | Select | P0 (Critical), P1 (High), P2 (Medium), P3 (Low) |
| Start Date | Date | |
| Target Date | Date | |
| Actions | Relation → Actions | |
| Progress | Formula | % of actions completed |

### 5. Actions (Tasks)
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "Run migration 029 on Supabase production" |
| Project | Relation → Projects | |
| Status | Select | To Do, In Progress, Blocked, Done |
| Owner | Select | Brian, Howard, Jacques, Marcel, Noa, Kai, etc. |
| Priority | Select | P0, P1, P2, P3 |
| Due Date | Date | |
| Type | Select | Dev, Design, Research, Ops, Communication, Review |
| Notes | Text | |

### 6. Review Log
| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g., "Weekly Review - W8 2026" |
| Type | Select | Daily, Weekly, Monthly, Quarterly |
| Date | Date | |
| Facilitator | Select | Howard, Brian |
| Status | Select | Scheduled, Complete, Skipped |
| Notes | Text | Key decisions, adjustments |
| Alignment Issues | Text | Projects not serving goals |

---

## Initial Data Load

### Pillars (from ~/clawd/docs/pillars.md)
1. 🧭 Physical & Emotional Wellbeing
2. 🤖 AI Agent Team  
3. ⚓ SailorSkills Operations
4. 🚀 SailorSkills Platform
5. 💰 Financial Health
6. 💡 Building the Future

### Value Goals (from pillars.md)
Each pillar has 4-6 value goals already defined.

### Goal Outcomes (NEW — need to define with Brian)
These are the quarterly measurable targets. Examples:
- Q1 2026: File 2024 tax return (Financial Health)
- Q1 2026: Launch SailorSkills Pro Build 42+ with follow-ups (Platform)
- Q1 2026: All 12 agents operational and producing value (AI Team)
- Q1 2026: Strength training 3x/week for 8+ weeks (Wellbeing)
- Q1 2026: 100+ active boat clients (Operations)
- Q1 2026: Marketplace live with 500+ providers (Building the Future)

### Projects (from current work)
Map all active work to the cascade:
- SailorSkills Pro (follow-ups, on-device transcription, report+invoice)
- Marketplace (provider profiles, curation, DNS cutover)
- Mission Control dashboard
- Morning flow routine
- PPV system itself
- Tax filing
- Employee expansion research (paused)
- etc.

### Actions (from summary "Next Steps" + "In Progress")
All current tasks get entered and linked.

---

## Review Rhythm (Automated by Howard)

| Cadence | When | What | Who |
|---------|------|------|-----|
| **Daily** | 7:00 AM | Today's actions, blockers, yesterday's completion | Howard (triage) |
| **Weekly** | Sunday evening | Project status, alignment check, next week priorities | Howard + Brian |
| **Monthly** | 1st of month | Goal outcome progress, course corrections | Howard + Brian |
| **Quarterly** | End of quarter | Value goal review, pillar health, next quarter planning | Brian (Howard facilitates) |

---

## Implementation Steps

1. **Get Notion API access** (token from 1Password)
2. **Create a "PPV" workspace/page** in Brian's Notion
3. **Build the 7 databases** with all properties and relations
4. **Load Pillars + Value Goals** (from existing pillars.md)
5. **Define Q1 2026 Goal Outcomes** (with Brian)
6. **Map current projects** to goal outcomes
7. **Import current actions/tasks** 
8. **Set up review templates** 
9. **Wire Howard's daily triage** to pull from Notion Actions
10. **Create dashboard views** (by pillar, by status, by owner, this week)

---

## Views to Create

### For Brian (Daily Use)
- **Today's Actions** — filtered to current day, grouped by project
- **This Week** — all actions due this week
- **My Projects** — active projects owned by Brian
- **Blocked** — anything blocked across all projects

### For Howard (Operational)
- **All Active Projects** — grouped by pillar
- **Overdue Actions** — past due date
- **Unlinked Projects** — projects not connected to goal outcomes (alignment check)
- **Agent Workload** — actions grouped by owner

### For Reviews
- **Weekly Dashboard** — projects by status, this week's completions
- **Monthly Dashboard** — goal outcomes by status with progress
- **Quarterly Dashboard** — value goals by status, pillar health

---

*This is the full PPV execution engine. Once built, every piece of work traces from daily action → project → goal outcome → value goal → pillar. No orphaned work. No misaligned effort.*
