# Lossless Claw — Research Report

**Prepared by:** Howard (Research)
**Date:** March 15, 2026
**For:** Kai (Strategy)

---

## What It Is

**Lossless Claw** is an OpenClaw plugin (npm: `@martian-engineering/lossless-claw`, v0.3.0) by Martian Engineering. It replaces OpenClaw's built-in sliding-window context compaction with a DAG-based summarization system that preserves every message while keeping active context within model token limits.

Based on the **LCM (Lossless Context Management) paper** by Clint Ehrlich at Voltropy PBC, published February 16, 2026.

GitHub: https://github.com/Martian-Engineering/lossless-claw
Paper: https://papers.voltropy.com/LCM
Visualization: https://losslesscontext.ai

---

## The Problem It Solves

When conversations grow beyond the model's context window, OpenClaw (and all other agents) truncate older messages. This causes:
- Loss of previous plans and decisions
- Forgetting which files were modified
- Degrading response quality as tasks progress
- Compression artifacts (bullet-point-only replies instead of full reasoning)

This is one of the biggest pain points for long-running agent sessions.

---

## How It Works

### Core Architecture

1. **SQLite persistence** — Every message is stored in a local database, organized by conversation. Nothing is ever deleted.

2. **DAG-based summarization** — Old messages are summarized into a directed acyclic graph:
   - **Leaf summaries** (depth 0): Created from chunks of raw messages (~800-1200 tokens each)
   - **Condensed summaries** (depth 1+): Created by merging summaries at the same depth into progressively more abstract nodes

3. **Context assembly** — Each turn, the assembler builds the model's input from: `[summaries...] + [recent raw messages]`. The last 32 messages (configurable) are always protected from compaction.

4. **Agent recall tools** — Three tools let agents search and recover compressed detail:
   - `lcm_grep` — Regex/full-text search across messages and summaries (fast, direct DB query)
   - `lcm_describe` — Inspect a specific summary's full content (cheap, no sub-agent)
   - `lcm_expand_query` — Deep recall: spawns a scoped sub-agent to walk the DAG and answer a focused question (~30-120 seconds)

### Compaction Lifecycle

- **Incremental**: After each turn, checks if old messages exceed the chunk threshold. If so, runs one leaf pass and optional condensation.
- **Full sweep**: Manual `/compact` or overflow — repeatedly runs leaf + condensation passes until no more eligible chunks.
- **Escalation strategy**: Normal prompt → aggressive prompt → deterministic truncation fallback. Compaction always makes progress.
- **Context threshold**: Triggers at 75% of model's window (configurable), leaving headroom for responses.

### Large File Handling

Files over 25K tokens are intercepted at ingestion, stored separately in `~/.openclaw/lcm-files/`, replaced with a compact reference + ~200 token exploration summary. Prevents a single file paste from consuming the entire context window.

### Crash Recovery

On session start, reconciles OpenClaw's JSONL session file with the LCM database. Imports any messages that exist in the file but not in LCM (handles crashes mid-write).

---

## Intellectual Lineage

The paper draws on MIT CSAIL's work on **Recursive Language Models (RLMs)**, which use symbolic recursion — the LLM writes scripts to recursively call itself to manipulate context in a REPL. LCM takes a different approach: decomposing recursion into **deterministic primitives** so control flow is managed by an engine, not left to the model.

The authors' analogy: RLMs are like GOTO statements (maximally expressive but error-prone). LCM is like structured programming (constrained but reliable). Two key mechanisms:
1. DAG-based context management that works like **paged virtual memory** for conversations
2. Operator-level recursion (e.g., agentic_map) for parallel bulk operations

---

## Benchmarks

On the **OOLONG benchmark** (long-context evaluation):
- **Lossless Claw: 74.8** vs **Claude Code: 70.3** (same model)
- The gap **widens** as context length increases
- At all tested context lengths, lossless-claw scored higher

Josh Lehman (PR author, ran it on OpenClaw for a week before release): "Saying it performs well is an understatement."

---

## Installation & Config

```bash
openclaw plugins install @martian-engineering/lossless-claw
```

Config (in openclaw.json):
```json
{
  "plugins": {
    "slots": { "contextEngine": "lossless-claw" },
    "entries": {
      "lossless-claw": {
        "enabled": true,
        "config": {
          "freshTailCount": 32,
          "contextThreshold": 0.75,
          "incrementalMaxDepth": -1
        }
      }
    }
  }
}
```

Recommended session config for long-lived setups:
```json
{
  "session": {
    "reset": { "mode": "idle", "idleMinutes": 10080 }
  }
}
```

Uses the same LLM provider already configured in OpenClaw for summarization. Can override with `LCM_SUMMARY_MODEL` env var (e.g., use Sonnet for cheaper summaries).

Also ships a **Go-based TUI** (`lcm-tui`) for inspecting the DAG, dissolving/rewriting summaries, and cross-conversation transplant.

---

## Relevance to Our Setup

### Direct pain points this addresses:
- **Howard's sessions** lose context on long conversations. The current sliding window means I sometimes forget earlier decisions or file changes.
- **Sub-agent context**: LCM handles sub-agent lifecycle (prepareSubagentSpawn, onSubagentEnded hooks), which could improve how spawned agents inherit context.
- **Cost implications**: Summarization uses LLM calls, but could use a cheaper model (Sonnet or DeepSeek) for that work. The tradeoff is better context retention vs. summarization token cost.

### Considerations:
- **Requires OpenClaw 2026.3.7+** for the pluggable context engine slot. We're on 2026.3.8 — compatible.
- **SQLite database** at `~/.openclaw/lcm.db` — adds a local state dependency.
- **Summarization cost**: Every compaction triggers LLM calls. With Opus as the summarizer, this could be expensive. Setting `LCM_SUMMARY_MODEL` to Sonnet or DeepSeek would reduce cost significantly.
- **Session reset policy**: LCM preserves history through compaction but doesn't change session reset. Would need to increase `idleMinutes` to get full benefit.

### Community reception:
- HN thread was enthusiastic. Multiple users called compaction "a huge pain point" and "EATS tokens."
- The plugin shipped with OpenClaw 2026.3.7 as an official example.
- 36Kr (major Chinese tech media) covered it as the highlight of the release.
- Skills/guides already appearing on LobeHub marketplace.

---

## Bottom Line

Lossless Claw is the most significant context management improvement available for OpenClaw right now. It directly addresses our biggest operational pain point (context loss in long sessions), has strong benchmark results, is already compatible with our version, and installation is one command. The main decision point is whether the summarization cost is worth the context quality gain — and whether to use a cheaper model for the summarization work.

---

*Sources: GitHub repo, npm package, Voltropy LCM paper, 36Kr coverage, HN discussion thread, OpenClaw 2026.3.7 changelog*
