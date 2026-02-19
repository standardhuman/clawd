#!/bin/bash
# Daily backup script for dashboard data
cd /Users/brian/clawd/dashboard
cp data.json "data-backup-$(date +%Y%m%d).json"
echo "Backup created: data-backup-$(date +%Y%m%d).json"