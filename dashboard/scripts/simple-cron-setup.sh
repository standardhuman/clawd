#!/bin/bash

# Simple cron setup for dashboard data collection

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPT_PATH="$SCRIPT_DIR/collect-data.js"
LOG_PATH="$PROJECT_DIR/cron.log"

echo "Setting up cron jobs for dashboard data collection..."
echo "Script: $SCRIPT_PATH"
echo "Log: $LOG_PATH"

# Create log file
touch "$LOG_PATH"

# Get current crontab
CRONTAB_FILE="/tmp/crontab.$$"
crontab -l 2>/dev/null > "$CRONTAB_FILE" || true

# Check if our jobs already exist
if grep -q "collect-data.js" "$CRONTAB_FILE"; then
  echo "Cron jobs already exist. Removing old entries..."
  grep -v "collect-data.js" "$CRONTAB_FILE" > "${CRONTAB_FILE}.new"
  mv "${CRONTAB_FILE}.new" "$CRONTAB_FILE"
  grep -v "data-backup" "$CRONTAB_FILE" > "${CRONTAB_FILE}.new"
  mv "${CRONTAB_FILE}.new" "$CRONTAB_FILE"
fi

# Add new cron jobs
echo "# Dashboard Data Collection Jobs" >> "$CRONTAB_FILE"
echo "# Updated: $(date)" >> "$CRONTAB_FILE"
echo "*/15 8-20 * * * cd '$PROJECT_DIR' && node '$SCRIPT_PATH' >> '$LOG_PATH' 2>&1" >> "$CRONTAB_FILE"
echo "0 * * * * cd '$PROJECT_DIR' && node '$SCRIPT_PATH' >> '$LOG_PATH' 2>&1" >> "$CRONTAB_FILE"
echo "0 0 * * * cd '$PROJECT_DIR' && cp data.json \"data-backup-\$(date +%Y%m%d).json\"" >> "$CRONTAB_FILE"
echo "0 2 * * 0 find '$PROJECT_DIR' -name \"data-backup-*.json\" -mtime +7 -delete" >> "$CRONTAB_FILE"

# Install new crontab
crontab "$CRONTAB_FILE"
rm -f "$CRONTAB_FILE"

echo ""
echo "✅ Cron jobs installed:"
crontab -l | grep -A4 "Dashboard Data Collection"
echo ""
echo "To view logs: tail -f '$LOG_PATH'"
echo "To edit manually: crontab -e"
echo ""

# Run initial collection
echo "Running initial data collection..."
cd "$PROJECT_DIR" && node "$SCRIPT_PATH"

echo ""
echo "Setup complete! Data will be collected every 15 minutes during business hours."