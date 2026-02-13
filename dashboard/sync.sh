#!/usr/bin/env bash
# Dashboard Sync Script
# Reads structured data from project files and updates data.json
# Run manually: ./sync.sh
# Or schedule via launchd/cron
#
# No AI needed — just file parsing and JSON assembly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_FILE="$SCRIPT_DIR/data.json"
MEMORY_DIR="$HOME/clawd/memory"
MEMORY_FILE="$HOME/clawd/MEMORY.md"
HANDOFF_FILE="$HOME/AI/business/sailorskills/pro/HANDOFF.md"
DASHBOARD_REPO="$SCRIPT_DIR"

# Ensure jq is available
if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install with: brew install jq"
  exit 1
fi

echo "📊 Dashboard sync starting..."

# --- 1. Update timestamp ---
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S-08:00")
TEMP=$(mktemp)
jq --arg ts "$NOW" '.lastUpdated = $ts' "$DATA_FILE" > "$TEMP" && mv "$TEMP" "$DATA_FILE"

# --- 2. Update deadlines (days remaining) ---
TODAY_EPOCH=$(date +%s)

# Pro app launch (March 1)
LAUNCH_EPOCH=$(date -j -f "%Y-%m-%d" "2026-03-01" +%s 2>/dev/null || echo "")
if [ -n "$LAUNCH_EPOCH" ]; then
  DAYS_TO_LAUNCH=$(( (LAUNCH_EPOCH - TODAY_EPOCH) / 86400 ))
  TEMP=$(mktemp)
  jq --argjson days "$DAYS_TO_LAUNCH" '
    .deadlines |= map(
      if .text == "Pro app launch" then .daysAway = $days else . end
    ) |
    .projects |= map(
      if .name == "SailorSkills Pro" then .metric = "\($days) days to launch" else . end
    )
  ' "$DATA_FILE" > "$TEMP" && mv "$TEMP" "$DATA_FILE"
fi

# 1120-S deadline (March 15)
FILING_EPOCH=$(date -j -f "%Y-%m-%d" "2026-03-15" +%s 2>/dev/null || echo "")
if [ -n "$FILING_EPOCH" ]; then
  DAYS_TO_FILING=$(( (FILING_EPOCH - TODAY_EPOCH) / 86400 ))
  TEMP=$(mktemp)
  jq --argjson days "$DAYS_TO_FILING" '
    .deadlines |= map(
      if .text == "1120-S filing deadline" then .daysAway = $days else . end
    ) |
    .needsAttention |= map(
      if .title == "1120-S Filing" then .detail = "\($days) days remaining" else . end
    )
  ' "$DATA_FILE" > "$TEMP" && mv "$TEMP" "$DATA_FILE"
fi

# --- 3. Check Jacques HANDOFF for Pro progress ---
if [ -f "$HANDOFF_FILE" ]; then
  # Try to extract progress percentage if mentioned
  PROGRESS=$(grep -oE '[0-9]+%' "$HANDOFF_FILE" | head -1 | tr -d '%' || echo "")
  if [ -n "$PROGRESS" ] && [ "$PROGRESS" -gt 0 ] 2>/dev/null; then
    TEMP=$(mktemp)
    jq --argjson p "$PROGRESS" '
      .projects |= map(
        if .name == "SailorSkills Pro" then .progress = $p else . end
      ) |
      .sprintProgress.overallProgress = $p
    ' "$DATA_FILE" > "$TEMP" && mv "$TEMP" "$DATA_FILE"
  fi

  # Extract build number if present
  BUILD=$(grep -oiE 'build [0-9]+' "$HANDOFF_FILE" | tail -1 || echo "")
  if [ -n "$BUILD" ]; then
    BUILD_NUM=$(echo "$BUILD" | grep -oE '[0-9]+')
    TEMP=$(mktemp)
    jq --arg b "TestFlight $BUILD_NUM" '
      .sprintProgress.currentBuild = $b
    ' "$DATA_FILE" > "$TEMP" && mv "$TEMP" "$DATA_FILE"
  fi
fi

# --- 4. Check git status for recent activity ---
cd "$DASHBOARD_REPO"
LAST_COMMIT_MSG=$(git log -1 --format="%s" 2>/dev/null || echo "")
LAST_COMMIT_DATE=$(git log -1 --format="%Y-%m-%d" 2>/dev/null || echo "")

# --- 5. Auto-push if there are changes ---
if [ -n "$(git status --porcelain "$DATA_FILE" 2>/dev/null)" ]; then
  git add "$DATA_FILE"
  git commit -m "chore: auto-sync dashboard data ($(date +%Y-%m-%d))" --quiet
  git push --quiet 2>/dev/null && echo "✅ Pushed to GitHub → Vercel auto-deploy" || echo "⚠️ Push failed (offline?)"
else
  echo "ℹ️  No changes to push"
fi

echo "📊 Dashboard sync complete"
