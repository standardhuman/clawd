---
name: handoff
description: Session continuity handoff. Use when context window is filling up, ending a work session, or when you say "handoff". Captures current state so the next agent session can pick up seamlessly. Creates/updates HANDOFF.md in the project, commits progress, and updates relevant docs.
---

# Handoff Skill

Handoff is for **session continuity** — capturing your current context before the window fills so the next instance of yourself can pick up without losing momentum.

## When to Trigger

- User says "handoff" or "hand off"
- Context window is getting full (you notice responses slowing, or you're deep in a complex task)
- End of a significant work block
- Before switching to a different project

## Handoff Process

### 1. Assess Current State

Before writing anything, evaluate:
- **What project/repo am I in?** (check `pwd`, `git remote -v`)
- **What branch am I on?** (`git branch --show-current`)
- **What was I working on?** (the task, goal, or problem)
- **What's the current state?** (done, in-progress, blocked)
- **What uncommitted changes exist?** (`git status --short`)

### 2. Commit Work in Progress

If there are uncommitted changes:
```bash
git add -A
git status --short  # Review what's staged
git commit -m "wip: [brief description of current state]"
```

Use `wip:` prefix for work-in-progress commits. Include enough context that the next session understands what was happening.

### 3. Write/Update HANDOFF.md

Create or update `HANDOFF.md` at the project root with:

```markdown
# Handoff

*Last updated: [timestamp]*
*Branch: [current branch]*
*Agent: [your name if relevant]*

## Current Task
[What you were working on — be specific]

## State
[Where things stand right now]
- What's done
- What's in progress
- What's blocked or unclear

## Key Context
[Important decisions, discoveries, or context that would be lost]
- Why certain approaches were taken
- What was tried and didn't work
- Important files or locations

## Next Steps
[Clear actions for the next session to pick up]
1. [First thing to do]
2. [Second thing]
3. ...

## Open Questions
[Anything unresolved that needs human input or further investigation]

## Files Changed
[Key files touched this session — helps next session know where to look]
```

**Adapt this structure** to what matters for the current project and moment. Don't fill sections that aren't relevant. Add sections if needed.

### 4. Commit the Handoff

```bash
git add HANDOFF.md
git commit -m "docs: update handoff"
git push
```

### 5. Update External Docs (if relevant)

If the project has related documentation elsewhere (e.g., Obsidian vault for SailorSkills), update it with a brief summary:
- Check TOOLS.md for vault/doc locations
- Add a dated entry noting the session's progress
- Link to the repo/branch if helpful

### 6. Notify

Let the user know the handoff is complete:
- Summarize what was captured
- Note the branch and last commit
- Mention anything that needs human attention before the next session

## Picking Up from a Handoff

When starting a new session on a project:

1. **Check for HANDOFF.md** at the project root
2. **Read it first** — this is your prior self's message to you
3. **Check git log** for recent commits and context
4. **Continue from "Next Steps"** unless the user redirects

## Principles

- **Capture what you'd want to know** — imagine starting fresh with no memory
- **Be specific** — vague handoffs waste the next session's time
- **Commit early** — don't lose work to a crashed session
- **Adapt to context** — a quick bugfix needs less than a major refactor
- **Err on the side of more context** — tokens are cheaper than lost momentum
