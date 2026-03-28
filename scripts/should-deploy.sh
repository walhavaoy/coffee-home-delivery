#!/usr/bin/env bash
# should-deploy.sh
#
# Determines whether a given component should be deployed on the current
# branch.  On the main branch every component is eligible; on task branches
# only components with actual file changes are deployed.
#
# Usage:
#   scripts/should-deploy.sh <component>
#
# Exit codes:
#   0  Component SHOULD be deployed
#   1  Component should be SKIPPED (no changes detected)
#   2  Usage error

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <component>" >&2
  exit 2
fi

COMPONENT="$1"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# On main branch, always deploy everything
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  exit 0
fi

# On task branches, check for changes in the component directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHANGED=$("${SCRIPT_DIR}/detect-changed-components.sh")

if echo "$CHANGED" | grep -qx "$COMPONENT"; then
  exit 0
else
  echo "Skipping deploy for ${COMPONENT}: no changes on branch ${CURRENT_BRANCH}" >&2
  exit 1
fi
