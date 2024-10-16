#!/usr/bin/env bash
# must be run in repo root
set -euo pipefail
tsc --noEmit "$@" ./test/*.ts
