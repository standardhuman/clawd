#!/usr/bin/env bash
# Health Check — checks all public sites, email, SSL, services, and cron health
# Run: bash ~/openclaw/agents/howard/scripts/health-check.sh
# Output: JSON to stdout for agent consumption

set -euo pipefail

REPORT_DATE=$(date "+%Y-%m-%d %H:%M %Z")
ISSUES=()
WARNINGS=()
OK=()

# ============================================================
# 1. PUBLIC WEBSITE REACHABILITY
# ============================================================
check_site() {
  local name="$1"
  local url="$2"
  local expected_code="${3:-200}"
  
  local result
  result=$(curl -sL -o /dev/null -w "%{http_code}|%{time_total}|%{ssl_verify_result}" \
    --max-time 15 --connect-timeout 10 "$url" 2>/dev/null) || result="000|0|0"
  
  local code=$(echo "$result" | cut -d'|' -f1)
  local time=$(echo "$result" | cut -d'|' -f2)
  local ssl=$(echo "$result" | cut -d'|' -f3)
  
  if [[ "$code" == "000" ]]; then
    ISSUES+=("🔴 $name ($url): UNREACHABLE (timeout or DNS failure)")
  elif [[ "$code" != "$expected_code" ]]; then
    ISSUES+=("🔴 $name ($url): HTTP $code (expected $expected_code)")
  elif (( $(echo "$time > 5.0" | bc -l 2>/dev/null || echo 0) )); then
    WARNINGS+=("🟡 $name ($url): Slow response (${time}s)")
  else
    OK+=("🟢 $name: HTTP $code (${time}s)")
  fi
}

# Public sites
check_site "briancline.co" "https://briancline.co"
check_site "meet.briancline.co" "https://meet.briancline.co"
check_site "theroad.briancline.co" "https://theroad.briancline.co"
check_site "tahoe-away-weekend" "https://tahoe-away-weekend-26.briancline.co"
check_site "TMC Site" "https://tmc-site-modern.sailorskills.com"
check_site "appreciatingserenity.com" "https://appreciatingserenity.com"
check_site "mission-control" "https://mission-control.briancline.co"
check_site "dashboard" "https://dashboard.briancline.co"
check_site "newt-bailey" "https://newt-bailey.vercel.app"
check_site "sailorskills.com" "https://sailorskills.com"

# ============================================================
# 2. SSL CERTIFICATE EXPIRY
# ============================================================
check_ssl() {
  local name="$1"
  local host="$2"
  
  local expiry
  expiry=$(echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2) || expiry=""
  
  if [[ -z "$expiry" ]]; then
    WARNINGS+=("🟡 $name: Could not check SSL expiry")
    return
  fi
  
  local expiry_epoch
  expiry_epoch=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry" "+%s" 2>/dev/null) || \
  expiry_epoch=$(date -d "$expiry" "+%s" 2>/dev/null) || expiry_epoch=0
  
  local now_epoch=$(date "+%s")
  local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
  
  if [[ "$days_left" -lt 7 ]]; then
    ISSUES+=("🔴 $name: SSL expires in $days_left days ($expiry)")
  elif [[ "$days_left" -lt 30 ]]; then
    WARNINGS+=("🟡 $name: SSL expires in $days_left days ($expiry)")
  else
    OK+=("🟢 $name: SSL OK ($days_left days remaining)")
  fi
}

check_ssl "briancline.co" "briancline.co"
check_ssl "theroad" "theroad.briancline.co"
check_ssl "tahoe" "tahoe-away-weekend-26.briancline.co"
check_ssl "TMC" "tmc-site-modern.sailorskills.com"
check_ssl "appreciatingserenity" "appreciatingserenity.com"
check_ssl "meet" "meet.briancline.co"

# ============================================================
# 3. EMAIL (MX records + ImprovMX forwarding)
# ============================================================
check_email() {
  local domain="$1"
  local mx
  mx=$(dig MX "$domain" +short 2>/dev/null | head -1) || mx=""
  
  if [[ -z "$mx" ]]; then
    WARNINGS+=("🟡 $domain: No MX records found (email may not work)")
  elif echo "$mx" | grep -qi "improvmx"; then
    OK+=("🟢 $domain: MX → ImprovMX (forwarding active)")
  else
    OK+=("🟢 $domain: MX → $mx")
  fi
}

check_email "sailorskills.com"

# ============================================================
# 4. DNS RESOLUTION
# ============================================================
check_dns() {
  local domain="$1"
  local result
  result=$(dig A "$domain" +short 2>/dev/null | head -1) || result=""
  
  if [[ -z "$result" ]]; then
    ISSUES+=("🔴 $domain: DNS resolution failed")
  else
    OK+=("🟢 $domain: resolves to $result")
  fi
}

check_dns "briancline.co"
check_dns "sailorskills.com"
check_dns "appreciatingserenity.com"

# ============================================================
# 5. LOCAL SERVICES
# ============================================================
check_local() {
  local name="$1"
  local port="$2"
  
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    OK+=("🟢 $name: listening on port $port")
  else
    WARNINGS+=("🟡 $name: NOT listening on port $port")
  fi
}

# Matrix runs via Docker, check container directly
# OpenClaw Gateway check — try the actual endpoint
openclaw_status=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:18789/health" 2>/dev/null) || openclaw_status="000"
if [[ "$openclaw_status" == "000" ]]; then
  # Might be behind Tailscale — check process
  if pgrep -f "openclaw" >/dev/null 2>&1; then
    OK+=("🟢 OpenClaw Gateway: process running")
  else
    WARNINGS+=("🟡 OpenClaw Gateway: process not found")
  fi
else
  OK+=("🟢 OpenClaw Gateway: HTTP $openclaw_status")
fi

# ============================================================
# 6. DOCKER CONTAINERS
# ============================================================
if command -v docker &>/dev/null; then
  docker_status=$(docker ps --format '{{.Names}}: {{.Status}}' 2>/dev/null) || docker_status=""
  if [[ -n "$docker_status" ]]; then
    while IFS= read -r line; do
      if echo "$line" | grep -qi "unhealthy\|exited\|dead"; then
        ISSUES+=("🔴 Docker: $line")
      else
        OK+=("🟢 Docker: $line")
      fi
    done <<< "$docker_status"
  fi
  
  # Check for stopped containers — only flag known-important ones
  # (Many stopped containers are old one-off experiments, not issues)
  for important in synapse supabase_db_pro supabase_auth_pro supabase_rest_pro supabase_kong_pro; do
    status=$(docker inspect --format '{{.State.Status}}' "$important" 2>/dev/null) || status="missing"
    if [[ "$status" == "exited" || "$status" == "dead" ]]; then
      ISSUES+=("🔴 Docker: $important is $status (should be running)")
    fi
  done
else
  WARNINGS+=("🟡 Docker not found")
fi

# ============================================================
# 7. DISK SPACE
# ============================================================
disk_pct=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
if [[ "$disk_pct" -gt 90 ]]; then
  ISSUES+=("🔴 Disk usage: ${disk_pct}%")
elif [[ "$disk_pct" -gt 80 ]]; then
  WARNINGS+=("🟡 Disk usage: ${disk_pct}%")
else
  OK+=("🟢 Disk usage: ${disk_pct}%")
fi

# ============================================================
# 8. SUPABASE PROJECTS
# ============================================================
check_supabase() {
  local name="$1"
  local project_ref="$2"
  local url="https://${project_ref}.supabase.co/rest/v1/"
  
  local code
  code=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null) || code="000"
  
  if [[ "$code" == "000" ]]; then
    ISSUES+=("🔴 Supabase $name: UNREACHABLE")
  elif [[ "$code" == "401" || "$code" == "400" ]]; then
    # 401 is expected (no API key), means the service is up
    OK+=("🟢 Supabase $name: API reachable (HTTP $code — expected without key)")
  else
    WARNINGS+=("🟡 Supabase $name: HTTP $code (unexpected)")
  fi
}

check_supabase "Production" "fzygakldvvzxmahkdylq"
check_supabase "Staging" "dxyzxcmhhhepjndxunwx"

# ============================================================
# OUTPUT REPORT
# ============================================================
echo "# 🏥 Health Check — $REPORT_DATE"
echo ""

if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo "## 🔴 Issues (${#ISSUES[@]})"
  for item in "${ISSUES[@]}"; do
    echo "- $item"
  done
  echo ""
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo "## 🟡 Warnings (${#WARNINGS[@]})"
  for item in "${WARNINGS[@]}"; do
    echo "- $item"
  done
  echo ""
fi

echo "## 🟢 Healthy (${#OK[@]})"
for item in "${OK[@]}"; do
  echo "- $item"
done
echo ""

# Summary line for quick parsing
total=$((${#ISSUES[@]} + ${#WARNINGS[@]} + ${#OK[@]}))
echo "---"
echo "**Summary:** ${#ISSUES[@]} issues, ${#WARNINGS[@]} warnings, ${#OK[@]} healthy (${total} checks)"

# Exit code: 2 if issues, 1 if warnings only, 0 if clean
if [[ ${#ISSUES[@]} -gt 0 ]]; then
  exit 2
elif [[ ${#WARNINGS[@]} -gt 0 ]]; then
  exit 1
else
  exit 0
fi
