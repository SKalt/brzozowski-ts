#!/usr/bin/env bash
# must be run in repo root
set -euo pipefail
tsc --noEmit ./src/test/ok/*.ts
echo "ok tests passed"
# FIXME: validate that all the expected failures are present
tsc --noEmit ./src/test/xfail/*.ts || true
