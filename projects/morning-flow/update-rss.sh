#!/bin/bash
# Generate RSS feed from episodes directory
set -euo pipefail

FLOW_DIR="$HOME/clawd/projects/morning-flow"
EPISODES_DIR="$FLOW_DIR/episodes"
RSS_FILE="$FLOW_DIR/feed.xml"
BASE_URL="https://brians-mac-mini.taile67de1.ts.net:8443/morning-flow/episodes"

cat > "$RSS_FILE" << 'HEADER'
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Morning Flow with Rio</title>
    <description>Your daily guided morning movement flow. Yoga, mobility, and bodyweight resistance blended into a calming 10-minute practice. Generated fresh each morning by Rio, your AI wellbeing coach.</description>
    <language>en-us</language>
    <itunes:author>Rio</itunes:author>
    <itunes:category text="Health &amp; Fitness">
      <itunes:category text="Fitness"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="https://brians-mac-mini.taile67de1.ts.net:8443/avatars/rio-headshot.png"/>
    <link>https://brians-mac-mini.taile67de1.ts.net:8443/morning-flow/feed.xml</link>
HEADER

# Add episodes (newest first)
for ep in $(ls -t "$EPISODES_DIR"/*.mp3 2>/dev/null); do
  filename=$(basename "$ep")
  title=$(ffprobe -v quiet -show_entries format_tags=title -of csv=p=0 "$ep" 2>/dev/null || echo "Morning Flow")
  [ -z "$title" ] && title="Morning Flow - ${filename%.mp3}"
  
  filesize=$(stat -f%z "$ep" 2>/dev/null || stat -c%s "$ep" 2>/dev/null || echo "0")
  duration_secs=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$ep" 2>/dev/null | cut -d. -f1)
  duration_min=$((duration_secs / 60))
  duration_sec=$((duration_secs % 60))
  duration_fmt=$(printf "%d:%02d" "$duration_min" "$duration_sec")
  
  # Get file modification date for pubDate
  pub_date=$(date -r "$ep" "+%a, %d %b %Y %H:%M:%S %z" 2>/dev/null || date -d "@$(stat -c%Y "$ep")" "+%a, %d %b %Y %H:%M:%S %z")
  
  cat >> "$RSS_FILE" << ITEM
    <item>
      <title>${title}</title>
      <description>Your personalized morning flow for today. ${duration_fmt} of guided movement.</description>
      <enclosure url="${BASE_URL}/${filename}" length="${filesize}" type="audio/mpeg"/>
      <itunes:duration>${duration_fmt}</itunes:duration>
      <pubDate>${pub_date}</pubDate>
      <guid>${BASE_URL}/${filename}</guid>
    </item>
ITEM
done

cat >> "$RSS_FILE" << 'FOOTER'
  </channel>
</rss>
FOOTER

echo "RSS feed updated: $RSS_FILE ($(ls "$EPISODES_DIR"/*.mp3 2>/dev/null | wc -l | tr -d ' ') episodes)"
