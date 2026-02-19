#!/usr/bin/env bash
# Build a morning flow episode from a script with [SILENCE:Xs] markers.
# Usage: ./build-episode.sh scripts/default-10min.txt episodes/default-10min.mp3
#
# Requires: sag (ElevenLabs TTS), ffmpeg

set -euo pipefail

SCRIPT="${1:?Usage: $0 <script.txt> <output.mp3>}"
OUTPUT="${2:?Usage: $0 <script.txt> <output.mp3>}"
VOICE="${VOICE:-Sarah}"
MODEL="${MODEL:-eleven_flash_v2_5}"
TMPDIR=$(mktemp -d)
FILELIST="$TMPDIR/filelist.txt"

trap 'rm -rf "$TMPDIR"' EXIT

echo "Building episode from: $SCRIPT"
echo "Voice: $VOICE | Model: $MODEL"
echo "Temp dir: $TMPDIR"
echo ""

PART=0

# Read script and split into voice segments and silence gaps
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines
    [[ -z "${line// /}" ]] && continue

    # Check for silence marker
    if [[ "$line" =~ ^\[SILENCE:([0-9]+)s\]$ ]]; then
        DURATION="${BASH_REMATCH[1]}"
        PARTFILE="$TMPDIR/part-$(printf '%04d' $PART).mp3"
        echo "  [silence ${DURATION}s] → part-$(printf '%04d' $PART).mp3"
        ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t "$DURATION" -q:a 9 -acodec libmp3lame "$PARTFILE" 2>/dev/null
        echo "file '$PARTFILE'" >> "$FILELIST"
        PART=$((PART + 1))
    else
        # Accumulate text lines until next silence or EOF
        TEXT="$line"
        PARTFILE="$TMPDIR/part-$(printf '%04d' $PART).mp3"
        CHARS=${#TEXT}
        echo "  [voice ${CHARS}ch] → part-$(printf '%04d' $PART).mp3"
        sag speak -v "$VOICE" --model-id "$MODEL" -o "$PARTFILE" --play=false "$TEXT" 2>/dev/null
        echo "file '$PARTFILE'" >> "$FILELIST"
        PART=$((PART + 1))
    fi
done < "$SCRIPT"

echo ""
echo "Concatenating $PART parts..."

ffmpeg -y -f concat -safe 0 -i "$FILELIST" -acodec libmp3lame -q:a 2 "$OUTPUT" 2>/dev/null

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT")
MINS=$(echo "$DURATION / 60" | bc)
SECS=$(echo "$DURATION % 60 / 1" | bc)
SIZE=$(du -h "$OUTPUT" | cut -f1)

echo ""
echo "✅ Done: $OUTPUT"
echo "   Duration: ${MINS}m ${SECS}s"
echo "   Size: $SIZE"
echo "   Parts: $PART"
