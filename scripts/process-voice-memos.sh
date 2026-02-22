#!/bin/bash
# Process Voice Memos from the last 24 hours
# Transcribes with Whisper, saves transcripts to ~/clawd/voice-memos/

RECORDINGS_DIR="$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
OUTPUT_DIR="$HOME/clawd/voice-memos"
PROCESSED_LOG="$OUTPUT_DIR/.processed"

mkdir -p "$OUTPUT_DIR"
touch "$PROCESSED_LOG"

# Find .m4a files modified in the last 36 hours (generous window for sync delays)
# Use the filename date prefix (YYYYMMDD) to filter for recent recordings
TODAY=$(date +%Y%m%d)
YESTERDAY=$(date -v-1d +%Y%m%d)

found=0
for f in "$RECORDINGS_DIR"/*.m4a; do
  [ -f "$f" ] || continue
  basename=$(basename "$f")
  
  # Check if already processed
  grep -qF "$basename" "$PROCESSED_LOG" && continue
  
  # Extract date from filename (format: YYYYMMDD HHMMSS-HASH.m4a)
  file_date=$(echo "$basename" | grep -oE '^[0-9]{8}')
  
  # Only process files from today or yesterday
  if [ "$file_date" = "$TODAY" ] || [ "$file_date" = "$YESTERDAY" ]; then
    echo "Transcribing: $basename"
    
    # Transcribe with Whisper (base.en model for speed)
    output_file="$OUTPUT_DIR/${basename%.m4a}.txt"
    whisper "$f" --model base.en --output_format txt --output_dir "$OUTPUT_DIR" 2>/dev/null
    
    # Rename output to match our convention
    whisper_output="$OUTPUT_DIR/${basename%.m4a}.txt"
    if [ -f "$whisper_output" ]; then
      echo "$basename" >> "$PROCESSED_LOG"
      found=$((found + 1))
      echo "  → Saved: $whisper_output"
    else
      echo "  → WARNING: Transcription failed for $basename"
    fi
  fi
done

echo "Processed $found new voice memo(s)"

# Output list of today's transcripts for the agent to read
if [ $found -gt 0 ]; then
  echo "---TRANSCRIPTS---"
  for f in "$OUTPUT_DIR"/*.txt; do
    basename=$(basename "$f")
    file_date=$(echo "$basename" | grep -oE '^[0-9]{8}')
    if [ "$file_date" = "$TODAY" ] || [ "$file_date" = "$YESTERDAY" ]; then
      echo "FILE: $f"
      cat "$f"
      echo ""
      echo "---"
    fi
  done
fi
