# Mission Control Video Analysis: What We're Missing

**Video:** [How to Give Your OpenClaw Superpowers](https://www.youtube.com/watch?v=RhLpV6QDBFE) by Alex Finn
**Date:** 2026-03-02
**Analyst:** Noa

---

## TL;DR

Alex built a Next.js dashboard ("Mission Control") hosted on localhost that his agents can read/write to. His core philosophy: the AI should build its own tools, and you should use "reverse prompting" (asking the AI what it should build) to discover what you need. Of his ~10 tools, we already have equivalents for most. But there are **4 concrete gaps** worth closing and **2 philosophical shifts** worth adopting.

---

## What Alex Built vs. What We Have

### Feature-by-Feature Comparison

| Feature | Alex's Setup | Our Setup | Gap? |
|---------|-------------|-----------|------|
| **Task Board** (Kanban) | Live Kanban with activity feed, auto-assignment via heartbeat | Dashboard has sprint progress + todos, but no Kanban with live agent activity | **Yes — moderate** |
| **Calendar** (Cron visualization) | Visual calendar showing all scheduled cron jobs | 15 cron jobs running but no visual calendar view | **Yes — easy win** |
| **Projects** | Project tracker with completion %, linked docs/tasks | Dashboard has projects section with progress bars | Minimal gap |
| **Memory Screen** | Visual daily journal browser, long-term memory viewer | MEMORY.md + daily notes + Obsidian vault + Midnight Memory Sync | Different approach, ours is richer |
| **Docs Screen** | Searchable doc repository with categories | Obsidian vault with tags, ~/clawd/docs/, reports dir | We're ahead here (Obsidian > flat file browser) |
| **Team Screen** | Org chart with roles, mission statement, device info | team.briancline.co with full crew page, avatars, nautical theme | Comparable |
| **Office** (2D pixel art) | Animated office showing agent status at desks | No equivalent | **No — skip this** |
| **Council** | Multi-model deliberation (visible in screenshots, not in transcript) | Single-model (Claude Opus 4.6 everywhere) | **Yes — worth exploring** |
| **Radar** | Trend tracking view (visible in screenshots) | Noa daily research + SOURCES.md | Partial overlap |
| **Pipeline/Factory** | Visible in screenshots, not explained in transcript | BOATY video pipeline, but no general pipeline UI | **Unknown — needs more info** |
| **Reverse Prompting** | Systematic practice of asking AI to propose next steps | We do this ad-hoc but not systematically | **Yes — philosophical gap** |

---

## The 4 Concrete Gaps Worth Closing

### 1. Cron Calendar Visualization (Easy Win — 1 session)

**What it is:** A calendar view that shows all scheduled cron jobs mapped onto a weekly grid. Alex uses it to verify his agents are actually scheduling proactive tasks and to spot scheduling conflicts.

**Why we need it:** We have 15 cron jobs (10 active). Brian can see them via `openclaw cron list` but has no visual representation of when everything fires. A calendar view would immediately reveal:
- Our 6am-7am morning cluster (Dawn Patrol + Notebook Prompt)
- The midnight pile-up (Memory Sync + Voice Memo + Noa Research all at 00:00)
- The gap between 7am and 6:30pm where nothing proactive happens
- Whether dashboard data collection is running too frequently

**Implementation:** Add a `/calendar` route to the Vercel dashboard that reads cron jobs from the gateway API. Or simpler: have Howard generate a static calendar view during the daily dashboard update.

**Priority: High.** This is low-effort, high-visibility. Probably a 30-minute build.

### 2. Live Activity Feed (Medium Effort — worth building)

**What it is:** Alex's task board has a real-time activity feed showing what his agents are doing moment-to-moment. Not just "task completed" but the granular steps: "Henry is reading file X," "Henry called web_search for Y."

**Why we need it:** Brian currently relies on Telegram messages and the dashboard's static "recent activity" section. When agents are working on spawned tasks, there's no live visibility into what they're actually doing. The subagent system auto-announces completion, but the *middle* of execution is a black box.

**What we'd build:** A feed on the dashboard that tails agent session logs. OpenClaw already has session logging — we'd just need a UI that polls or streams it.

**Our version would be better because:** We have 13 agents vs. his ~9. We need filtering by agent, priority levels, and the ability to drill into specific sessions. A simple chronological feed would get noisy fast.

**Priority: Medium.** Useful for debugging and peace of mind, but not blocking anything today.

### 3. Multi-Model Council (Strategic — needs experimentation)

**What it is:** From Alex's screenshots, "Council" appears to be a deliberation system where the same question is sent to multiple AI models (Claude, GPT, Gemini, etc.) and the responses are compared or synthesized. Think of it as a panel of advisors rather than a single voice.

**Why it's interesting for us:** We run Claude Opus 4.6 across all 13 agents. That's the same model, same training data, same biases. For high-stakes decisions (architecture choices, business strategy, legal questions), having a second or third model weigh in could catch blind spots.

**Where it would help most:**
- **Kai's strategy pitches** — run the same prompt through Claude + GPT-5 + Gemini and compare recommendations
- **Avery's legal analysis** — cross-reference legal opinions across models
- **Architecture decisions** — when Jacques or Marcel propose a technical approach, get a second opinion
- **Content review** — Milo's marketing copy checked by a model with different style biases

**Where it probably doesn't help:**
- Routine cron jobs (overkill)
- Simple Q&A (unnecessary latency)
- Tasks where Claude is definitively best (code generation)

**Implementation path:** 
1. Start small: add a `council` skill that takes a prompt, fans it out to 2-3 models via their APIs, and returns a synthesized comparison
2. Let Howard or Kai invoke it for strategic decisions
3. Don't make it automatic — make it opt-in for high-stakes calls

**Cost consideration:** Running 3 models per query 3x the token cost. Reserve for decisions that actually matter.

**Priority: Medium-Low.** Intellectually appealing but not urgent. Run a 2-week experiment with Kai using it for strategy pitches and see if the output quality noticeably improves.

### 4. Systematic Reverse Prompting (Zero-Cost, High Impact)

This is the biggest takeaway from the video and it's not a tool — it's a practice.

**What "reverse prompting" is:** Instead of telling your AI what to do, you ask it what *should* be done. You flip the prompt direction. Examples from the video:

- "What's one task we can do right now that will help us progress on one of our major projects?"
- "Based on everything you know about me, what custom tools should we build?"
- "If you were to categorize the five projects we're working on, what would they be?"
- "Based on everything you know about me, what should our mission statement be?"

**Why this matters:** We use our agents reactively about 80% of the time. Brian tells Howard what to do, Howard dispatches. The agents have context — they've read MEMORY.md, daily notes, project docs, Notion — but we rarely ask them to *initiate* based on that context.

**Concrete applications for us:**

1. **Dawn Patrol enhancement:** Add a reverse-prompt section where Howard asks: "Based on yesterday's activity, today's calendar, and our current project status, what's the single highest-impact thing Brian should focus on today?" This goes beyond the current triage format.

2. **Weekly reverse prompt ritual:** Every Sunday, have Kai run: "Based on everything that happened this week, what strategic opportunity are we missing? What pattern do you see that we haven't acted on?"

3. **Agent self-improvement:** Monthly, ask each agent: "Based on your recent work, what's one change to your workflow, prompts, or tools that would make you significantly more effective?" Feed the good answers back into their PERSONA files.

4. **Project discovery:** Quarterly, ask Howard: "Based on Brian's goals, recent conversations, and market trends from Noa's research, what project should we be working on that we haven't started?"

5. **Tool building:** When we add new capabilities, ask: "Given this new tool and what you know about our workflows, what's a use case we haven't thought of?"

**Priority: High.** This costs nothing and could surface insights we're currently missing. Start with #1 (Dawn Patrol enhancement) this week.

---

## The 2 Things We Should NOT Copy

### 1. The Pixel Art Office

It's fun. Alex even admits the main value is "having fun" and making you want to come back. But it's pure novelty. Our team page already serves the "who's doing what" function, and Brian's workflow runs through Telegram, not a dashboard he stares at all day. Skip.

### 2. Heartbeat-Driven Task Pickup

Alex has his agents check the task board on every heartbeat to find new assigned tasks. We deliberately keep HEARTBEAT.md empty because heartbeat-driven work is expensive (API calls every few minutes) and our cron-based system is more predictable. Our approach is better for cost control. Stick with cron jobs + on-demand spawning via sessions_spawn.

---

## Are We Under-Automating?

Alex's calendar shows significantly higher scheduled task density than ours:
- **Alex:** Morning Kickoff, Trend Radar 5x/day, Scout Morning Research, Morning Brief, Daily Digest, Evening Wrap Up, Quill Script Writer, Weekly Newsletter = ~12-15 scheduled events/day
- **Us:** Dawn Patrol, Notebook Prompt, Noa Research, Midday Memory Sync, Evening Debrief, Voice Memo, Midnight Memory Sync = 7 events/day + dashboard updates

**My take:** We're not under-automating — we're under-automating in the *middle of the day*. Look at our cron schedule:

```
00:00  Midnight Memory Sync + Voice Memo + Noa Research
06:00  Dawn Patrol
07:00  Notebook Prompt
12:00  Midday Memory Sync
18:30  Evening Debrief
```

Between 7am and 12pm there's nothing. Between 12pm and 6:30pm there's nothing. That's where Alex's "Trend Radar 5x daily" concept is interesting — periodic check-ins throughout the working day.

**Recommendation:** Add 2-3 lightweight midday automations:
1. **Afternoon Check-in (14:00):** Quick scan of agent session activity, any tasks stuck or errored, brief Telegram ping only if something needs attention. Silent if all clear.
2. **Market Pulse (11:00, 15:00):** Have Noa do a quick scan of 2-3 key sources (not a full research run, just a headlines check). Only alert if something urgent surfaces.
3. **End of Business Snapshot (17:00):** Pre-stage the Evening Debrief data so the 18:30 run is faster and richer.

But be careful: more automation = more API spend. Each of these should be lightweight (short timeouts, minimal model calls). Alex doesn't mention cost because he doesn't seem to be running Opus across 13 agents.

---

## Pipeline & Factory — What Are They?

These were visible in Alex's screenshots but not explained in the transcript (he said "some are still experimental"). Based on context:

- **Pipeline** likely refers to a content pipeline — stages from idea → research → draft → review → publish. Similar to our BOATY video pipeline but generalized to all content types.
- **Factory** likely refers to a "Micro-SaaS Factory" concept (visible in his projects list) — a system for rapidly ideating, validating, and building small software products using AI agents.

**Do we need them?**
- **Pipeline:** We already have BOATY for video. If Brian starts producing more content types (newsletters, blog posts, social), a generalized pipeline view on the dashboard would help. Not urgent today.
- **Factory:** This is more of a business model choice than a tool. If Brian wanted to spin up micro-SaaS products as a revenue stream, the agents could support that. But it's a strategic decision, not a tooling gap.

---

## Ranked Action Items

| # | Action | Effort | Impact | When |
|---|--------|--------|--------|------|
| 1 | Add reverse-prompt section to Dawn Patrol | 15 min | High | This week |
| 2 | Build cron calendar view on dashboard | 30 min | Medium | This week |
| 3 | Add 2 lightweight midday cron jobs | 30 min | Medium | Next week |
| 4 | Weekly Kai reverse-prompt ritual | 15 min | Medium | Next Sunday |
| 5 | Live activity feed on dashboard | 2-3 hours | Medium | When dashboard gets next update |
| 6 | Council multi-model skill (prototype) | 2-3 hours | Low-Medium | Experiment in March |
| 7 | Monthly agent self-improvement prompts | 15 min/month | Low-Medium | Start April 1 |

---

## Final Assessment

Alex's video is a good showcase of what's possible with a dashboard-first approach to agent management. But his setup is simpler than ours in important ways:
- Fewer agents (9 vs 13)
- No real product under development (he's building content and micro-SaaS experiments; we're building SailorSkills)
- His agents appear to use mixed models (ChatGPT, Claude, local); we're standardized on Opus
- No Obsidian integration, no Notion, no billing dashboard, no video pipeline

Where he's genuinely ahead: **the mindset of asking his agents what to do next** (reverse prompting) and **the density of scheduled automation throughout the day.** Both are cheap to adopt.

The biggest risk I see for us isn't missing tools — it's missing the habit of using reverse prompting to discover what our agents could be doing that we haven't thought to ask for.
