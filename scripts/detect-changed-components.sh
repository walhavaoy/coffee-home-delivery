#!/usr/bin/env bash
# detect-changed-components.sh
#
# Compares the current branch against the main branch and outputs the list
# of component directories that contain changes.  The deploy pipeline calls
# this script on task branches so it can skip building / deploying components
# whose source has not been modified.
#
# Usage:
#   scripts/detect-changed-components.sh [base-ref]
#
# Arguments:
#   base-ref  Git ref to diff against (default: origin/main)
#
# Output (stdout, one per line):
#   component directory names that have changes, e.g.:
#     orders
#     operator
#
# Exit codes:
#   0  Success (even if no components changed — empty output)
#   1  Error (e.g. git not available, bad ref)

set -euo pipefail

BASE_REF="${1:-origin/main}"

# Ensure we have the base ref available
git fetch origin main --quiet 2>/dev/null || true

# Get all files changed between base and HEAD
changed_files=$(git diff --name-only "${BASE_REF}...HEAD" 2>/dev/null || git diff --name-only "${BASE_REF}" HEAD)

if [ -z "$changed_files" ]; then
  exit 0
fi

# Known component directories — each has its own package.json, Dockerfile,
# and (optionally) a chart/ subdirectory for Helm deployment.
# Add new components here as they are created.
KNOWN_COMPONENTS=(
  orders
  operator
  orchestrator
  portal
  agent
  admin
  taskmaster
  builder
)

changed_components=()

for component in "${KNOWN_COMPONENTS[@]}"; do
  # Check if any changed file lives under this component directory
  if echo "$changed_files" | grep -q "^${component}/"; then
    changed_components+=("$component")
  fi
done

# Output one component per line
for c in "${changed_components[@]}"; do
  echo "$c"
done
