#!/usr/bin/env bash
# Usage: scripts/shots.sh <outdir> "<route> <file.png> [w h dpr flags]"...  — route "_" is the home page (Git Bash mangles a bare "/").
OUT="$1"; shift
python .claude/skills/webapp-testing/scripts/with_server.py --server "npx next start -p 3131" --port 3131 --timeout 40 -- python - "$OUT" "$@" <<'PY'
import subprocess, sys
out = sys.argv[1]
for spec in sys.argv[2:]:
    args = spec.split()
    subprocess.run([sys.executable, "scripts/shot.py", "http://localhost:3131/" + ("" if args[0] == "_" else args[0]), f"{out}/{args[1]}", *args[2:]], check=False)
PY
