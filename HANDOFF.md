# Handoff

*Last updated: 2026-02-01 17:32 PST*
*Branch: main*
*Agent: Howard*

## Current Task

Investigating why memory/recall isn't working across sessions, then discussing storage for Brian's upcoming CIR course materials.

## State

**Memory System Investigation - IDENTIFIED:**
- OpenClaw's `memorySearch` is configured correctly (confirmed via Brian's screenshot)
- **Root cause:** OpenAI embeddings API hitting 429 (quota exceeded)
- Sessions are NOT being indexed (0/1125 sessions indexed)
- When context fills → compaction happens → no summary survives → memories lost
- This session hit 5 compactions, losing earlier context about CIR course discussion

**CIR Course Setup - READY:**
- Created `~/clawd/projects/communication-dojo/` folder structure
- Course starts **February 4, 2026**
- Brian will share course materials when he gets access
- Storage location: `~/clawd/courses/cir/` (or use existing `projects/communication-dojo/materials/`)

## Key Context

1. **Why memory failed:** Not a config issue — it's an API quota issue. Brian needs to either top up OpenAI credits or switch to a different embeddings provider.

2. **Session was heavy:** Multiple compactions lost earlier detailed discussion about course materials and how to organize them.

3. **Communication Dojo materials already exist:** Found PDFs in `projects/communication-dojo/materials/`:
   - needs-alphabetical.pdf
   - needs-values-motivations.pdf

## Next Steps

1. **Fix memory indexing** — Check OpenAI usage/billing, top up credits, or investigate alternative embedding providers for OpenClaw
2. **Wait for CIR course access** (Feb 4) — Store materials when Brian gets them
3. **Consider `/new` session** — This one hit 97% context (194k/200k tokens)

## Open Questions

- Should we consolidate "Communication Dojo" and "CIR" into one folder? They seem related (NVC-based communication courses)
- What embedding provider alternatives does OpenClaw support?

## Files Changed

- `memory/2026-02-01.md` — Today's session notes
- `projects/communication-dojo/` — Course materials folder (may have been created earlier today)
- Various workspace files committed (SOUL.md, USER.md, MEMORY.md, etc.)
