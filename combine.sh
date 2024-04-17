#!/bin/bash

# Usage: ./combine.sh data/kaufland/*.csv data/lidl/*.csv > combined.csv

# Check if any arguments are passed
if [ "$#" -eq 0 ]; then
    echo "No arguments provided"
    exit 1
fi

# Print the content of the first file including the header
head -n 1 "$1"

# Loop over all the files
for file in "${@:1}"; do
    # Print the content of the file excluding the first line
    tail -n +2 "$file"
done