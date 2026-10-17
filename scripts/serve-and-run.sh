#!/usr/bin/env bash
# Runs a command against a fresh production server on port 3131, killing any stale server first.
# Usage: scripts/serve-and-run.sh <command...>
export PYTHONIOENCODING=utf-8
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3131 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
python .claude/skills/webapp-testing/scripts/with_server.py --server "npx next start -p 3131" --port 3131 --timeout 40 -- "$@" 2>&1 | grep -vE "^(Starting|Waiting|Server .* ready|All .* ready|Running:|Stopping|Server .* stopped|All servers|$)"
# The command's exit status, not grep's or PowerShell's: before 2026-10-17 this script always exited 0, so
# verify.sh marked a failing proof "ok" and only its printed FAILURES line told the truth.
rc=${PIPESTATUS[0]}
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3131 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
exit "$rc"
