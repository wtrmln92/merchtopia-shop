#!/bin/bash

SWAGGER_URL="${SWAGGER_URL:-http://localhost:3000/api-json}"
OUTPUT_PATH="src/types/api.d.ts"

mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "Fetching OpenAPI schema from $SWAGGER_URL..."

pnpm dlx openapi-typescript "$SWAGGER_URL" -o "$OUTPUT_PATH" --root-types --root-types-no-schema-prefix

if [ $? -eq 0 ]; then
  echo "Types generated successfully at $OUTPUT_PATH"
else
  echo "Failed to generate types"
  exit 1
fi
