---
name: resume
description: Resume work from a previous session. Use when starting a new session on a project, when you say "resume", or when picking up where you left off. Reads HANDOFF.md and orients to current state before continuing work.
metadata:
  author: Howard
  version: 1.0.0
---

# Resume Skill

Resume is for **picking up where you left off** — orienting yourself to a project's current state after a handoff or gap between sessions.

## When to Trigger

- User says "resume" or "pick up where we left off"
- Starting a new session on an existing project
- User references prior work without full context

## Resume Process

### 1. Find the Project

If not already in a project directory:
- Ask which project to resume, or
- Check recent work in `memory/` for context on what was being worked on

### 2. Check for HANDOFF.md

```bash
cat HANDOFF.md 2>/dev/null || echo "No HANDOFF.md found"
```

If found, this is your primary orientation document. Read it carefully — it's a message from your prior self.

### 3. Gather Additional Context

Even with a handoff, gather fresh context:

```bash
# What branch are we on?
git branch --show-current

# Recent commits (what happened?)
git log --oneline -10

# Any uncommitted changes?
git status --short

# When was the last work done?
git log -1 --format="%ar: %s"
```

### 4. Check for Related Context

Look for additional orientation sources:
- **AGENTS.md** — project-specific instructions
- **README.md** — project overview
- **Recent memory entries** — check `memory/YYYY-MM-DD.md` for relevant dates
- **TOOLS.md** — any project-specific tool notes

### 5. Orient and Summarize

Before diving in, briefly summarize your understanding:
- What project this is
- What was being worked on
- Current state (from HANDOFF.md or git history)
- What the next steps are

Ask clarifying questions if anything is unclear.

### 6. Continue from Next Steps

If HANDOFF.md exists, start with the first item in "Next Steps" unless the user redirects.

If no HANDOFF.md exists:
- Review recent git commits to understand the trajectory
- Ask the user what they'd like to work on

## Resume Without HANDOFF.md

Sometimes there's no handoff doc. In that case:

1. **Check git log** — recent commits tell a story
2. **Check memory files** — look for dated entries about this project
3. **Check for WIP commits** — `git log --oneline | grep -i wip` shows incomplete work
4. **Look at modified files** — `git diff --stat HEAD~5` shows recent focus areas
5. **Ask** — if unclear, ask the user what they remember or want to focus on

## Orientation Checklist

Before starting work, confirm you know:

- [ ] What project/repo you're in
- [ ] What branch you're on
- [ ] What the current task/goal is
- [ ] What state things are in (done, in-progress, blocked)
- [ ] What the immediate next step is

If any of these are unclear, ask before proceeding.

## Principles

- **Read before acting** — don't assume, orient first
- **Trust the handoff** — your prior self left notes for a reason
- **Verify current state** — things may have changed since the handoff
- **Ask when uncertain** — better to clarify than waste cycles
- **Update if stale** — if the handoff is outdated, update it as you work
