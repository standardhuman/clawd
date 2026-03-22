# Atomic Knowledge Base — Deployment Report

**Date:** 2026-03-22
**Status:** ✅ Deployed and running

## Access

| Item | Value |
|------|-------|
| **Web UI** | http://localhost:8080 |
| **Health** | http://localhost:8080/health |
| **MCP Endpoint** | http://localhost:8080/mcp |
| **WebSocket** | ws://localhost:8080/ws?token=<token> |
| **API Token** | `at_mo-mtTQb12CCWf_7jzYMLMDZ4cI_gOVww5rUTaAq7cA` |
| **Token Name** | howard-default |
| **Token ID** | 6f6d4b55-c0e5-4b9d-b7d1-bb16ca3d9e17 |

## Docker Setup

- **Location:** `~/code/atomic/`
- **Containers:** `atomic-server-1` (Rust API server), `atomic-web-1` (nginx + React SPA)
- **Port:** 8080 (no conflicts with existing services)
- **Volume:** `atomic_atomic-data` (persistent SQLite DB at `/data/atomic.db`)
- **Network:** `atomic_internal` (isolated)
- **Restart policy:** `unless-stopped`

## What's Working

- ✅ Server healthy, API responding
- ✅ Instance claimed with API token
- ✅ MCP endpoint operational (SSE transport, tools: `semantic_search`, `read_atom`, `create_atom`)
- ✅ 10 research reports ingested from `~/clawd/reports/`
- ✅ 2 RSS feeds configured and initially polled (47 atoms total)
- ✅ Feed auto-polling runs every 60 seconds

## RSS Feeds

| Feed | URL | Poll Interval |
|------|-----|---------------|
| Hacker News Front Page | `https://hnrss.org/frontpage` | 60 min |
| Simon Willison's Weblog | `https://simonwillison.net/atom/everything/` | 60 min |

## ⚠️ Requires Manual Setup

### 1. OpenRouter API Key (Required for AI features)
Embeddings, auto-tagging, wiki synthesis, and chat all need an AI provider. Ollama is not installed on the Mac Mini, so OpenRouter is the way to go.

**To configure:**
1. Get an API key from https://openrouter.ai
2. Open http://localhost:8080 in a browser
3. Go to Settings → enter the OpenRouter API key
4. Or via API:
```bash
curl -X PUT http://localhost:8080/api/settings/openrouter_api_key \
  -H "Authorization: Bearer at_mo-mtTQb12CCWf_7jzYMLMDZ4cI_gOVww5rUTaAq7cA" \
  -H "Content-Type: application/json" \
  -d '{"value": "sk-or-..."}'
```

Once set, embeddings will process automatically for all existing atoms.

### 2. Claude Desktop MCP Integration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "atomic": {
      "url": "http://localhost:8080/mcp",
      "headers": {
        "Authorization": "Bearer at_mo-mtTQb12CCWf_7jzYMLMDZ4cI_gOVww5rUTaAq7cA"
      }
    }
  }
}
```

## API Quick Reference

```bash
TOKEN="at_mo-mtTQb12CCWf_7jzYMLMDZ4cI_gOVww5rUTaAq7cA"

# List atoms
curl -s http://localhost:8080/api/atoms -H "Authorization: Bearer $TOKEN"

# Create atom
curl -s -X POST http://localhost:8080/api/atoms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "# Title\n\nContent here", "source_url": "optional://source"}'

# Search (requires embeddings/OpenRouter)
curl -s -X POST http://localhost:8080/api/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "search term"}'

# List feeds
curl -s http://localhost:8080/api/feeds -H "Authorization: Bearer $TOKEN"

# Manage tokens
curl -s http://localhost:8080/api/auth/tokens -H "Authorization: Bearer $TOKEN"
```

## Management Commands

```bash
# Check status
docker ps --filter "name=atomic"

# View logs
docker logs atomic-server-1 -f

# Restart
cd ~/code/atomic && docker compose restart

# Stop
cd ~/code/atomic && docker compose stop

# Update (pull latest, rebuild)
cd ~/code/atomic && git pull && docker compose up -d --build
```

## Notes

- The Obsidian import feature exists (`POST /api/import/obsidian`) if you want to import the vault
- Browser extension is in `~/code/atomic/extension/` — load as unpacked Chrome extension
- No port conflicts with existing services (Matrix: 8008/8448, Supabase: 54321-54327, OpenClaw: 18789)
