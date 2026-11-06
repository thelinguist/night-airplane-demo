#!/usr/bin/env bash
# Builds a labeled grid from screenshots: grid.sh <out.jpg> <cols> "<file>=<label>" ...
# Each tile is scaled to 640x360. Needs ffmpeg with drawtext (DejaVu font).
set -euo pipefail
out=$1; cols=$2; shift 2
font=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
inputs=(); filters=""; layout=""; i=0
for spec in "$@"; do
  file=${spec%%=*}; label=${spec#*=}
  inputs+=(-i "$file")
  filters+="[$i:v]scale=640:360,drawtext=fontfile=$font:text='$label':x=10:y=10:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6[t$i];"
  col=$((i % cols)); row=$((i / cols))
  layout+="$((col * 640))_$((row * 360))|"
  i=$((i + 1))
done
labels=""; for ((j = 0; j < i; j++)); do labels+="[t$j]"; done
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filters}${labels}xstack=inputs=$i:layout=${layout%|}:fill=black" -q:v 3 "$out"
echo "$out"
