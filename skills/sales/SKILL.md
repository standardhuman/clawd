---
name: sales
description: Sales toolkit — account research, call preparation, competitive intelligence battlecards, daily sales briefings, personalized outreach drafting, call summaries, pipeline reviews, and sales forecasting. Use when researching prospects, prepping for calls, analyzing competitors, drafting outreach emails, processing call notes, reviewing pipeline health, or building forecasts.
metadata:
  author: Anthropic (adapted)
  version: 1.0.0
  source: github.com/anthropics/cowork-plugins
---

# Sales

> Adapted from [Anthropic's open-source Cowork plugins](https://github.com/anthropics/cowork-plugins) — knowledge-work-plugins/sales.

Comprehensive sales skill covering account research, call prep, competitive intelligence, daily briefings, outreach drafting, call follow-up, pipeline management, and forecasting.

**Tools that help:** Web search for prospect/competitor research, file access for proposals and collateral, CRM/Notion for account data, calendar for meeting context.

---

## Account Research

**When to use:** Before first outreach, before a meeting, researching a new prospect, or building intel on an account.

### Research Process

1. **Parse request:** Company research, person research, or both
2. **Web search (always):**
   - "[Company]" — homepage, about page
   - "[Company] news" — recent announcements (90 days)
   - "[Company] funding" — investment history
   - "[Company] careers" — hiring signals
   - "[Person] [Company] LinkedIn" — profile info
   - "[Company] product" — what they sell
   - "[Company] customers" — who they serve
3. **Synthesize** into actionable research brief

### Output Format

```
# Research: [Company/Person]

## Quick Take
[2-3 sentences: Who they are, why they might need you, best angle]

## Company Profile
| Field | Value |
|-------|-------|
| Company | [Name] |
| Industry | [Industry] |
| Size | [Employees] |
| HQ | [Location] |
| Funding | [Stage + amount if known] |

### What They Do
[1-2 sentences]

### Recent News
- [Headline] — [Date] — [Why it matters for outreach]

### Hiring Signals
- [X] open roles in [Department]

## Key People
### [Name] — [Title]
- Background: [Prior companies, education]
- Talking Points: [Personal/professional hooks]

## Qualification Signals
- ✅ [Positive signal + evidence]
- ⚠️ [Concern + what to watch]
- ❓ [Unknown — ask in discovery]

## Recommended Approach
- Best entry point: [Person and why]
- Opening hook: [What to lead with]
- Discovery questions: [3 targeted questions]
```

---

## Call Preparation

**When to use:** Before any sales call — discovery, demo, negotiation, check-in, QBR.

### Information to Gather

- Company name and meeting type
- Attendees (names, titles)
- Any context: notes, emails, prior conversations
- Your goal for the meeting

### Call Prep Brief

```
# Call Prep: [Company]
Meeting: [Type] — [Date/Time]
Attendees: [Names with titles]
Your Goal: [What you want to accomplish]

## Account Snapshot
[Company, industry, size, status, last touch]

## Who You're Meeting
### [Name] — [Title]
- Role in deal: [Decision maker / Champion / Evaluator]
- Talking point: [Something to reference]

## Context & History
- [Key points from prior interactions]
- [Open commitments or action items]
- [Concerns or objections raised]

## Suggested Agenda
1. Open — [Reference trigger/last conversation]
2. [Topic] — [Discovery/value discussion]
3. [Topic] — [Demo section or proposal review]
4. Next Steps — [Propose follow-up with timeline]

## Discovery Questions
1. [Current situation]
2. [Pain points/priorities]
3. [Decision process/timeline]
4. [Success criteria]
5. [Other stakeholders]

## Potential Objections
| Objection | Response |
|-----------|----------|
| [Likely objection] | [How to address] |
```

### Meeting Type Variations

**Discovery:** Focus on understanding their world. Questions > talking. Key output: qualification signals.

**Demo/Presentation:** Tailor to their use case. Show relevant features, get feedback. Key output: technical requirements, timeline.

**Negotiation:** Address concerns, justify value. Handle objections, close gaps. Key output: path to agreement.

**Check-in/QBR:** Review value delivered, surface new needs. Key output: renewal confidence, upsell pipeline.

---

## Competitive Intelligence

**When to use:** Researching competitors, building battlecards, preparing for competitive deals.

### Research Process

For each competitor:
1. "[Competitor] product features" — what they offer
2. "[Competitor] pricing" — how they charge
3. "[Competitor] news" — recent announcements
4. "[Competitor] changelog/releases" — what they've shipped
5. "[Competitor] reviews G2/Capterra" — customer sentiment
6. "[Competitor] customers" — who uses them
7. "[Competitor] careers" — hiring signals (growth areas)

### Battlecard Structure

For each competitor:

**Overview:** What they sell, target market, pricing model, recent developments.

**Where They Win:** Areas of genuine strength with evidence.

**Where You Win:** Your advantages with proof points.

**Pricing Intel:** Model, entry price, enterprise pricing, hidden costs.

**Talk Tracks:**
- Early mention: [Strategy if competitor comes up early]
- Displacement: [Strategy if customer uses them today]
- Late addition: [Strategy if added late to evaluation]

**Objection Handling:**
| If prospect says... | Respond with... |
|---------------------|-----------------|
| "[Competitor] does X too" | "Here's how our approach differs..." |
| "[Competitor] is cheaper" | "Here's what that difference gets you..." |

**Landmine Questions** (expose weaknesses naturally):
- "How do you currently handle [area where competitor is weak]?"
- "How important is [capability you have that they lack]?"

### Tips

- Be honest about competitor strengths — credibility matters
- Focus on outcomes, not features
- Plant landmines, don't badmouth
- Track releases — what they ship reveals strategy
- Refresh monthly or before major deals

---

## Daily Sales Briefing

**When to use:** Start of day, planning priorities, reviewing what needs attention.

### Briefing Format

```
# Daily Briefing | [Date]

## #1 Priority
[Most important thing to do today and why]

## Today's Meetings
### [Time] — [Company] ([Type])
Attendees: [Names]
Context: [Deal status, last touch, stakes]
Prep: [Quick action before meeting]

## Pipeline Alerts
### Needs Attention
| Deal | Stage | Amount | Alert | Action |
|------|-------|--------|-------|--------|

### Closing This Week
| Deal | Close Date | Amount | Confidence | Blocker |

## Suggested Actions
1. [Action] — [Why now]
2. [Action] — [Why now]
3. [Action] — [Why now]
```

### Priority Ranking

1. Deal closing today/tomorrow not yet won
2. Meeting today with high-value opportunity
3. Unread message from decision-maker
4. Deal closing this week
5. Stale deal (7+ days no activity)
6. Tasks due this week

---

## Outreach Drafting

**When to use:** Cold outreach, warm intro follow-up, re-engagement, post-event follow-up.

### Process

1. **Research first** (always) — use Account Research
2. **Identify hook** (priority order):
   - Trigger event (funding, hiring, news)
   - Mutual connection
   - Their content (post, article, talk)
   - Company initiative
   - Role-based pain point
3. **Draft message** — personalized, concise, clear CTA

### Email Structure (AIDA)

```
Subject: [Personalized, <50 chars, no spam words]

[Opening: Personal hook showing research]

[Interest: Their problem/opportunity in 1-2 sentences]

[Desire: Brief proof point — similar company result]

[Action: Clear, low-friction CTA]

[Signature]
```

### Style Rules

- No markdown formatting in emails (no **bold**, no headers)
- Short paragraphs (2-3 sentences max)
- Plain text, natural tone
- One clear CTA per email

### What NOT to Do

- "I hope this email finds you well"
- Feature dumps or multiple value props
- "I noticed you work at [Company]" (obviously)
- Long paragraphs about your product

### Follow-up Sequence

- Day 3: Short, new angle
- Day 7: Different value prop
- Day 14: Break-up (final attempt, door open)

### Channel Selection

- Verified email → email preferred + LinkedIn backup
- No email → LinkedIn connection request (no pitch, <300 chars) + follow-up message
- Warm intro possible → mutual connection outreach first

---

## Call Summary / Follow-Up

**When to use:** After any sales call — process notes, extract action items, draft follow-up.

### Internal Summary

```
## Call Summary: [Company] — [Date]
Attendees: [Names and titles]
Call Type: [Discovery / Demo / Negotiation / Check-in]

### Key Discussion Points
1. [Topic] — [What was discussed, decisions]

### Customer Priorities
- [Priority 1]
- [Priority 2]

### Objections / Concerns
- [Concern] — [How addressed / status]

### Competitive Intel
- [Competitor mentions, what was said]

### Action Items
| Owner | Action | Due |
|-------|--------|-----|
| [You] | [Task] | [Date] |
| [Customer] | [Task] | [Date] |

### Deal Impact
[Stage change, risk, acceleration]
```

### Follow-Up Email

```
Hi [Name],

Thank you for taking the time to meet today.

[Key points discussed — in plain text, no markdown]

[Commitments you made]

[Clear next step with timeline]

Best,
[Name]
```

**Email style:** No markdown, short paragraphs, plain text, scannable.

---

## Pipeline Review

**When to use:** Weekly pipeline health check, prioritizing deals, identifying risks.

### Pipeline Health Dimensions

| Dimension | What to Check |
|-----------|---------------|
| Stage Progression | Deals stuck in same stage 30+ days |
| Activity Recency | Deals with no activity 14+ days |
| Close Date Accuracy | Deals with close date in past |
| Contact Coverage | Deals single-threaded (one contact) |

### Deal Prioritization

Weight by: Close Date (30%), Deal Size (25%), Stage (20%), Activity (15%), Risk (10%).

### Risk Flags

**Stale (14+ days no activity):** Re-engage or downgrade stage.
**Stuck (30+ days same stage):** Push, multi-thread, or qualify out.
**Past close date:** Update date, push to next quarter, or close lost.
**Single-threaded:** Identify additional stakeholders. Champion leaves = deal dies.

### Pipeline Hygiene

Clean up: missing close dates, missing amounts, missing next steps, no primary contact. Dead weight: 60+ days no activity with no response → mark closed-lost.

---

## Sales Forecasting

**When to use:** Building a commit, preparing for forecast calls, gap analysis.

### Default Stage Probabilities

| Stage | Probability |
|-------|------------|
| Closed Won | 100% |
| Negotiation/Contract | 80% |
| Proposal/Quote | 60% |
| Evaluation/Demo | 40% |
| Discovery/Qualification | 20% |
| Prospecting/Lead | 10% |

### Forecast Output

```
## Summary
| Metric | Value |
|--------|-------|
| Quota | $[X] |
| Closed to Date | $[X] ([%] of quota) |
| Open Pipeline | $[X] |
| Weighted Forecast | $[X] |
| Gap to Quota | $[X] |
| Coverage Ratio | [X]x |

## Scenarios
| Scenario | Amount | % Quota | Assumptions |
|----------|--------|---------|-------------|
| Best Case | $[X] | [%] | All deals close as expected |
| Likely | $[X] | [%] | Stage-weighted probabilities |
| Worst Case | $[X] | [%] | Only commit deals close |

## Commit vs Upside
Commit: Deals you'd stake forecast on. Total: $[X]
Upside: Could close but have risk. Total: $[X]
```

### Gap Analysis

If behind quota: Accelerate late-stage deals, revive stalled deals, calculate new pipeline needed at coverage ratio.

### Key Rules

- 3x pipeline coverage is healthy, below 2x is risky
- Be honest about commit — only bet-on deals
- Update close dates — stale dates kill accuracy
- Activity = signal — no recent activity = higher risk than stage suggests

---

## Practical Notes for Small Business

**For a marine hull cleaning service with ~92 clients:**
- Account research works great before approaching marinas, yacht clubs, or fleet managers
- Call prep can be simplified: know the prospect's fleet/vessels, recent maintenance, competitive landscape
- Pipeline review: even tracking 10 prospects in a spreadsheet benefits from weekly priority check
- Outreach: personalized > generic. Reference their specific boats, marina, or seasonal needs.
- Competitive intelligence: know your competitors' pricing, service areas, and weaknesses
- For a SaaS platform: all skills apply directly — research prospects, prep demos, track pipeline

**For the SaaS product (SailorSkills marketplace):**
- Battlecards for competing marine service platforms
- Pipeline tracking for marina/fleet operator prospects
- Account research to understand potential platform partners
