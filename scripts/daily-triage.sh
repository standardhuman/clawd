#!/bin/bash
# Daily Triage Script — READ ONLY
# Collects unreplied emails and iMessages for analysis
# This script NEVER sends anything. It only reads.

set -uo pipefail
# Note: not using -e so email triage still works if iMessage fails

CONTACT_LOOKUP=~/clawd/bin/contact-lookup

echo "=== EMAIL TRIAGE ==="
echo "--- Unreplied threads (last 7 days) ---"
gog gmail search 'newer_than:7d in:inbox -label:sent' --max 30 --json 2>/dev/null || echo '{"threads":[]}'

echo ""
echo "=== IMESSAGE TRIAGE ==="
echo "--- Recent chats ---"
CHATS=$(imsg chats --limit 20 --json 2>/dev/null)
echo "$CHATS"

echo ""
echo "--- Contact name lookup ---"
# Extract all phone numbers and resolve to names
NUMBERS=$(echo "$CHATS" | jq -r '.identifier' | grep '^\+')
if [ -x "$CONTACT_LOOKUP" ] && [ -n "$NUMBERS" ]; then
  # shellcheck disable=SC2086
  $CONTACT_LOOKUP $NUMBERS 2>/dev/null || echo "{}"
else
  echo "{}"
fi

echo ""
echo "--- Recent messages from active chats ---"
echo "$CHATS" | while IFS= read -r chat; do
  CHAT_ID=$(echo "$chat" | jq -r '.id')
  IDENTIFIER=$(echo "$chat" | jq -r '.identifier')
  echo "## Chat: $IDENTIFIER (id: $CHAT_ID)"
  imsg history --chat-id "$CHAT_ID" --limit 5 --json 2>/dev/null || echo "[]"
  echo ""
done
