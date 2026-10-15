#!/bin/sh
# Нарезать тур на листы по 6 кадров: sh tools/sheets.sh raw/tour-1440 [ratio]
D=$1; R=${2:-0.65}; rm -rf "$D-s"; mkdir -p "$D-s"; i=0; g=0
for f in $(ls "$D"/*.png | sort); do
  [ $((i % 6)) -eq 0 ] && g=$((g+1)) && mkdir -p "$D-s/g$g"
  cp "$f" "$D-s/g$g/"; i=$((i+1))
done
for d in "$D-s"/g*; do node tools/sheet.mjs "$d" "$d.jpg" ${3:-2} ${4:-760} $R >/dev/null; done
ls "$D-s"/*.jpg
