#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Read the YAML file and replace placeholders
while IFS= read -r line; do
  if [[ $line != *'$ref'* ]]; then
    eval echo "$line"
  else
    echo "$line"
  fi
done < your-config.yaml > swagger-to-deploy.yaml
