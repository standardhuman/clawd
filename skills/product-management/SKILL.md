---
name: product-management
description: Full product management toolkit — writing feature specs/PRDs, managing roadmaps, stakeholder communications, user research synthesis, competitive analysis, and metrics tracking. Use when speccing features, prioritizing a roadmap, writing status updates, synthesizing user research, analyzing competitors, setting OKRs, or reviewing product metrics.
metadata:
  author: Anthropic (adapted)
  version: 1.0.0
  source: github.com/anthropics/cowork-plugins
---

# Product Management

> Adapted from [Anthropic's open-source Cowork plugins](https://github.com/anthropics/cowork-plugins) — knowledge-work-plugins/product-management.

Comprehensive product management skill covering the full PM workflow: feature specs, roadmap management, stakeholder communications, user research synthesis, competitive analysis, and metrics tracking.

---

## Feature Specs & PRDs

**When to use:** Speccing a new feature, writing a PRD, defining acceptance criteria, prioritizing requirements, or documenting product decisions.

### PRD Structure

1. **Problem Statement** — 2-3 sentences: the user problem, who experiences it, cost of not solving it. Ground in evidence.
2. **Goals** — 3-5 specific, measurable outcomes. Distinguish user goals from business goals. Goals should be outcomes, not outputs.
3. **Non-Goals** — 3-5 things explicitly out of scope with brief rationale. Prevents scope creep.
4. **User Stories** — "As a [user type], I want [capability] so that [benefit]." Include edge cases and different personas. Order by priority.
5. **Requirements** — Categorized as Must-Have (P0), Nice-to-Have (P1), Future Considerations (P2). Each with acceptance criteria.
6. **Success Metrics** — Leading indicators (days to weeks: adoption, activation, task completion, error rate) and lagging indicators (weeks to months: retention, revenue, NPS, support tickets).
7. **Open Questions** — Tagged with who should answer. Distinguish blocking from non-blocking.
8. **Timeline Considerations** — Hard deadlines, dependencies, suggested phasing.

### User Story Best Practices

Good user stories are: Independent, Negotiable, Valuable, Estimable, Small, Testable (INVEST).

**Common mistakes:**
- Too vague: "As a user, I want the product to be faster"
- Solution-prescriptive: "As a user, I want a dropdown menu"
- No benefit: "As a user, I want to click a button"
- Too large: "As a user, I want to manage my team"

### Requirements Categorization (MoSCoW)

- **Must have:** Non-negotiable. Feature can't ship without these.
- **Should have:** Important but not critical for launch. High-priority fast follows.
- **Could have:** Desirable if time permits.
- **Won't have (this time):** Explicitly out of scope. May revisit later.

Be ruthless about P0s. The tighter the must-have list, the faster you ship and learn.

### Acceptance Criteria

Use Given/When/Then format or checklist:
- Given [precondition], When [action], Then [expected outcome]
- Cover happy path, error cases, and edge cases
- Be specific about expected behavior, not implementation
- Include negative test cases

### Scope Management

Recognizing scope creep: requirements added after approval, "small" additions accumulating, building features no one asked for, launch dates moving without re-scoping.

Preventing it: explicit non-goals, any scope addition requires a removal or timeline extension, separate v1 from v2, "parking lot" for good ideas not in scope.

---

## Roadmap Management

**When to use:** Creating a roadmap, reprioritizing features, mapping dependencies, choosing roadmap formats, or presenting tradeoffs.

### Roadmap Formats

**Now / Next / Later** — Simplest and often most effective:
- **Now:** Committed work, high confidence
- **Next:** Planned work, good confidence in what
- **Later:** Directional, strategic bets

Best for: most teams, external communication, avoiding false precision on dates.

**Quarterly Themes** — 2-3 themes per quarter mapping to OKRs. Shows WHY you're building what you're building.

**OKR-Aligned** — Map items directly to Key Results with expected impact. Creates clear accountability.

**Timeline/Gantt** — Calendar-based, shows parallelism and dependencies. Good for execution planning with engineering. NOT good for external communication.

### Prioritization Frameworks

**RICE Score:** (Reach × Impact × Confidence) / Effort
- Reach: concrete number of users affected
- Impact: 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal
- Confidence: 100%=data-backed, 80%=some evidence, 50%=gut feel
- Effort: person-months

**ICE Score:** Impact × Confidence × Ease (all 1-10). Simpler than RICE, good for quick prioritization.

**Value vs Effort Matrix:**
- High value, Low effort → Quick wins (do first)
- High value, High effort → Big bets (plan carefully)
- Low value, Low effort → Fill-ins (spare capacity)
- Low value, High effort → Money pits (don't do)

### Dependency Management

Categories: Technical, Team, External, Knowledge, Sequential.

For each dependency: assign owner, set "need by" date, build buffer, have contingency plan. To reduce dependencies: simpler version, interface contracts/mocks, different sequencing, absorb work into your team.

### Capacity Planning

Healthy allocation: 70% planned features, 20% technical health, 10% unplanned buffer.

If roadmap exceeds capacity, cut scope — don't pretend people can do more. When adding to roadmap, always ask: "What comes off?"

### Communicating Roadmap Changes

1. Acknowledge the change directly
2. Explain the reason (new information)
3. Show the tradeoff (what was deprioritized)
4. Show the new plan
5. Acknowledge impact on affected stakeholders

Batch updates at natural cadences unless truly urgent. Track how often the roadmap changes.

---

## Stakeholder Communications

**When to use:** Writing weekly updates, monthly reports, launch announcements, risk communications, or documenting decisions.

### Update Templates by Audience

**Executive/Leadership:**
```
Status: [Green / Yellow / Red]
TL;DR: [One sentence]
Progress: [Outcomes tied to goals]
Risks: [With mitigation. Ask if needed.]
Decisions needed: [Options + recommendation. Need by date.]
Next milestones: [With dates]
```
Keep under 200 words. Lead with conclusion. Status color = genuine assessment.

**Engineering Team:**
```
Shipped: [With links]
In progress: [Owner, expected completion, blockers]
Decisions: [Made (with rationale) and needed (with options)]
Priority changes: [What and why]
Coming up: [With context on why]
```

**Cross-Functional Partners:**
```
What's coming: [Date, what it means for their team]
What we need from you: [Specific ask, context, deadline]
Decisions made: [How it affects them]
Open for input: [Topic, how to provide feedback]
```

**Customer/External:**
- No internal jargon. Frame as what the customer can now DO.
- Be honest about timelines. "Later this quarter" > a date you might miss.

### Green/Yellow/Red Status

- **Green:** Genuinely going well. Not the default.
- **Yellow:** At risk. Move here at FIRST sign of risk. Good risk management.
- **Red:** Off track. Need help. Don't wait until too late.

### Risk Communication (ROAM)

- **Resolved:** No longer a concern
- **Owned:** Someone is actively managing it
- **Accepted:** Proceeding without mitigation (documented rationale)
- **Mitigated:** Reduced to acceptable level

For each risk: state clearly, quantify impact, state likelihood, present mitigation, make specific ask.

### Decision Documentation (ADRs)

```
# [Decision Title]
## Status: [Proposed / Accepted / Deprecated / Superseded]
## Context: [Situation requiring a decision]
## Decision: [What was decided, clearly and directly]
## Consequences: [Positive, negative, what it enables/prevents]
## Alternatives Considered: [What was rejected and why]
```

Write close to when the decision is made. Include who was involved. Document context generously.

### Meeting Facilitation

- **Stand-up:** 15 min. Focus on blockers. Cancel if nothing to sync.
- **Sprint Planning:** Come with proposed priority order. Push back on overcommitment.
- **Retrospective:** Psychological safety. 1-3 action items max. Follow up on previous retro items.
- **Stakeholder Review:** Demo real product. Frame feedback collection specifically. Capture visibly.

---

## User Research Synthesis

**When to use:** Analyzing interview notes, survey responses, support tickets, or behavioral data to identify themes, build personas, or prioritize opportunities.

### Thematic Analysis Process

1. **Familiarization:** Read all data before coding
2. **Initial coding:** Tag observations with descriptive codes. Be generous — easier to merge than split.
3. **Theme development:** Group codes into candidate themes
4. **Theme review:** Check themes against data — sufficient evidence? Distinct?
5. **Theme refinement:** 1-2 sentence description per theme
6. **Report:** Themes as findings with supporting evidence

### Affinity Mapping

1. One observation per note
2. Cluster by similarity (don't pre-define categories)
3. Label clusters
4. Organize into higher-level groups
5. Outliers are interesting — don't force-fit

### Interview Note Analysis

For each interview, extract:
- **Observations:** Behaviors vs. attitudes. Note context.
- **Quotes:** Specific and vivid. Attribute to type, not name.
- **Behaviors vs. stated preferences:** What people DO often differs from what they SAY.
- **Intensity signals:** Emotional language, frequency, workaround effort, consequence of failure.

Cross-interview: look for patterns, note frequency, identify segments, surface contradictions, find surprises.

### Survey Data Interpretation

- Look at distribution shape, not just averages (bimodal ≠ normal)
- Segment by user type — aggregates mask differences
- Treat open-ended responses like mini interview notes
- Don't over-interpret small differences

### Combining Qual and Quant

- Qualitative first → reveals WHAT and WHY → generates hypotheses
- Quantitative validation → reveals HOW MUCH and HOW MANY → tests hypotheses
- When sources disagree: check different populations, stated vs. actual behavior, or question design. Report disagreement honestly.

### Persona Development

Build from research data, not imagination:
1. Identify behavioral pattern clusters
2. Define distinguishing variables
3. Create profiles: behaviors, goals, pain points, context, quotes
4. Validate with quantitative data if possible

3-5 personas is the sweet spot. Behavior predicts needs better than demographics.

### Opportunity Sizing

Score on: Impact (users × frequency × severity), Evidence strength, Strategic alignment, Feasibility.

Use ranges: "1,500-2,500 users monthly" not "2,137 users monthly."

---

## Competitive Analysis

**When to use:** Researching competitors, comparing product capabilities, assessing positioning, or preparing competitive briefs.

### Competitive Set

- **Direct:** Same problem, same users, same way
- **Indirect:** Same problem, different approach (including manual processes/spreadsheets)
- **Adjacent:** Don't compete today but could (platform expansion, startup growth)
- **Substitutes:** Entirely different solutions (hiring a person, outsourcing)

### Feature Comparison Matrix

Rate each competitor on capability areas using: Strong / Adequate / Weak / Absent.

Tips: Rate on real experience, not marketing claims. Weight by customer importance. Be honest where competitors are ahead. Update regularly.

### Positioning Analysis

Extract each competitor's positioning: For [target customer] who [need], [Product] is a [category] that [benefit]. Unlike [alternative], [Product] [differentiator].

Analyze message architecture: Category claim → Differentiator → Value proposition → Proof points.

Look for: unclaimed positions, crowded positions, emerging positions, vulnerable positions.

### Win/Loss Analysis

Most actionable competitive intelligence. Interview wins and losses:
- What problem? What alternatives evaluated? Why choose/not choose us?
- Track reasons over time. Segment by deal type.
- Distinguish product reasons from non-product reasons (pricing, brand, relationship, timing).

### Market Trend Analysis

For each trend: What's changing → Why now → Who's affected → Timeline → Implication → Competitor response.

Response options: Lead (invest early), Fast follow (wait for demand signals), Monitor (set triggers), Ignore (document why).

---

## Metrics Tracking

**When to use:** Setting up OKRs, building dashboards, running metrics reviews, identifying trends, or choosing metrics.

### Product Metrics Hierarchy

**North Star Metric:** Single metric capturing core user value. Must be value-aligned, leading, actionable, understandable.

**L1 Metrics (Health Indicators):** 5-7 metrics across the user lifecycle:
- **Acquisition:** New signups, conversion rate, channel mix, CAC
- **Activation:** Key action completion, time to activate, setup completion
- **Engagement:** DAU/WAU/MAU, stickiness (DAU/MAU), core action frequency
- **Retention:** D1/D7/D30 retention, cohort curves, churn rate
- **Monetization:** Free-to-paid conversion, MRR/ARR, ARPU, net revenue retention
- **Satisfaction:** NPS, CSAT, support volume

**L2 Metrics (Diagnostic):** Funnel conversion, feature-level usage, segment breakdowns, performance metrics.

### OKRs

**Objectives:** Qualitative, aspirational, time-bound, memorable.
**Key Results:** Quantitative, specific, outcome-based (not output-based), 2-4 per objective.

Target 70% completion for stretch OKRs. Grade honestly: 0.0-0.3=missed, 0.4-0.6=progress, 0.7-1.0=achieved.

### Metric Review Cadences

- **Weekly (15-30 min):** North Star, key L1 metrics, active experiments, anomalies
- **Monthly (30-60 min):** Full L1 scorecard, OKR progress, cohort analysis, feature adoption
- **Quarterly (60-90 min):** OKR scoring, trend analysis, YoY comparisons, strategy adjustment

### Dashboard Design

Principles: Start with the question (not the data). Hierarchy of information. Context over numbers (current + comparison + trend). Fewer metrics, more insight (5-10). Consistent time periods. Visual status (green/yellow/red). Actionable metrics only.

Anti-patterns: Vanity metrics, too many metrics, no comparison, stale dashboards, output dashboards, one-size-fits-all.

### Alerting

- Threshold alerts (metric crosses critical value)
- Trend alerts (sustained decline over days/weeks)
- Anomaly alerts (significant deviation from expected range)

Every alert should be actionable with a defined owner.

---

## Practical Tips

**Research tools:** Web search for competitive analysis and market research. File access for existing specs, research docs, and roadmaps. Notion or other knowledge bases for team documentation.

**For a small business building a SaaS product:**
- Start with a simple Now/Next/Later roadmap — avoid over-engineering planning
- RICE scoring is great for comparing a large backlog of feature requests
- Weekly metrics checks are sufficient early on — don't over-instrument before product-market fit
- User research doesn't require formal studies — 5 customer interviews can reveal patterns
- Competitive analysis is most valuable for positioning, not feature copying
