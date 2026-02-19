#!/bin/bash
# Morning Flow Episode Generator
# Usage: ./generate-episode.sh [script-file] [duration-minutes] [output-name]
set -euo pipefail

FLOW_DIR="$HOME/clawd/projects/morning-flow"
SCRIPT_FILE="${1:-$FLOW_DIR/scripts/default-10min.txt}"
DURATION_MIN="${2:-10}"
OUTPUT_NAME="${3:-$(date +%Y-%m-%d)-morning-flow}"
VOICE="Bill"
MUSIC="$FLOW_DIR/music/tibetan-ambient.mp3"

AUDIO_DIR="$FLOW_DIR/audio"
EPISODES_DIR="$FLOW_DIR/episodes"
CHUNKS_DIR="$AUDIO_DIR/chunks-$$"

mkdir -p "$AUDIO_DIR" "$EPISODES_DIR" "$CHUNKS_DIR"

echo "🌊 Generating Morning Flow episode: $OUTPUT_NAME"

# Step 1: Split script into chunks at "..." pause markers
# Each "..." becomes a 3-second silence
echo "📢 Generating voice audio in chunks..."
CHUNK_NUM=0
CHUNK_LIST="$CHUNKS_DIR/list.txt"
> "$CHUNK_LIST"

# Split on "..." lines, generate TTS for each text block
csplit -f "$CHUNKS_DIR/part-" -z "$SCRIPT_FILE" '/^\.\.\.$/+1' '{*}' 2>/dev/null || true

# If csplit didn't work, fall back to awk
if [ ! -f "$CHUNKS_DIR/part-00" ] || [ ! -s "$CHUNKS_DIR/part-00" ]; then
  awk 'BEGIN{n=0; f="'"$CHUNKS_DIR"'/part-" sprintf("%02d",n)} /^\.\.\.$/{n++; f="'"$CHUNKS_DIR"'/part-" sprintf("%02d",n); next} {print > f}' "$SCRIPT_FILE"
fi

# Generate a 3-second silence file for pauses
ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 3 -q:a 2 "$CHUNKS_DIR/silence.mp3" 2>/dev/null

for chunk in "$CHUNKS_DIR"/part-*; do
  # Skip empty chunks or chunks that are just "..."
  TEXT=$(grep -v '^\.\.\.$' "$chunk" | grep -v '^$' || true)
  if [ -z "$TEXT" ]; then
    continue
  fi
  
  CHUNK_FILE="$CHUNKS_DIR/voice-${CHUNK_NUM}.mp3"
  echo "   Chunk $CHUNK_NUM: $(echo "$TEXT" | head -1 | cut -c1-50)..."
  
  echo "$TEXT" | sag speak -f - -v "$VOICE" -o "$CHUNK_FILE" --model-id eleven_flash_v2_5 --no-speaker-boost 2>&1 | grep -v "^$" || true
  
  if [ -f "$CHUNK_FILE" ] && [ -s "$CHUNK_FILE" ]; then
    echo "file '$CHUNK_FILE'" >> "$CHUNK_LIST"
    echo "file '$CHUNKS_DIR/silence.mp3'" >> "$CHUNK_LIST"
    CHUNK_NUM=$((CHUNK_NUM + 1))
  fi
done

echo "   Generated $CHUNK_NUM voice chunks"

# Step 2: Concatenate all voice chunks
VOICE_FILE="$AUDIO_DIR/${OUTPUT_NAME}-voice.mp3"
ffmpeg -y -f concat -safe 0 -i "$CHUNK_LIST" -c copy "$VOICE_FILE" 2>/dev/null
VOICE_DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$VOICE_FILE")
echo "   Total voice duration: ${VOICE_DURATION}s"

# Step 3: Calculate total duration
TOTAL_SECONDS=$(echo "$VOICE_DURATION + 12" | bc | cut -d. -f1)
TARGET_SECONDS=$((DURATION_MIN * 60))
if [ "$TOTAL_SECONDS" -lt "$TARGET_SECONDS" ]; then
  TOTAL_SECONDS=$TARGET_SECONDS
fi
echo "   Total episode: ${TOTAL_SECONDS}s"

# Step 4: Mix voice over background music
echo "🎵 Mixing audio..."
EPISODE_FILE="$EPISODES_DIR/${OUTPUT_NAME}.mp3"
FADE_START=$((TOTAL_SECONDS - 8))

ffmpeg -y \
  -i "$MUSIC" \
  -i "$VOICE_FILE" \
  -filter_complex "
    [0]atrim=0:${TOTAL_SECONDS},asetpts=PTS-STARTPTS,volume=0.15,afade=t=in:st=0:d=5,afade=t=out:st=${FADE_START}:d=8[bg];
    [1]adelay=5000|5000,volume=1.0[voice];
    [bg][voice]amix=inputs=2:duration=first:dropout_transition=3[out]
  " \
  -map "[out]" \
  -metadata title="Morning Flow - $(date +'%B %d')" \
  -metadata artist="Rio" \
  -metadata album="Morning Flow" \
  "$EPISODE_FILE" 2>&1 | tail -3

echo "✅ Episode saved: $EPISODE_FILE"

# Step 5: Update RSS feed
echo "📡 Updating RSS feed..."
"$FLOW_DIR/update-rss.sh"

# Cleanup chunks
rm -rf "$CHUNKS_DIR"

echo "🌊 Done!"
ls -la "$EPISODE_FILE"
