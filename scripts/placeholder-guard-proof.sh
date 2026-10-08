#!/usr/bin/env bash
# Placeholder guard proof (Tier 3). Two halves:
#
#  1. The rule in next.config.ts, evaluated directly under each environment that matters. Loading the config is
#     what `next build` does first and where the guard throws, so this tests the real code in seconds instead of
#     running seven builds. Each case states the expected outcome; any mismatch fails.
#  2. The shipping build in .next contains no placeholder imagery and no presentation markup — checked in the
#     prerendered HTML, which is exactly what would be served.
#
# Usage: bash scripts/placeholder-guard-proof.sh   (exits 1 on any mismatch)

set -u
cd "$(dirname "$0")/.."
fails=0

case_() {
  local expect="$1" label="$2"; shift 2
  local out
  out=$(env -i PATH="$PATH" SYSTEMROOT="${SYSTEMROOT:-}" "$@" node --experimental-strip-types --no-warnings \
        -e "import('./next.config.ts').then(()=>console.log('BUILDS')).catch(()=>console.log('REFUSED'))" 2>/dev/null | tail -1)
  if [ "$out" = "$expect" ]; then
    printf '  ok    %-8s %s\n' "$out" "$label"
  else
    printf '  FAIL  %-8s %s (expected %s)\n' "${out:-nothing}" "$label" "$expect"
    fails=1
  fi
}

echo "1. The guard, per environment"
case_ REFUSED "flag on, local production build, no marker"            PLACEHOLDER_IMAGES=true NODE_ENV=production
case_ REFUSED "flag on, Vercel production, no marker"                  PLACEHOLDER_IMAGES=true NODE_ENV=production VERCEL=1 VERCEL_ENV=production
case_ REFUSED "flag quoted and padded (' \"TRUE\" '), still refused"   PLACEHOLDER_IMAGES=' "TRUE" ' NODE_ENV=production
case_ BUILDS  "flag on + presentation marker (warns, builds)"          PLACEHOLDER_IMAGES=true NODE_ENV=production PLACEHOLDER_PRESENTATION_BUILD=1
case_ BUILDS  "flag on, Vercel preview"                                PLACEHOLDER_IMAGES=true NODE_ENV=production VERCEL=1 VERCEL_ENV=preview
case_ BUILDS  "flag on, development"                                   PLACEHOLDER_IMAGES=true NODE_ENV=development
case_ BUILDS  "flag off, production"                                   PLACEHOLDER_IMAGES=false NODE_ENV=production
case_ BUILDS  "flag unset, production"                                 NODE_ENV=production

echo
echo "2. The shipping build in .next serves no placeholder imagery"
html_dir=".next/server/app"
if [ ! -d "$html_dir" ]; then
  echo "  FAIL  no prerendered HTML at $html_dir — run a production build first"
  exit 1
fi
pages=$(find "$html_dir" -name '*.html' | wc -l | tr -d ' ')
stock=$(grep -l 'data-placeholder=' -r "$html_dir" --include='*.html' 2>/dev/null | wc -l | tr -d ' ')
label=$(grep -l 'Placeholder — TDL photography required' -r "$html_dir" --include='*.html' 2>/dev/null | wc -l | tr -d ' ')
pexels=$(grep -l '/placeholders/pexels' -r "$html_dir" --include='*.html' 2>/dev/null | wc -l | tr -d ' ')
if [ "$pages" -gt 0 ] && [ "$stock" -eq 0 ] && [ "$label" -eq 0 ] && [ "$pexels" -eq 0 ]; then
  echo "  ok    $pages prerendered pages, none with a placeholder image, label or stock file"
else
  echo "  FAIL  pages=$pages with-placeholder=$stock with-label=$label with-stock-file=$pexels"
  fails=1
fi

echo
echo "FAILURES: $([ "$fails" -eq 0 ] && echo none || echo 'see above')"
exit $fails
