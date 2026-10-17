#!/usr/bin/env bash
# The testing policy in AGENTS.md, as one command per tier. Each tier includes the ones below it.
#
#   npm run check        Tier 1  lint, typecheck, boundary check                          (~1 min)
#   npm run verify       Tier 2  + production build, scroll regression, first-load JS     (~8 min)
#   npm run verify:full  Tier 3  + everything: axe on every route at both widths, keyboard, reduced motion,
#                                redirects, sitemap, JSON-LD, Lighthouse, throttled-mobile probe, consent banner,
#                                canary masking test, recruitment adapter, placeholder guard, home slider (~45-60 min)
#
# Every step runs even if an earlier one failed (except where a later step needs the build), and the summary
# at the end lists each step with its result and time. Exits non-zero if anything failed.
#
# Leaves .next as the SHIPPING build (analytics off, placeholders off) whatever tier ran, so `npm start`
# afterwards never serves a test configuration.

set -u
TIER="${1:-1}"
cd "$(dirname "$0")/.."

# Git Bash rewrites arguments that look like paths; "/" as a route would become "C:/Program Files/Git/".
export MSYS_NO_PATHCONV=1
export PYTHONIOENCODING=utf-8
# .env.local turns placeholders on for presentations; the build that gets verified is the shipping one.
export PLACEHOLDER_IMAGES=false
# Set to EMPTY, never unset. Next loads .env.local itself at build time and applies a value from it only when the
# variable is absent from the shell (@next/env: `typeof process.env[key] === "undefined"`); an empty string counts
# as present and wins. `unset` let the PostHog key in .env.local through, so "shipping" builds were quietly built
# with analytics on and the demo key — found 2026-10-17: 1 chunk carried the key with `unset`, 0 with this.
export PLACEHOLDER_PRESENTATION_BUILD= PRESENTATION_HIDE_EMPTY_FRAMES= NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_POSTHOG_HOST= \
       NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE= NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY= NEXT_PUBLIC_ANALYTICS_SURVEYS= \
       NEXT_PUBLIC_ANALYTICS_EXPERIMENTS= NEXT_PUBLIC_SITE_URL=

WORK="$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/tdl-verify-$$")"
mkdir -p "$WORK"
ROUTES="/ /services /services/payroll-management /work /about-us /careers /contact-us /become-a-client /certifications /privacy-policy /cookies-policy /insights"
RESULTS=()
FAILED=0

kill_port() {
  powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort $1 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}

# step "<label>" <command...> — runs, records pass/fail and duration, prints the tail on failure.
step() {
  local label="$1"; shift
  local log="$WORK/$(echo "$label" | tr -c 'a-zA-Z0-9' '_').log"
  local start=$SECONDS
  printf '\n── %s\n' "$label"
  if "$@" >"$log" 2>&1; then
    local secs=$((SECONDS - start))
    RESULTS+=("ok    $(printf '%4ss' "$secs")  $label")
    grep -E "FAILURES:|Budget:|Boundaries ok|ok  .*worst|gzip = floor|perf .*a11y" "$log" | tail -20 | sed 's/^/   /'
    return 0
  else
    local secs=$((SECONDS - start))
    RESULTS+=("FAIL  $(printf '%4ss' "$secs")  $label   (log: $log)")
    FAILED=1
    tail -25 "$log" | sed 's/^/   /'
    return 1
  fi
}

build() { kill_port 3131; npx next build; }

summary() {
  printf '\n════════ Tier %s summary ════════\n' "$TIER"
  for r in "${RESULTS[@]}"; do echo "  $r"; done
  if [ "$FAILED" -eq 0 ]; then echo "  RESULT: all passed"; else echo "  RESULT: FAILED"; fi
  echo "  logs: $WORK"
}

# ── Tier 1 ─────────────────────────────────────────────────────────────────────────────────────────────────
# Lint and typecheck, plus the boundary check: it is static, takes under a second, and enforces the rules
# that must never regress silently (no ATS wiring outside the adapter, no candidate storage, nobody identified,
# replay masking in force). Tests for what a change touched are run in addition, by judgement — see AGENTS.md.
step "lint (0 errors)"        npx eslint
step "typecheck"              npx tsc --noEmit
step "boundary check"         node scripts/check-adapter.mjs

if [ "$TIER" -lt 2 ]; then summary; exit $FAILED; fi

# ── Tier 2 ─────────────────────────────────────────────────────────────────────────────────────────────────
if ! step "production build (shipping config)" build; then summary; exit 1; fi
step "scroll regression"      bash scripts/serve-and-run.sh python scripts/scroll-proof.py
kill_port 3131
# shellcheck disable=SC2086
step "first-load JS, every route" node scripts/first-load.mjs $ROUTES

if [ "$TIER" -lt 3 ]; then summary; exit $FAILED; fi

# ── Tier 3 ─────────────────────────────────────────────────────────────────────────────────────────────────
# On the shipping build from Tier 2.
step "harden: axe 17 routes x 1280/390, keyboard, reduced motion, redirects, sitemap, robots, JSON-LD" \
      bash scripts/serve-and-run.sh python scripts/harden.py
step "throttled mobile: LCP, CLS, interaction latency, scroll-fling" \
      bash scripts/serve-and-run.sh python scripts/android-probe.py
step "enquiry form proof"     bash scripts/serve-and-run.sh python scripts/form-proof.py "$WORK"
mkdir -p "$WORK/lh"
# One route per page template. axe already covers accessibility on every route; Lighthouse adds performance.
step "Lighthouse, one route per template (Chrome killed between runs)" \
      bash scripts/serve-and-run.sh bash scripts/lh-clean.sh "$WORK/lh" simulate _ services services/payroll-management careers become-a-client about-us work privacy-policy
step "Lighthouse gate (a11y 100, CLS < 0.1)" node scripts/lighthouse-gate.mjs "$WORK/lh"
step "recruitment adapter, every branch against a stub" \
      node --experimental-strip-types --no-warnings scripts/provider-proof.mjs
step "placeholder guard: refuses production, allows presentation and preview, no stock in the shipping HTML" \
      bash scripts/placeholder-guard-proof.sh

# Builds a presentation build of its own (the slider has no photographs to show otherwise) and restores the
# shipping one before returning.
step "home slider: 6 s, pause, hover/focus, reduced motion, CLS, keyboard; brochure QR and /brochure" \
      bash scripts/slider-proof.sh

# Analytics on, pointed at the local PostHog stand-in, replay always sampled — the canary needs the replay
# stream to exist, and the consent banner only renders with a key.
kill_port 3132
python scripts/posthog-stub.py 3132 "$WORK/capture.bin" >"$WORK/stub.log" 2>&1 &
STUB=$!
export NEXT_PUBLIC_POSTHOG_KEY=phc_verify NEXT_PUBLIC_POSTHOG_HOST=http://127.0.0.1:3132 \
       NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE=1 NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY=true
if step "production build (analytics on, against the stub)" build; then
  step "consent banner: CLS, LCP element, equal prominence, keyboard, screen reader, axe showing/dismissed" \
        bash scripts/serve-and-run.sh python scripts/consent-proof.py "$WORK"
  step "canary masking test: events, replay and the failure path" \
        bash scripts/serve-and-run.sh python scripts/masking-proof.py "$WORK/capture.bin"
fi
kill "$STUB" 2>/dev/null; kill_port 3132
export NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_POSTHOG_HOST= NEXT_PUBLIC_ANALYTICS_REPLAY_SAMPLE= NEXT_PUBLIC_ANALYTICS_REPLAY_ENQUIRY=

# Put the shipping build back, so nothing afterwards serves a test configuration.
step "restore shipping build" build

summary
exit $FAILED
