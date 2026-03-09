# Agent Roster

## Avatar Style Guide
**Style:** Cute bobblehead robots, Wall-E inspired. Warm, weathered, expressive with big soulful eyes. Nautical ship crew theme — each agent photographed at their station on the vessel. Muted nautical palette with unique accent color per agent.

**Canonical images:** `~/openclaw/agents/howard/avatars/{name}-robot-v2.png`

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

**Pattern:** "Read ~/openclaw/agents/howard/agents/{name}/PERSONA.md and follow its instructions. Then: {task}"

## Organization

All 13 agents are always-on staff with their own workspaces, memory, identity, and Telegram channels.

### Brian's Direct Reports
| Agent | Title | Workspace |
|-------|-------|-----------|
| **Howard** 🪨 | Chief of Staff | ~/clawd |
| **Jacques** 🤿 | Product Lead, SailorSkills Pro | ~/openclaw/agents/jacques |
| **Marcel** 🎨 | Product Lead, SailorSkills Marketplace | ~/openclaw/agents/marcel |
| **Quinn** 📊 | Head of Business Operations | ~/openclaw/agents/quinn |
| **Rio** 🌊 | Head of Wellbeing | ~/openclaw/agents/rio |

### Shared Services Pool (Howard allocates)
| Agent | Specialty | Workspace |
|-------|-----------|-----------|
| **Noa** 🔍 | Research Analyst | ~/openclaw/agents/noa |
| **Kai** 💡 | Strategist | ~/openclaw/agents/kai |
| **Blake** 🧪 | QA & Testing | ~/openclaw/agents/blake |
| **Reese** 📋 | Product Manager | ~/openclaw/agents/reese |
| **Milo** 📣 | Marketing & Growth | ~/openclaw/agents/milo |
| **Cyrus** 🔒 | Security | ~/openclaw/agents/cyrus |

### Business Operations (Quinn's Team)
| Agent | Specialty | Workspace |
|-------|-----------|-----------|
| **Sage** 💰 | Sales & Client Relations | ~/openclaw/agents/sage |
| **Avery** ⚖️ | Legal & Compliance | ~/openclaw/agents/avery |

## Pipelines

### Innovation Pipeline
Noa (research) → Kai (strategy pitch) → Brian (approve) → Reese (spec) → Jacques (build) → Blake (QA) → Cyrus (security)

### Sales Pipeline
Sage (leads/proposals) → Quinn (invoicing/finance)

### Marketing Pipeline
Milo (content/campaigns) → Marcel (creative)

### Support (On-Demand)
Avery (legal), Cyrus (security)
