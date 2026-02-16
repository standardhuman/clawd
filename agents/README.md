# Agent Roster

## How to invoke sub-agents

Howard can spawn any sub-agent using `sessions_spawn` with their persona file read as context.

**Pattern:** "Read ~/clawd/agents/{name}/PERSONA.md and follow its instructions. Then: {task}"

## Active Agents

### Scheduled (Cron)
| Agent | Role | Schedule | Output |
|-------|------|----------|--------|
| **Noa** 🔍 | Research Analyst | Midnight daily | `~/clawd/reports/YYYY-MM-DD-research.md` |
| **Kai** 💡 | Strategist | 6:30am daily | `~/clawd/reports/YYYY-MM-DD-pitch.md` + Telegram announce |

### On-Demand (Spawned by Howard)
| Agent | Role | When to use |
|-------|------|-------------|
| **Blake** 🔍 | QA | Code/content review before shipping |
| **Quinn** 📊 | Ops & Finance | Invoicing, financial summaries, compliance deadlines |
| **Sage** 🤝 | Sales & Client Relations | Lead qualification, proposals, onboarding |
| **Milo** 📢 | Marketing & Growth | Content, SEO, distribution, campaigns |
| **Reese** 📋 | Product Manager | Feature specs, roadmap, user research synthesis |
| **Avery** ⚖️ | Legal & Compliance | Contract review, regulatory, risk assessment |
| **Cyrus** 🛡️ | Security | Security audits, infrastructure review, incident response |

### Core Team (Full agents with own workspaces)
| Agent | Role | Workspace |
|-------|------|-----------|
| **Howard** 🪨 | Chief of Staff | ~/clawd |
| **Jacques** 🤿 | Dev Partner | ~/clawd-jacques |
| **Marcel** 🎨 | Creative Director | ~/clawd-marcel |

## Pipelines

### Innovation Pipeline
Noa (research) → Kai (strategy pitch) → Brian (approve) → Reese (spec) → Jacques (build) → Blake (QA) → Cyrus (security)

### Sales Pipeline
Sage (leads/proposals) → Quinn (invoicing/finance)

### Marketing Pipeline
Milo (content/campaigns) → Marcel (creative)

### Support (On-Demand)
Avery (legal), Cyrus (security)
