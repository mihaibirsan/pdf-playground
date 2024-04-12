#!/bin/bash

dir=$1
total=$(ls "$dir"/*.pdf | wc -l)
count=0

for file in "$dir"/*.png
do
  count=$((count+1))
  echo -ne "$count/$total\r"
  node pdf2png.mjs "$file"
done

echo