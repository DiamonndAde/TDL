#!/usr/bin/env bash
curl -s http://localhost:3131/ > "$1/home.html"
echo "== 1. h1 in initial HTML:"; grep -o '<h1[^>]*>[^<]*' "$1/home.html" | head -2
echo "   byte offset of h1 / total bytes: $(grep -bo '<h1 id="hero-headline"' "$1/home.html" | cut -d: -f1) / $(wc -c < "$1/home.html")"
echo "   client boundary markers before the h1? (template/$!): $(head -c $(grep -bo '<h1 id="hero-headline"' "$1/home.html" | cut -d: -f1) "$1/home.html" | grep -o '<template id="B:[0-9]*"\|<!--\$?-->' | wc -l)"
echo "== 2. @font-face for the display face:"
CSS=$(grep -o '/_next/static/chunks/[^"]*\.css' "$1/home.html" | head -1); curl -s "http://localhost:3131$CSS" > "$1/home.css"
grep -o '@font-face{[^}]*archivo_expanded[^}]*}' "$1/home.css" | sed 's/src:url([^)]*)/src:url(...)/' ; echo; grep -o 'font-display:[a-z]*' "$1/home.css" | sort | uniq -c
echo "== 3. head: render-blocking + preloads:"; grep -o '<link[^>]*>' "$1/home.html" | grep -v 'rel="alternate"\|canonical\|icon' | sed 's/href="[^"]*\//href="/' | head -12
echo "   CSS bytes: $(wc -c < "$1/home.css")"
