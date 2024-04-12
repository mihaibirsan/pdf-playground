#!/bin/bash

dir=$1
total=$(ls "$dir"/*.png | wc -l)
count=0

for file in "$dir"/*.png
do
  count=$((count+1))
  echo -ne "$count/$total\r"
  node png2txt.mjs "$file"
done

echo