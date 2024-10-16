#!/usr/bin/env bash
{
  printf "%s %s %s\n" \
    "$(iso-date)" \
    "$(git rev-parse --short HEAD)" \
    "$(if git diff --exit-code &>/dev/null; then echo "+dirty"; fi)";
  (time ./scripts/test.sh --extendedDiagnostics) 2>&1 | sed 's/^/  /'; 
} | tee -a ./bench.log
