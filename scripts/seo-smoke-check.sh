#!/usr/bin/env bash
# ==========================================================
# Technical SEO & Indexability Check
# Run this script after 'npm run build' in CI/CD pipeline
# ==========================================================

set -e

DIST_DIR="dist"
TARGET_URLS=(
    "services/kubernetes/index.html" 
    "blog/kubernetes-production-checklist/index.html"
)
REQUIRED_FILES=("sitemap-index.xml" "robots.txt", "sitemap-index.xml")

echo "🚀 Starting Technical SEO Smoke Check..."

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: $DIST_DIR directory not found. Run 'npm run build' first."
  exit 1
fi

# 1. Check Root Level Files
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$DIST_DIR/$file" ]; then
    echo "✅ Found $file"
  else
    echo "❌ Missing $file"
    exit 1
  fi
done

# 2. Check Critical Routes & Meta
for route in "${TARGET_URLS[@]}"; do
  FILE_PATH="$DIST_DIR/$route"
  
  if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Missing Route File: $FILE_PATH"
    exit 1
  fi

  echo "✅ Validating Route: $route"

  # 3. Canonical Verification
  if grep -q '<link rel="canonical"' "$FILE_PATH"; then
     echo "  ✅ Canonical tag exists."
  else
     echo "  ❌ Missing Canonical tag in $route"
     exit 1
  fi

  # 4. Noindex Accident Verification
  if grep -q 'noindex' "$FILE_PATH"; then
     echo "  ❌ FATAL: 'noindex' found in $route"
     exit 1
  fi
done

echo "🎉 All Enterprise SEO Smoke Checks Passed!"
