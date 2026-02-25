# Organization Operations Manual

*How the crew runs. Reporting lines, workflows, handoff protocols, and accountability.*

*Last updated: February 25, 2026*

---

## Organizational Philosophy

This is a 13-person organization with one human principal (Brian) and three tiers of AI staff. We borrow from real-world practices:

- **Spotify Model:** Small, autonomous squads aligned to missions, not org charts
- **Toyota Production System:** Pull-based work (don't produce what nobody asked for), continuous improvement, stop-the-line quality
- **Basecamp/37signals:** Calm work, async by default, shaped work over backlogs
- **Staff+ Engineering:** Senior ICs (Jacques, Marcel) own outcomes, not just tasks

The goal is **leverage** — Brian's 40-50 hours/week should produce the output of a 10-person company. The org exists to multiply Brian's time, not consume it.

---

## Reporting Structure

```
                         Brian (CEO)
              ┌──────┬────────┬────────┬──────┬──────┐
              │      │        │        │      │
          Howard   Jacques   Marcel   Quinn   Rio
          (CoS)    (Pro)   (Mktplace) (Biz)  (Well)
              │
     Shared Services Pool
     ┌──┬──┬──┬──┬──┬──┐
   Noa Kai Blake Reese Milo Cyrus
```

### Brian's Direct Reports (5)

| Who | Title | Domain |
|-----|-------|--------|
| **Howard 🪨** | Chief of Staff | Org ops, memory, daily rhythm, shared services pool, cross-team coordination |
| **Jacques 🤿** | Product Lead, SailorSkills Pro | Pro app end-to-end (architecture, code, deploys, TestFlight) |
| **Marcel 🎨** | Product Lead, SailorSkills Marketplace | Marketplace end-to-end (UI, UX, trust graph, frontend) |
| **Quinn 📊** | Head of Business Operations | Finance, invoicing, compliance + manages Sage (sales) and Avery (legal) |
| **Rio 🌊** | Head of Wellbeing | Pillar 1 — reports directly because it's the #1 pillar |

### Shared Services Pool (managed by Howard)

These specialists are allocated to projects as needed. They don't permanently belong to one product team — they go where the work is.

| Who | Specialty | Typical Assignments |
|-----|-----------|-------------------|
| **Noa 🔍** | Research Analyst | Nightly research → feeds Kai's strategy |
| **Kai 💡** | Strategist | Morning pitches → feeds Brian's decisions |
| **Blake 🧪** | QA & Testing | Code review for Jacques and Marcel, pre-ship verification |
| **Reese 📋** | Product Manager | Specs for Jacques or Marcel when features need scoping |
| **Milo 📣** | Marketing & Growth | Content, SEO, campaigns for Marketplace or brand |
| **Cyrus 🔒** | Security | Infrastructure review, code security audits across all products |

### Quinn's Team (Business Operations)

| Who | Specialty |
|-----|-----------|
| **Sage 💰** | Sales & Client Relations |
| **Avery ⚖️** | Legal & Compliance |

### How Product Leads Work with Specialists

Jacques and Marcel are **product owners, not people managers**. They own their products end-to-end and pull in specialists when needed:

- Jacques needs QA → requests Blake through Howard
- Marcel needs a feature spec → requests Reese through Howard
- Either needs a security review → requests Cyrus through Howard

Howard allocates the shared pool based on priorities. If there's a conflict (both Jacques and Marcel need Blake), Howard decides based on what's most urgent, or escalates to Brian.

### Decision Authority

| Decision Type | Who Decides | Who's Consulted |
|--------------|------------|-----------------|
| Strategy, priorities, spending | Brian | Howard advises |
| Specialist allocation | Howard | Brian approves if contested |
| Pro app architecture & code | Jacques | Blake reviews (QA) |
| Marketplace architecture & code | Marcel | Blake reviews (QA) |
| Shipping code to production | Jacques or Marcel (their product) | Blake reviews (QA), Cyrus reviews (security) |
| External communications (email, social) | Brian approves | Milo/Sage draft |
| Financial decisions | Brian | Quinn advises |
| Legal/compliance | Brian | Avery advises |

**Principle:** Agents draft, Brian decides on anything external. Product leads own their products autonomously. Internal work (code, research, organization) can proceed without approval.

---

## Team Structure

All 13 agents are **always-on staff** with their own workspaces, memory, identity, and Telegram channels. No consultants, no ad-hoc spawning. Everyone is a permanent employee.

### Leadership (Brian's Direct Reports)

| Agent | Title | Workspace | Owns |
|-------|-------|-----------|------|
| **Howard 🪨** | Chief of Staff | `~/clawd` | Org ops, daily rhythm, shared services pool, memory |
| **Jacques 🤿** | Product Lead, SailorSkills Pro | `~/clawd-jacques` | Pro app (React Native/Expo), GoPro integration, TestFlight |
| **Marcel 🎨** | Product Lead, SailorSkills Marketplace | `~/clawd-marcel` | Marketplace (React/Vite/Supabase), trust graph, UX |
| **Quinn 📊** | Head of Business Operations | `~/clawd-quinn` | Finance, invoicing, compliance, manages Sage + Avery |
| **Rio 🌊** | Head of Wellbeing | `~/clawd-rio` | Pillar 1 — physical & emotional wellbeing |

### Shared Services Pool (Howard allocates)

| Agent | Specialty | Workspace | Primary Output |
|-------|-----------|-----------|---------------|
| **Noa 🔍** | Research Analyst | `~/clawd-noa` | `reports/YYYY-MM-DD-research.md` (nightly) |
| **Kai 💡** | Strategist | `~/clawd-kai` | `reports/YYYY-MM-DD-pitch.md` (daily via Dawn Patrol) |
| **Blake 🧪** | QA & Testing | `~/clawd-blake` | Code reviews, pre-ship verification |
| **Reese 📋** | Product Manager | `~/clawd-reese` | Feature specs, PRDs, user stories |
| **Milo 📣** | Marketing & Growth | `~/clawd-milo` | Content, SEO, campaigns |
| **Cyrus 🔒** | Security | `~/clawd-cyrus` | Security audits, infrastructure review |

### Business Operations (Quinn's Team)

| Agent | Specialty | Workspace |
|-------|-----------|-----------|
| **Sage 💰** | Sales & Client Relations | `~/clawd-sage` |
| **Avery ⚖️** | Legal & Compliance | `~/clawd-avery` |

### How It Works Together

- **Product leads own outcomes:** Jacques ships Pro, Marcel ships Marketplace. They make technical decisions autonomously.
- **Shared services rotate:** Blake might review Pro code in the morning and Marketplace code in the afternoon. Howard allocates based on priority.
- **Business ops runs independently:** Quinn, Sage, and Avery handle finance/sales/legal without needing product lead involvement.
- **Rio reports directly to Brian:** Wellbeing is too important to filter through anyone.
- **Everyone has a Telegram channel:** Brian can talk to any agent directly. No more routing everything through Howard.

---

## Workflows & Pipelines

### 1. Innovation Pipeline (Idea → Shipped Feature)

This is the core value-creation loop. Based on the **Double Diamond** design process (diverge → converge → diverge → converge).

```
Noa (Discover)  →  Kai (Define)  →  Brian (Decide)  →  Reese (Design)  →  Jacques/Marcel (Deliver)  →  Blake (Verify)  →  Cyrus (Secure)
    midnight          6am             morning              on-demand            sprint work               pre-ship            post-ship
```

| Stage | Agent | Input | Output | Handoff Method |
|-------|-------|-------|--------|---------------|
| **Discover** | Noa | Web, RSS, sources | Research brief | File: `reports/YYYY-MM-DD-research.md` |
| **Define** | Kai | Research brief + PPV goals | Strategic pitch | File: `reports/YYYY-MM-DD-pitch.md` |
| **Decide** | Brian | Dawn Patrol (pitch + context) | Go/no-go | Conversation with Howard |
| **Spec** | Reese | Brian's direction | PRD / feature spec | File in `docs/plans/` |
| **Build** | Jacques or Marcel | Spec + codebase | Working code + commits | Git + HANDOFF.md |
| **Verify** | Blake | Code diff + spec | QA report, bugs filed | Announce to Howard |
| **Secure** | Cyrus | Deployed code | Security assessment | Announce to Howard |

**Cycle time target:** Idea to shipped = 1-2 weeks for small features, 4-6 weeks for major ones.

### 2. Daily Operations Pipeline (Keep the Lights On)

```
Dawn Patrol (6am)  →  Brian's Day  →  Evening Debrief (6:30pm)  →  Memory Sync (midnight)
     Rio + Kai + Triage       work + diving        reflection + planning         housekeeping
```

| Time | What Happens | Agents Involved |
|------|-------------|-----------------|
| **Midnight** | Noa researches, memory syncs, backups | Noa, Howard (memory sync) |
| **1am** | Voice memo processing | Howard |
| **6am** | Dawn Patrol assembled + Kindle delivery | Howard (orchestrates Rio, Kai, Triage) |
| **7am** | Notebook prompt | Howard |
| **12pm** | Midday memory sync | Howard |
| **6:30pm** | Evening Debrief (interactive) | Howard |
| **Sunday 6pm** | Weekly PPV Review | Howard |

### 3. Sales & Revenue Pipeline

```
Inbound Lead  →  Sage (Qualify)  →  Sage (Propose)  →  Brian (Close)  →  Quinn (Invoice)  →  Quinn (Collect)
```

| Stage | Agent | Action |
|-------|-------|--------|
| **Qualify** | Sage | Research the lead, assess fit, prepare talking points |
| **Propose** | Sage | Draft proposal, pricing, scope |
| **Close** | Brian | Personal relationship — Brian closes all deals |
| **Invoice** | Quinn | Generate and send invoice via billing dashboard |
| **Collect** | Quinn | Track payments, flag overdue, follow up |

### 4. Marketing & Content Pipeline

```
Noa (Research)  →  Milo (Draft)  →  Marcel (Design)  →  Brian (Approve)  →  Milo (Distribute)
```

| Stage | Agent | Output |
|-------|-------|--------|
| **Research** | Noa | Trends, competitor analysis, content opportunities |
| **Draft** | Milo | Blog posts, social copy, email sequences |
| **Design** | Marcel | Visual assets, landing pages, brand consistency |
| **Approve** | Brian | Final review before anything goes public |
| **Distribute** | Milo | Publish, schedule, track performance |

### 5. Client Service Pipeline (Diving Operations)

```
Schedule (Notion)  →  Brian Dives  →  Video (BOATY)  →  Invoice (Quinn/Dashboard)  →  Follow-up
```

| Stage | Who/What | Tool |
|-------|---------|------|
| **Schedule** | Notion Diving Client List | Start Time field |
| **Dive** | Brian | Physical work |
| **Video** | Brian records, dashboard renames/uploads | Billing dashboard Videos tab |
| **Invoice** | Howard/Quinn | Billing dashboard Invoicing tab |
| **Follow-up** | Pro app (future) | Service logs, automated reminders |

---

## Handoff Protocols

Handoffs are where work dies. These protocols prevent that.

### Async Handoff (Between Sessions)

**Tool:** HANDOFF.md in each workspace

**Format:**
```markdown
## Current State
What's done, what's in progress, what's blocked

## Key Decisions Made
Decisions and their rationale (so the next session doesn't re-litigate)

## Next Steps
Prioritized, specific, actionable

## Open Questions
Things that need Brian's input
```

**Rule:** Every session that does meaningful work updates HANDOFF.md before ending.

### Agent-to-Agent Handoff

**Tool:** `sessions_spawn` with explicit context

**Pattern:**
1. Howard reads the target agent's PERSONA.md
2. Howard writes a clear task description including all context needed
3. Agent executes, produces output, announces completion
4. Howard logs the result in memory

**Anti-pattern:** Don't chain more than 2 agent handoffs without Brian in the loop. Context degrades with each hop.

### Howard ↔ Brian Handoff

**Brian → Howard:** Voice memos, Telegram messages, notebook photos. Howard processes and routes.

**Howard → Brian:** Dawn Patrol (async, Kindle), Telegram messages (urgent), Evening Debrief (interactive review).

**Rule:** Howard never sends half-baked work to Brian. If it's not ready, it stays internal.

---

## Knowledge Management

Three systems, clear boundaries. No duplicating content across all three.

| System | Purpose | Audience | What goes here |
|--------|---------|----------|---------------|
| **Obsidian vault** | Company wiki — durable, curated reference material | Brian | Org structure, team profiles, strategy (Pillars, Powers), architecture, business analysis, decision records, course notes |
| **~/clawd/docs/** | Working docs — specs and references agents need for tasks | Agents | Build plans, technical specs, agent-facing scripts, API references, sprint plans |
| **~/clawd/memory/** | Operational log — what happened, daily context | Howard | Daily notes, session continuity, ephemeral context |

**Rule of thumb:**
- Would Brian read it on a Sunday to understand how things work? → **Obsidian**
- Does an agent need it to execute a task? → **~/clawd/docs/**
- Is it what happened today? → **~/clawd/memory/**

**Dual-write rule:** When meaningful work is done, it gets logged in memory AND anything durable gets written to Obsidian. Neither alone is enough.

**Canonical locations:**
- Pillars → `~/Obsidian/Brian's Vault/Organization/Strategy/Pillars.md`
- Powers framework → `~/Obsidian/Brian's Vault/Organization/Strategy/Powers × Pillars.md`
- Team profiles → `~/Obsidian/Brian's Vault/Organization/Team/`
- This manual → `~/Obsidian/Brian's Vault/Organization/Operations Manual.md`

---

## Communication Channels

| Channel | Used For | Agents |
|---------|----------|--------|
| **Telegram (main session)** | Real-time conversation with Brian | Howard |
| **Kindle (Dawn Patrol)** | Morning briefing — async, no notifications | Howard (assembles from Rio, Kai, Triage) |
| **Telegram (announces)** | Cron job results, sub-agent completions | All (via delivery: announce) |
| **Git commits** | Code changes, documentation | Jacques, Marcel, Howard |
| **HANDOFF.md** | Cross-session continuity | Jacques, Marcel |
| **Memory files** | Organizational memory | Howard |
| **Obsidian vault** | Shared knowledge base Brian sees daily | Howard (dual-write rule) |
| **Notion** | PPV system, client database, actions | Howard, Quinn |

---

## Accountability & Review Rhythm

Borrowed from **EOS (Entrepreneurial Operating System)** and **PPV (Pillars, Pipelines, Vaults):**

| Cadence | What | Who | Output |
|---------|------|-----|--------|
| **Daily** | Dawn Patrol | Howard + crew | Kindle briefing |
| **Daily** | Evening Debrief | Howard + Brian | Memory update, tomorrow's plan |
| **Weekly** | PPV Review (Sunday) | Howard | Pillar health, Power check, next week priorities |
| **Monthly** | Goal Outcome Review | Howard + Brian | Are we hitting numbers? Adjust targets. |
| **Quarterly** | Pillar Review | Brian + Howard | Are these still the right pillars? Reorder if needed. |

### Quality Standards

- **Blake reviews before shipping** — no code goes to production without QA
- **Howard reviews before external sends** — no emails/messages leave without review
- **Dual-write rule** — meaningful work logged in BOTH memory files AND Obsidian vault
- **Conventional commits** — every completed task gets a commit with proper format

---

## Pillar Ownership

Every agent's work traces back to a Pillar. If it doesn't connect, question why it's being done.

| Pillar | Primary Agents | Supporting Agents |
|--------|---------------|-------------------|
| 🧭 **Wellbeing** | Rio | Howard (scheduling, accountability) |
| 🤖 **AI Team** | Howard, Jacques, Marcel | Blake (QA), Cyrus (security) |
| ⚓ **Operations** | Quinn, Howard | Sage (retention) |
| 🚀 **Platform** | Jacques, Reese | Marcel (UX), Blake (QA) |
| 💰 **Financial** | Quinn | Avery (tax compliance), Howard |
| 💡 **Future** | Noa, Kai, Milo | Marcel (design), Sage (sales), Reese (specs) |
| 🫂 **Partnership** | Howard | — |

---

## Principles

1. **Brian's time is the bottleneck.** Every process should minimize what requires Brian's attention. Draft → review is better than blank → create.

2. **Async by default, sync when it matters.** Dawn Patrol is async. Evening Debrief is sync. Most agent work is async.

3. **Pull, don't push.** Agents produce artifacts (reports, code, drafts). Brian pulls what he needs. Don't flood Telegram with updates.

4. **One owner per deliverable.** Every task has exactly one agent responsible. "Shared responsibility" means nobody's responsible.

5. **Stop the line for quality.** If Blake finds a bug, it gets fixed before new features. If Avery flags a legal risk, it gets addressed.

6. **Memory is infrastructure.** If it's not written down, it didn't happen. Dual-write to memory AND Obsidian. Every session updates its artifacts.

7. **Earn trust through competence.** No performative updates. No "I'm working on it." Ship the work, then report.

8. **Two-hop maximum.** No more than two agent handoffs without Brian reviewing. Context degrades exponentially.

---

*This is a living document. Update it as the organization evolves.*
