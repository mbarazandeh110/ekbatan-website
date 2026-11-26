#!/usr/bin/env bash
# ==========================================================
# Technical SEO & Indexability Smoke Check (CI/CD Gate)
# ==========================================================
set -euo pipefail

DIST_DIR="dist"
REQUIRED_FILES=(
  "sitemap-index.xml"
  "robots.txt"
  "og-default.png"
  "blog/numa-domain-kubernetes/index.html"
)

TARGET_URLS=(
  "index.html"
  "about/index.html"
  "assessment/index.html"
  "services/index.html"
  "services/kubernetes/index.html"
  "services/ceph/index.html"
  "enterprise/index.html"
  "enterprise/gitlab-enterprise/index.html"
  "experience/index.html"
  "experience/kubernetes-clusters/index.html"
  "blog/index.html"
  "blog/kubernetes-production-checklist/index.html"
)

echo "🚀 Starting Technical SEO Smoke Check..."

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: $DIST_DIR directory not found. Run 'npm run build' first."
  exit 1
fi

# 1. Fail if stale category directories leak into dist
if [ -d "$DIST_DIR/blog/category" ] || [ -d "$DIST_DIR/services/category" ]; then
  echo "❌ FATAL: Legacy category directories detected in $DIST_DIR!"
  exit 1
fi

# 2. Check required root & redirect files
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$DIST_DIR/$file" ]; then
    echo "✅ Found $file"
  else
    echo "❌ Missing required file: $DIST_DIR/$file"
    exit 1
  fi
done

# 3. Validate indexable routes
for route in "${TARGET_URLS[@]}"; do
  FILE_PATH="$DIST_DIR/$route"

  if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Missing route file: $FILE_PATH"
    exit 1
  fi

  grep -q '<link rel="canonical" href="https://ekbatan.tech/' "$FILE_PATH" || {
    echo "❌ Missing or invalid HTTPS canonical in $route"
    exit 1
  }

  grep -q '<h1' "$FILE_PATH" || {
    echo "❌ Missing <h1> in $route"
    exit 1
  }

  if grep -qi 'content="noindex' "$FILE_PATH"; then
    echo "❌ FATAL: 'noindex' found in indexable route $route"
    exit 1
  fi

  echo "✅ Validated $route"
done

# 4. Verify 404 page has noindex
grep -qi 'noindex' "$DIST_DIR/404.html" || {
  echo "❌ 404.html must include noindex"
  exit 1
}

echo "🎉 All Enterprise SEO Smoke Checks Passed!"
