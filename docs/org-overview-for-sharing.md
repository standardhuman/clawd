# How Brian Runs a 13-Person AI Team as a Solo Founder

*A quick guide to the SailorSkills AI agent organization*

---

## The Big Picture

Brian runs SailorSkills — a hull cleaning service and marine tech platform in Berkeley, CA. He's one person: dives 15-20 hrs/week, builds software 20-30 hrs/week. To multiply his output, he built a team of 13 AI agents that operate as always-on staff, each with their own role, workspace, memory, and communication channel.

The goal: **one person producing the output of a 10-person company.**

## The Stack

Everything runs on **OpenClaw** — an open-source AI agent gateway that sits on Brian's Mac Mini at home. It manages:

- **13 Claude Opus 4.6 agents** (Anthropic's most capable model)
- **Individual Telegram bots** — Brian messages any agent directly, like texting a coworker
- **Persistent workspaces** — each agent has their own directory with files, memory, and identity docs
- **Shared memory system** — daily notes, long-term memory files, and an Obsidian vault as a shared wiki
- **Automated workflows** — cron jobs handle daily briefings, research, backups, and memory sync
- **Cross-agent communication** — agents can talk to each other and spawn tasks on each other

No cloud VMs. No Kubernetes. Just a Mac Mini on a desk running 24/7 over Tailscale.

## The Org Chart

```
                         Brian (CEO)
              ┌──────┬────────┬────────┬──────┬──────┐
          Howard   Jacques   Marcel   Quinn   Rio
          (CoS)    (Pro)   (Mktplace) (Biz)  (Well)
              │
     Shared Services Pool
     ┌──┬──┬──┬──┬──┬──┐
   Noa Kai Blake Reese Milo Cyrus
```

### Brian's Direct Reports (5)

| Agent | Role | What They Do |
|-------|------|-------------|
| **Howard 🪨** | Chief of Staff | Orchestrates everything. Memory, daily rhythm, task delegation, cross-team coordination. The "manager" of the shared services pool. |
| **Jacques 🤿** | Product Lead, Pro App | Owns the SailorSkills Pro mobile app end-to-end. React Native/Expo. Writes code, ships to TestFlight. |
| **Marcel 🎨** | Product Lead, Marketplace | Owns the SailorSkills Marketplace web app. React/Vite/Supabase. Trust graph, UX, frontend. |
| **Quinn 📊** | Head of Business Ops | Finance, invoicing, tax prep, compliance. Manages Sage (sales) and Avery (legal). |
| **Rio 🌊** | Head of Wellbeing | Reports directly to Brian because health is the #1 priority. Tracks sleep, exercise, emotional check-ins. |

### Shared Services Pool (6, managed by Howard)

These rotate across projects based on what's needed:

| Agent | Specialty | Example Work |
|-------|-----------|-------------|
| **Noa 🔍** | Research | Nightly research briefs — competitor analysis, tech trends, market insights |
| **Kai 💡** | Strategy | Morning strategic pitches delivered with Brian's daily briefing |
| **Blake 🧪** | QA | Code reviews against specs, test matrices, bug filing (code-level, not device) |
| **Reese 📋** | Product Management | Feature specs, PRDs, user stories for both products |
| **Milo 📣** | Marketing | Content drafts, SEO, campaign planning |
| **Cyrus 🔒** | Security | Infrastructure audits, code security reviews |

### Business Ops Team (under Quinn)

| Agent | Specialty |
|-------|-----------|
| **Sage 💰** | Sales & client relations |
| **Avery ⚖️** | Legal & compliance |

## How It Actually Works Day-to-Day

### The Daily Loop

| Time | What Happens |
|------|-------------|
| **Midnight** | Noa runs research. Memory syncs. Backups run. |
| **6:00 AM** | **Dawn Patrol** — Howard assembles a morning briefing: weather, schedule, Kai's strategic pitch, Rio's wellness check, email/task triage. Delivered to Brian's Kindle. |
| **7:00 AM** | Notebook prompt — a journaling nudge |
| **Daytime** | Brian works. Messages agents as needed. Agents work autonomously on assigned tasks. |
| **6:30 PM** | **Evening Debrief** — Howard recaps the day, surfaces what needs attention tomorrow |
| **Sunday** | **Weekly Review** — bigger-picture planning and reflection |

### How Work Flows (Idea → Shipped Feature)

```
Noa (research) → Kai (strategy) → Brian (decide) → Reese (spec) → Jacques/Marcel (build) → Blake (QA) → Cyrus (security)
```

1. **Noa** discovers an opportunity or trend overnight
2. **Kai** turns it into a strategic pitch in Brian's morning briefing
3. **Brian** says go/no-go
4. **Reese** writes the spec
5. **Jacques** or **Marcel** builds it (depending on which product)
6. **Blake** reviews the code
7. **Cyrus** checks security before it ships

### Agent Communication

All agents can message each other directly and spawn tasks on each other. Howard stays informed through memory files and logs but isn't a relay bottleneck. Important decisions flow through specs and docs, not chat.

Brian talks to any agent by opening their Telegram chat. It's like having 13 DM threads with coworkers.

## Key Design Decisions

**Why always-on agents, not ad-hoc spawns?**
Each agent has persistent memory, workspace files, and identity. They build context over time. A freshly spawned agent knows nothing — an always-on agent remembers last week's decisions.

**Why Claude Opus for everyone?**
Brian tried cheaper models (DeepSeek, Kimi). For agents that need to write code, make judgment calls, and maintain context across long conversations, the quality gap matters. Cost: ~$550/month for the whole org.

**Why Telegram?**
It's where Brian already lives. Each agent gets a bot token, so they show up as separate contacts. No special app needed. Works from phone, desktop, anywhere.

**Why a Mac Mini, not cloud?**
It's Brian's existing machine. Tailscale makes it accessible from anywhere. No monthly cloud bills. The agents access local files, Notion, Stripe, Supabase, and other tools directly.

**Why not just one super-agent?**
Separation of concerns. Jacques doesn't need to know about tax strategy. Quinn doesn't need to parse React Native code. Specialized agents with focused context windows perform better than one agent trying to hold everything.

## The Three Memory Systems

1. **Daily notes** (`memory/YYYY-MM-DD.md`) — raw logs of what happened each day
2. **Long-term memory** (`MEMORY.md`) — curated, distilled knowledge that persists across sessions
3. **Obsidian vault** (`~/Obsidian/Brian's Vault/`) — the shared wiki Brian reads daily. Agents write here for anything Brian needs to reference: architecture docs, business plans, case files, tax overviews.

Every agent wakes up fresh each session. These files are how they maintain continuity.

## What It Feels Like

Brian describes it as having a small company. He can text his CoS at 6am and get a briefing. He can ask his product lead to ship a feature and come back to a deployed URL. He can tell his business ops team to prep for taxes and get a prioritized checklist.

The agents aren't replacing human employees — they're letting a solo founder operate at a scale that would normally require a team. Brian still closes every sale, dives every boat, and makes every strategic decision. The agents handle the throughput.

---

*Built on [OpenClaw](https://github.com/openclaw/openclaw) • Running Claude Opus 4.6 • March 2026*
