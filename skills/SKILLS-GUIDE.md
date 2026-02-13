# Skills Guide — Best Practices Reference

*Distilled from Anthropic's "Complete Guide to Building Skills for Claude" (Jan 2026)*

## Structure

```
skill-name/           # kebab-case, no spaces/caps/underscores
├── SKILL.md           # Required — exact case
├── scripts/           # Optional — executable code
├── references/        # Optional — docs loaded on demand
└── assets/            # Optional — templates, icons, etc.
```

**No README.md inside skill folders.** All docs go in SKILL.md or references/.

## YAML Frontmatter

```yaml
---
name: skill-name          # Required. kebab-case. Match folder name.
description: |             # Required. WHAT + WHEN + triggers. <1024 chars. No XML (<>).
  What it does. Use when user says "X", "Y", or asks to "Z".
license: MIT               # Optional
compatibility: |           # Optional, 1-500 chars
  Requires macOS, network access
metadata:                  # Optional
  author: Name
  version: 1.0.0
  mcp-server: server-name
---
```

**Forbidden:** XML `<>` in frontmatter, "claude" or "anthropic" in skill names.

## Progressive Disclosure (3 levels)

1. **YAML frontmatter** — always loaded in system prompt. Enough for Claude to know *when* to use it.
2. **SKILL.md body** — loaded when Claude thinks skill is relevant.
3. **Linked files** (`references/`, `scripts/`) — loaded only as needed.

Keep SKILL.md under 5,000 words. Move detailed docs to `references/`.

## Description Field (Most Important)

Structure: `[What it does] + [When to use it] + [Key capabilities]`

✅ Good: Specific trigger phrases, mentions file types, actionable
❌ Bad: Vague ("Helps with projects"), missing triggers, too technical

## Skill Body Structure

```markdown
# Skill Name

## Instructions

### Step 1: [First step]
Clear explanation + example commands.
Expected output: [success looks like]

## Examples
User says: "..." → Actions: 1, 2, 3 → Result: ...

## Troubleshooting
Error: [message] → Cause: [why] → Solution: [fix]
```

## Categories

1. **Document & Asset Creation** — consistent output (docs, designs, code)
2. **Workflow Automation** — multi-step processes, validation gates
3. **MCP Enhancement** — workflow guidance on top of MCP tool access

## Testing Checklist

- [ ] Triggers on obvious tasks
- [ ] Triggers on paraphrased requests
- [ ] Does NOT trigger on unrelated topics
- [ ] Produces correct outputs
- [ ] Error handling works

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Won't trigger | Description too vague | Add specific trigger phrases |
| Triggers too often | Scope too broad | Add negative triggers, be specific |
| Instructions ignored | Too verbose or buried | Put critical stuff at top, use ## Critical headers |
| Slow/degraded | Too much content loaded | Move detail to references/, reduce enabled skills |

## Quick Validation

- [ ] Folder = kebab-case
- [ ] SKILL.md exists (exact case)
- [ ] Frontmatter has `---` delimiters
- [ ] `name` = kebab-case, matches folder
- [ ] `description` has WHAT + WHEN
- [ ] No `<>` anywhere
- [ ] Under 5,000 words
- [ ] No README.md inside skill folder

---

*Source: https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf*
