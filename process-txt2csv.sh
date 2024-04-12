#!/bin/bash

dir=$1
total=$(ls "$dir"/*.txt | wc -l)
count=0

for file in "$dir"/*.txt
do
  count=$((count+1))
  echo -ne "$count/$total\r"
  node txt2csv.mjs "$file"
done

echo