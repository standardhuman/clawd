# August Bradley's PPV (Pillars, Pipelines & Vaults) — Research Summary

*Compiled 2026-02-15*

---

## 1. What Is PPV?

PPV is a **"Life Operating System"** designed by August Bradley, built natively in Notion. It goes beyond task management — it's a comprehensive framework for aligning daily actions with life-level aspirations. Bradley describes it as a system of systems, grounded in **systems thinking**.

The name comes from its three structural layers:

### Pillars
The foundational **life areas** that define who you are and who you want to become. These are the enduring domains you want to develop (e.g., Health, Business, Relationships, Finances, Personal Growth). Everything in the system connects back to a Pillar. **If you're working on something that doesn't connect to a Pillar, it's probably not important** (or you need a new Pillar).

### Pipelines
The **execution engine** — the chain that connects aspirations to daily work. Pipelines have multiple levels:

| Level | What It Is | Review Cadence |
|-------|-----------|----------------|
| **Value Goals** | Aspirational outcomes tied to Pillars (e.g., "Make SailorSkills the go-to platform for hull cleaning") | Yearly, reviewed quarterly |
| **Goal Outcomes** | Measurable targets, similar to OKRs (e.g., "Onboard 50 new clients by Q3") | Quarterly & monthly |
| **Projects** | Concrete work packages to achieve outcomes (e.g., "Build automated booking system") | Weekly |
| **Actions/Tasks** | Daily executable steps within projects | Daily |

The key insight: **daily tasks should "emerge" naturally** from regular reviews at each level, not from ad-hoc to-do lists. You're always working on what matters because the system cascades alignment downward.

### Vaults
**Knowledge repositories** — where you collect, organize, and resurface information to support execution. Notes, references, media, contacts, resources. The idea is that knowledge shows up in the right context at the right time.

---

## 2. Structure in Notion

PPV leverages Notion's relational database capabilities heavily. The system is organized around **three zones/dashboards**:

### Alignment Zone
- Pillars database
- Value Goals database
- Goal Outcomes database
- Vision/North Star pages
- Quarterly and annual review templates

### Action Zone
- Projects database (linked to Goal Outcomes → Value Goals → Pillars)
- Action Items / Tasks database (linked to Projects)
- Daily Action dashboard (today's tasks filtered from the master list)
- Weekly review workspace

### Resource Zone (Vaults)
- Notes & knowledge base
- Media library
- Contacts/People database
- Reference materials
- All linked back to relevant Pillars and Projects via relations

**Everything connects via Notion relations and rollups.** A task links to a project, which links to a goal outcome, which links to a value goal, which links to a pillar. You can trace any daily action back to your life vision.

### Review Rhythm (Critical)
The system **only works with regular reviews**:
- **Daily**: Process tasks, check action dashboard
- **Weekly**: Review projects, adjust priorities, process inbox
- **Monthly**: Review goal outcomes, check progress
- **Quarterly**: Review value goals, recalibrate direction
- **Annually**: Review pillars and north star vision

---

## 3. Core Philosophy & Principles

- **Systems Thinking**: Don't manage tasks — design systems that produce the right tasks
- **Alignment Over Productivity**: Being busy ≠ being effective. Every action should trace to a life pillar
- **Emergence Over Planning**: Daily work should emerge from the alignment cascade, not rigid planning
- **Regular Recalibration**: The plan is always changing; frequent reviews keep you on the right path
- **Single System**: One integrated system beats a scattered toolchain (anti Evernote+Todoist+Trello+etc.)
- **Intentional Design**: Don't shoehorn old methods into new tools; design for the tool's unique capabilities
- **Growth-Oriented**: PPV is fundamentally about personal growth and life design, not just getting things done

---

## 4. How It Connects Life Areas → Daily Actions

The alignment cascade in practice:

```
North Star Vision
  └── Pillar: "SailorSkills Business"
        └── Value Goal: "Build SailorSkills into the leading hull cleaning platform"
              └── Goal Outcome: "Launch agent-powered scheduling by Q2 2026"
                    └── Project: "Build Howard's client scheduling workflow"
                          └── Action: "Define API endpoints for booking integration"
```

Each level filters and focuses the next. During weekly review, you look at your projects and ask "are these still serving my goal outcomes?" During quarterly review, you check if goal outcomes still serve your value goals. **This prevents drift** — you never wake up wondering what to work on.

---

## 5. Criticisms & Limitations

From Reddit discussions and reviews:

### Complexity / Overhead
- **Massive setup effort** — building the full system from YouTube videos takes weeks
- **High maintenance burden** — if you skip reviews, the system breaks down quickly
- **Overkill for many people** — "most of the things are actually not needed for general population"
- Some find the system "contradicting and inefficient at times"

### Notion-Specific Issues
- **Task management in Notion is clunky**, especially on mobile — worse than dedicated apps like Todoist/Things
- **Team implementation is challenging** — PPV is fundamentally a personal system
- **Performance** — large PPV setups in Notion can get slow with many linked databases

### Knowledge Management Gaps
- **Vaults lack depth** compared to dedicated PKM systems — PPV's knowledge layer is weaker than Zettelkasten/Obsidian for information emergence and networked thought
- One user noted: "PPV lacks this 'information emerging in right context' which Zettelkasten offers"

### Cost
- The full course (Notion Life Design) is a paid product; free YouTube series is extensive but incomplete
- PPV Pro (newer version) has limited public documentation

### Philosophical
- Very top-down and structured — may not suit people who think more associatively or resist rigid hierarchies
- Can become "productivity theater" — spending more time managing the system than doing work

---

## 6. Adaptations Outside Notion

### Obsidian
- **[PPV-Obsidian](https://github.com/TorniAccent/PPV-Obsidian)** — GitHub repo implementing PPV as an Obsidian vault ("Obsidian Life Manager"). Uses Dataview plugin for database-like views, folders for Action/Periodic/Templates zones
- **Flow, Vault, and Cycles (FVC)** — a derivative framework inspired by PPV, redesigned for Obsidian's link-first, local-first approach
- Common pattern: use Obsidian for Vaults (knowledge) and a separate tool for Pipelines (tasks/projects)

### Hybrid Approaches
- Many users combine **Notion for Pipelines** (projects, goals, tasks with relations) + **Obsidian for Vaults** (networked knowledge, Zettelkasten)
- Some use **Todoist/Things for daily tasks** while keeping Notion for alignment/goals
- Others extract the PPV *philosophy* (pillars → goals → projects → actions with reviews) and implement in simpler tools or even paper

### Key Takeaway on Adaptation
Bradley says PPV is about the *system design*, not the tool. In practice, Notion's relational databases are hard to replicate elsewhere. The conceptual framework transfers well; the implementation often needs significant rethinking.

---

## 7. Relevance to Brian's Setup

### What Maps Well

| PPV Concept | Brian's World |
|-------------|---------------|
| **Pillars** | SailorSkills Business, Personal Development, Health, Finances, etc. |
| **Value Goals** | Platform growth, revenue targets, agent team maturity |
| **Goal Outcomes** | Specific quarterly targets (client count, feature launches) |
| **Projects** | Agent workflows, feature builds, marketing campaigns |
| **Actions** | Daily tasks for Brian + agent assignments |
| **Vaults** | Already have Obsidian for this |
| **Review Rhythm** | Could structure Howard's daily briefings around this |

### Opportunities

1. **Agent Workflow Alignment**: PPV's cascade could formalize how agent tasks (Howard, Jacques, Marcel, sub-agents) tie to business goals. Each agent's work traces to a pillar.

2. **Hybrid Notion + Obsidian**: Use Notion (already used for client management) for Pipelines — goals, projects, action items with relational structure. Keep Obsidian for Vaults — knowledge, notes, architecture docs. This is actually a common and effective PPV adaptation.

3. **Review Automation**: Agents could facilitate the review rhythm — Howard surfaces weekly project status, flags misalignment, prompts quarterly goal review.

4. **Agent as PPV Layer**: The AI agent team could *be* the pipeline execution layer. Instead of Brian manually cascading goals → tasks, agents interpret goals and propose projects/actions.

### Risks to Watch
- **Over-engineering** — Brian already has working systems; bolting on full PPV could add friction
- **Maintenance tax** — PPV requires disciplined reviews or it rots; agents could help here
- **Notion limitations for tasks** — if daily task management stays with agents/Obsidian, Notion becomes the alignment layer only (which is fine)

### Recommended Approach
Start with the **philosophy, not the full system**:
1. Define 4-6 Pillars explicitly
2. Set Value Goals per pillar (quarterly)
3. Ensure every active project maps to a goal
4. Build a lightweight weekly review that checks alignment
5. Let agents handle the daily action layer
6. Use Obsidian Vaults as-is (they already serve this role)

---

## Sources
- [Eduardo Silva's PPV Analysis](https://esilva.net/tla_insights/ppv_bradley)
- [Effective Faith — PPV Review (Medium)](https://effectivefaith.medium.com/ppv-pillars-pipelines-and-vaults-productivity-system-review-4665ae6ca06a)
- [August Bradley's Official Site](https://www.yearzero.io/notion)
- [Notion Life Design Course](https://www.notionlifedesign.com/)
- [PPV-Obsidian GitHub](https://github.com/TorniAccent/PPV-Obsidian)
- [August Bradley YouTube Series](https://www.youtube.com/playlist?list=PLAl0gPKnL3V8s7dPXoo07mYnuErhWVk8b)
- Various Reddit threads from r/Notion, r/todoist
