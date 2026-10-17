#!/usr/bin/env bash
# npm run test:form — the enquiry form against the production build in .next, with FORM_WEBHOOK_URL pointed at the
# webhook stand-in that scripts/form-proof.py runs on :3133. The variable is read by the server action at request
# time, so no rebuild is needed. Usage: bash scripts/form-proof.sh <screenshot-dir>
set -u
cd "$(dirname "$0")/.."
# PLACEHOLDER_IMAGES=false: .env.local turns it on, and the build guard then refuses `next start` on a production build.
export MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8 FORM_WEBHOOK_URL=http://127.0.0.1:3133/hook PLACEHOLDER_IMAGES=false
bash scripts/serve-and-run.sh python scripts/form-proof.py "${1:-docs/screenshots}"
