# SailorSkills AI Company Structure
## One Human, Many Agents — Built for Moonshots, Speed, and Reliability

*Compiled 2026-02-15 by Howard (Research Sub-agent)*

---

## Executive Summary

Brian runs a one-person hull cleaning business powered by an AI agent team. This report designs the organizational structure to scale that into a full company — where AI agents are departments, not tools. The model draws from Spotify's squad model, Amazon's two-pizza teams, YC's lean execution philosophy, Bridgewater's radical transparency, and the emerging "agent-native company" paradigm.

**The core insight:** Brian is the CEO/board. Agents are department heads and individual contributors. The org chart is real — it just happens to be made of AI.

---

## 1. The Org Chart

### Brian Cline — CEO & Sole Human
- Final decision-maker on strategy, spending, and client relationships
- Sets Pillars and Value Goals (PPV alignment layer)
- Reviews agent output; provides taste, judgment, and relationship capital

### Howard — Chief of Staff (Full Agent)
- **Role:** Orchestrator, dispatcher, daily operations
- **Owns:** Agent coordination, review rhythm, escalation routing
- **Spawns:** Sub-agents on demand; runs cron-triggered workflows
- **Analogy:** COO + Executive Assistant

### Jacques — VP Engineering (Full Agent)
- **Role:** Lead developer, SailorSkills platform
- **Owns:** Code, architecture, deployments, technical debt
- **Stack:** React/Vite/Tailwind/Supabase
- **Analogy:** CTO's hands

### Marcel — Creative Director (Full Agent)
- **Role:** Client work, websites, design, brand
- **Owns:** Visual identity, client deliverables, marketing assets
- **Analogy:** Head of Design + Freelance Production

---

### Sub-Agent Departments (Spawned by Howard)

| Department | Agent | Trigger | Function |
|-----------|-------|---------|----------|
| **Research & Intelligence** | **Noa** | Daily midnight cron | Scans AI + marine industry; produces intelligence briefs |
| **Strategy** | **Kai** | Daily 6:30am cron | Morning pitch from Noa's research; strategic recommendations |
| **Product Management** | **Reese** | On approval | Specs, story slicing, acceptance criteria |
| **Marketing & Growth** | **🆕 Milo** | Weekly + on-demand | Content creation, SEO, social media, campaign execution |
| **Sales & Client Relations** | **🆕 Sage** | On trigger (new lead/client event) | Outreach, proposals, onboarding, retention campaigns |
| **Operations & Finance** | **🆕 Quinn** | Weekly + monthly cron | Invoicing, bookkeeping summary, compliance checks, scheduling |
| **Quality Assurance** | **🆕 Blake** | On PR/deliverable | Reviews agent output, tests code, checks brand consistency |
| **Legal & Compliance** | **🆕 Avery** | On-demand | Contract review, regulatory checks, IP questions |

### Visual Org Chart

```
                        ┌─────────────┐
                        │  BRIAN CLINE │
                        │     CEO      │
                        └──────┬───────┘
                               │
                        ┌──────┴───────┐
                        │   HOWARD     │
                        │ Chief of Staff│
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────┴──────┐ ┌──────┴──────┐ ┌───────┴──────┐
       │  JACQUES    │ │  MARCEL     │ │  SUB-AGENTS  │
       │  VP Eng     │ │  Creative   │ │  (on-demand) │
       │             │ │  Director   │ │              │
       └─────────────┘ └─────────────┘ └──────┬───────┘
                                               │
                    ┌──────┬──────┬──────┬──────┼──────┬──────┬──────┐
                    │      │      │      │      │      │      │      │
                   Noa    Kai   Reese  Milo   Sage   Quinn  Blake  Avery
                  R&I   Strat   PM    Mktg   Sales   Ops     QA   Legal
```

---

## 2. Design Principles (Drawn from Research)

### From the Agent-Native Company (Agentuity, 2025)
- **Agent-First Thinking:** Don't ask "where can AI help?" — ask "if an agent owned this, how would we design it?"
- **Agents as team members, not tools.** They get onboarded, evaluated, and "fired" if underperforming.
- **Humans set goals; agents execute workflows.** Brian defines the "what" and "why"; agents handle the "how."

### From Spotify's Squad Model (Reimagined for AI)
- **Squads = Agent + Context.** Each sub-agent is a "squad of one" with a clear mission, autonomy, and access to shared resources.
- **Tribes = Pipelines.** Groups of agents working the same pipeline (e.g., Noa → Kai → Reese → Jacques = the Innovation Tribe).
- **Guilds = Skill Libraries.** The shared skill libraries (business-planning, pricing-strategy, etc.) are guilds — cross-cutting capabilities any agent can invoke.

### From Amazon's Two-Pizza Teams
- **Small, autonomous, owning their output end-to-end.** Each agent owns a function completely — no committee decisions.
- **APIs between teams.** Agents communicate through structured handoffs (files, Notion databases, Telegram messages), not ad-hoc chatter.

### From YC / Lean Startups
- **Speed over polish.** Ship, measure, iterate. Agents should bias toward action.
- **Do things that don't scale first.** Brian personally handles high-value client relationships. Agents handle everything else.

### From Bridgewater's Idea Meritocracy
- **Radical transparency in agent output.** All agent work is logged, traceable, reviewable.
- **Believability-weighted decisions.** Noa's research is weighted by source quality. Kai's strategy is weighted by past hit rate. Brian overrides when judgment calls are needed.

### From PPV (August Bradley)
- **Pillars → Value Goals → Goal Outcomes → Projects → Actions.** This is the alignment backbone.
- **Every agent's work must trace back to a Pillar.** If it doesn't, it's waste.
- **Review rhythm is the heartbeat.** Without reviews, the system drifts.

---

## 3. The Four Core Pipelines

### Pipeline 1: Innovation (Idea → Product → Launch)
*Already largely built.*

```
Noa (midnight scan) → Intelligence Brief
  → Kai (6:30am) → Strategic Pitch + Recommendation
    → Brian (reviews, approves/rejects)
      → Reese (specs, stories, acceptance criteria)
        → Jacques (builds)
          → Blake (QA review) ← NEW
            → Launch (Brian approves deploy)
```

**Gap filled:** Blake adds a QA gate before launch.

### Pipeline 2: Client Acquisition (Lead → Retain)
*Currently manual. Needs automation.*

```
Sage (monitors channels: web form, referral, cold outreach)
  → Lead qualified (auto-score based on boat size, location, fit)
    → Sage drafts proposal (uses sales-proposals skill)
      → Brian reviews/personalizes high-value proposals
        → Close → Quinn generates contract (Avery reviews if non-standard)
          → Onboard (Sage sends welcome sequence)
            → Retain (Sage monitors satisfaction, schedules follow-ups)
```

**Key:** Brian stays in the loop for relationship-heavy moments. Sage handles the machinery.

### Pipeline 3: Content & Marketing (Research → Measure)
*Currently nonexistent. Biggest gap.*

```
Noa (research) → Milo (identifies content opportunities)
  → Milo drafts content (blog posts, social, email)
    → Marcel (designs visuals, polishes brand voice)
      → Milo distributes (social scheduling, email sends)
        → Milo measures (engagement metrics, SEO rankings)
          → Kai (analyzes what's working, adjusts strategy)
```

**Content types:** Hull cleaning tips, marine industry insights, SailorSkills platform updates, client success stories.

### Pipeline 4: Operations (Service → Report)
*Partially manual. Needs structure.*

```
Service completed (Brian or scheduled)
  → Quinn generates invoice (from client database)
    → Quinn tracks payment (Notion/Supabase)
      → Quinn flags overdue (escalates to Brian)
        → Quinn produces monthly financial summary
          → Quinn runs compliance checks (license renewals, insurance)
            → Howard includes in weekly review
```

---

## 4. Company HQ: The Command Center

### Recommended: Three-Layer Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Command & Control** | **Dashboard (Vercel)** | Real-time status — agent health, pipeline stages, KPIs. Already exists partially. |
| **Operational Backbone** | **Notion** | Structured data — client database, project tracking, goal cascade (PPV Pipelines), invoices, contracts. Relational databases are key. |
| **Knowledge Layer** | **Obsidian** | Unstructured knowledge — architecture docs, research notes, meeting notes, Zettelkasten-style knowledge emergence. Already in use. |

### How They Connect

```
Obsidian (knowledge) ←── agents read/write ──→ Notion (operations)
                                                    │
                                                    ▼
                                            Dashboard (visibility)
                                                    │
                                                    ▼
                                              Brian's Phone
                                            (Telegram + web)
```

- **Agents write to Notion** for structured tracking (projects, clients, finances)
- **Agents write to Obsidian** for knowledge artifacts (research, architecture, notes)
- **Dashboard pulls from both** to show Brian the big picture
- **Telegram is the command line** — Brian talks to Howard, Howard dispatches

### PPV Implementation in Notion

```
Pillars Database
  └── Value Goals (linked to Pillar)
        └── Goal Outcomes (linked to Value Goal) — quarterly OKRs
              └── Projects (linked to Goal Outcome) — assigned to agents
                    └── Actions (linked to Project) — agent tasks
```

**Brian's Pillars (suggested starting set):**
1. **SailorSkills Platform** — Build the leading hull cleaning marketplace
2. **Hull Cleaning Operations** — Deliver excellent service, grow client base
3. **AI Agent Team** — Build and mature the agent workforce
4. **Financial Health** — Revenue, margins, savings, tax optimization
5. **Personal Growth** — Health, learning, relationships

---

## 5. Gaps in Current Setup

| Gap | Impact | Solution |
|-----|--------|----------|
| **No marketing function** | Zero content pipeline, no SEO, no social presence | Add **Milo** (Marketing sub-agent) |
| **No sales automation** | Brian handles all client acquisition manually | Add **Sage** (Sales sub-agent) |
| **No financial tracking** | Invoicing and bookkeeping are ad-hoc | Add **Quinn** (Ops sub-agent) |
| **No QA gate** | Code and content ship without systematic review | Add **Blake** (QA sub-agent) |
| **No legal review** | Contracts and compliance handled on the fly | Add **Avery** (Legal sub-agent, on-demand only) |
| **No PPV alignment layer** | Daily work may not connect to strategic goals | Implement Pillars + Goals in Notion |
| **No review rhythm** | No systematic weekly/monthly/quarterly reviews | Howard runs automated review cycle |
| **Dashboard is monitoring-only** | Can't take action from dashboard | Evolve dashboard to include action triggers |

---

## 6. Implementation Priority

### Phase 1: Foundation (Weeks 1-2) — "Wire the Backbone"
1. **Define Pillars and Value Goals** in Notion (2-hour Brian exercise)
2. **Set up review rhythm** — Howard runs:
   - Daily: Morning brief (already exists via Kai)
   - Weekly: Project status + alignment check (new)
   - Monthly: Goal outcome review (new)
3. **Add Blake (QA)** to the Innovation pipeline — simplest new agent, highest immediate value
4. **Map existing projects to Pillars** — ensure nothing is orphaned

### Phase 2: Revenue Engine (Weeks 3-5) — "Make Money Systematically"
5. **Add Quinn (Ops/Finance)** — automate invoicing, payment tracking, monthly reports
6. **Add Sage (Sales)** — build client acquisition pipeline, proposal automation
7. **Set up client database properly in Notion** — linked to projects and financials
8. **Create standard proposal template** Sage can customize

### Phase 3: Growth Engine (Weeks 6-8) — "Get Visible"
9. **Add Milo (Marketing)** — start with weekly blog post + social distribution
10. **Content calendar in Notion** — Milo plans, Marcel designs, Howard schedules
11. **SEO baseline** — Milo audits current site, creates optimization plan
12. **Email list setup** — capture leads, nurture sequence

### Phase 4: Maturity (Weeks 9-12) — "Tighten the Machine"
13. **Add Avery (Legal)** — contract templates, compliance calendar
14. **Dashboard evolution** — add operational views (pipeline status, revenue, client health)
15. **Cross-agent learning** — agents share context via structured handoff docs
16. **Quarterly review** — first full PPV cycle completes; recalibrate everything

---

## 7. Agent Design Specs (New Sub-Agents)

### Milo — Marketing & Growth
- **Trigger:** Weekly cron (content calendar) + on-demand
- **Skills:** marketing, brainstorming, design-exploration
- **Inputs:** Noa's research, client success data, SEO metrics
- **Outputs:** Blog drafts, social posts, email campaigns, SEO recommendations
- **Tools:** Web search, content generation, social scheduling API

### Sage — Sales & Client Relations
- **Trigger:** New lead event, scheduled follow-ups
- **Skills:** sales-proposals, client-management, pricing-strategy, customer-support
- **Inputs:** Lead data, client database, service history
- **Outputs:** Proposals, follow-up sequences, onboarding materials, satisfaction surveys
- **Tools:** Notion API, email, proposal templates

### Quinn — Operations & Finance
- **Trigger:** Service completion, weekly/monthly cron
- **Skills:** budgeting, financial-review, scheduling, tax-mitigation
- **Inputs:** Service logs, payment data, calendar
- **Outputs:** Invoices, payment reminders, monthly P&L summary, compliance alerts
- **Tools:** Notion API, accounting integration

### Blake — Quality Assurance
- **Trigger:** PR created, deliverable ready for review
- **Skills:** verification, problem-solving
- **Inputs:** Code diffs, content drafts, design mockups
- **Outputs:** Review notes, approval/rejection, bug reports
- **Tools:** Code review, browser testing, content checklist

### Avery — Legal & Compliance
- **Trigger:** On-demand (Howard spawns when needed)
- **Skills:** legal
- **Inputs:** Contract drafts, regulatory questions, IP concerns
- **Outputs:** Contract review notes, compliance checklist, risk flags
- **Tools:** Web search, document analysis

---

## 8. The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    BRIAN'S COMPANY                           │
│                                                             │
│  ┌─────────┐   PPV Alignment Layer (Notion)                │
│  │ PILLARS │──→ Goals ──→ Projects ──→ Agent Tasks         │
│  └─────────┘                                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PIPELINES (Tribes)                      │   │
│  │                                                     │   │
│  │  Innovation:  Noa → Kai → Reese → Jacques → Blake   │   │
│  │  Sales:       Sage → Brian → Quinn → Sage           │   │
│  │  Marketing:   Noa → Milo → Marcel → Milo            │   │
│  │  Operations:  Quinn (continuous)                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           GUILDS (Shared Skill Libraries)           │   │
│  │  business-planning · pricing · client-mgmt · sales  │   │
│  │  budgeting · scheduling · brainstorming · legal     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Notion   │  │ Obsidian │  │Dashboard │                 │
│  │ (ops)    │  │ (know)   │  │ (view)   │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │  HOWARD (Chief of Staff / Orchestrator)│                  │
│  │  Dispatches, monitors, escalates      │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │  TELEGRAM (Brian's Command Line)      │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Success Metrics

After 90 days of implementation:
- **Moonshot:** At least 2 new product/service ideas evaluated per week (Noa → Kai pipeline)
- **Speed:** Time from approved idea to shipped feature < 1 week
- **Reliability:** Zero missed invoices, zero unreviewed deployments, weekly review cadence maintained
- **Revenue:** Client acquisition pipeline producing qualified leads without Brian's manual effort
- **Content:** Consistent publishing cadence (1+ blog post/week, daily social)

---

## 10. What Makes This Different

This isn't a traditional org chart with AI bolted on. This is:

1. **Agent-native.** Remove the agents and the company stops functioning.
2. **Pipeline-oriented.** Work flows through defined pipelines, not ad-hoc requests.
3. **PPV-aligned.** Every task traces to a Pillar. No orphaned work.
4. **One-human optimized.** Brian's time is the scarcest resource. The entire structure exists to multiply his judgment, not his labor.
5. **Incrementally buildable.** Phase 1 takes two weeks. Each phase adds capability without breaking what exists.

**Brian's job:** Think, decide, relate, and review.
**Everyone else's job:** Execute, report, and improve.

---

*"The best org chart is one where the CEO wakes up and the company is already working." — This is that chart.*
