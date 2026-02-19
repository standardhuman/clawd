# Agent Roster

## Avatar Style Guide
**Style:** Cute bobblehead robots, Wall-E inspired. Warm, weathered, expressive with big soulful eyes. Nautical ship crew theme — each agent photographed at their station on the vessel. Muted nautical palette with unique accent color per agent.

**Canonical images:** `~/clawd/avatars/{name}-robot-v2.png`

| Agent | Accent Color | Location on Ship | Distinguishing Feature |
|-------|-------------|-----------------|----------------------|
| Howard 🪨 | Slate blue | Bridge/helm | Captain's hat, epaulets, cairn emblem |
| Jacques 🤿 | Amber/gold | Deck near rigging | Red Life Aquatic beanie |
| Marcel 🎨 | Teal/sea green | Workshop below deck | French beret, paint smudges |
| Noa 🔍 | Deep indigo | Crow's nest | Binoculars/telescope |
| Kai 💡 | Sunrise orange | Chart room | Maps and navigation charts |
| Blake 🧪 | Forest green | Engine room | Magnifying loupe/inspector visor |
| Quinn 📊 | Steel blue-gray | Supply hold | Clipboard/ledger |
| Sage 💰 | Rich copper | Gangway | Merchant's satchel |
| Milo 📣 | Coral/warm red | Main deck | Megaphone/signal flags |
| Reese 📋 | Warm plum/mauve | Drafting table on deck | Ship blueprints |
| Avery ⚖️ | Deep burgundy | Captain's quarters | Spectacles, ship's log |
| Rio 🌊 | Warm sunrise orange / soft gold | Ship's bow | Headband, calm expression |
| Cyrus 🔒 | Dark charcoal + electric blue | Stern | Shield emblem |

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
| **Rio** 🌊 | Wellbeing Coach | Morning routine, training oversight, recovery, accountability |
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
