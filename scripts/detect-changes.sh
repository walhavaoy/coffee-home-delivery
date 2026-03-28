#!/usr/bin/env bash
# detect-changes.sh — Detect which top-level component directories have
# changes compared to a base ref.  Outputs a JSON array of component names
# suitable for use as a GitHub Actions matrix value.
#
# Usage:
#   ./scripts/detect-changes.sh [base_ref]
#
# base_ref defaults to origin/main.

set -euo pipefail

BASE_REF="${1:-origin/main}"

# All directories that contain a package.json are considered components
mapfile -t COMPONENTS < <(
  find . -maxdepth 2 -name 'package.json' -not -path './node_modules/*' -not -path './package.json' \
    | sed 's|^\./||;s|/package.json$||' \
    | sort
)

CHANGED=()
for component in "${COMPONENTS[@]}"; do
  # If there are any changes in the component directory, include it
  if git diff --quiet "${BASE_REF}" -- "${component}/" 2>/dev/null; then
    continue
  fi
  CHANGED+=("\"${component}\"")
done

# Output as JSON array
if [ ${#CHANGED[@]} -eq 0 ]; then
  echo "[]"
else
  printf '[%s]\n' "$(IFS=,; echo "${CHANGED[*]}")"
fi
