#!/usr/bin/env bash
# Regenerates the auto-generated statistics sections in
# docs/design-ref/page-component-inventory.md.
# Called by lefthook pre-commit when .svelte files are staged.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SRC="$REPO_ROOT/packages/client/src"
INVENTORY="$REPO_ROOT/docs/design-ref/page-component-inventory.md"

if [ ! -f "$INVENTORY" ]; then
  exit 0
fi

cd "$SRC"

# ── Quick Stats ──────────────────────────────────────────────

page_count=$(find routes -name '+page.svelte' | grep -cv test-helpers)
component_count=$(find lib/components lib/shell lib/providers -name '*.svelte' 2>/dev/null | grep -cv test-helpers)
shell_count=$(find lib/shell -name '*.svelte' 2>/dev/null | wc -l | tr -d ' ')
provider_count=$(find lib/providers -name '*.svelte' 2>/dev/null | wc -l | tr -d ' ')
domain_count=$(find lib/components -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
# +1 for root lib/components itself, +1 for shell, +1 for providers
domain_count=$((domain_count + 3))

quick_stats=$(cat <<EOF
| Metric | Count |
|---|---|
| Pages (routes) | $page_count |
| Reusable components (\`src/lib/\`) | ~$component_count |
| Shell wrappers | $shell_count |
| Providers | $provider_count |
| Component domains | $domain_count directories |
EOF
)

# ── Page Complexity Ranking ──────────────────────────────────

page_table=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  lines=$(wc -l < "$f" | tr -d ' ')
  svelte_imports=$(grep -c '\.svelte"' "$f" 2>/dev/null || true)
  total_imports=$(grep -c '^\s*import ' "$f" 2>/dev/null || true)
  # Skip trivial pages (catch-all, schedule placeholder)
  [ "$lines" -lt 5 ] && continue
  # Derive display name from path
  name=$(echo "$f" | sed 's|routes/(app)/||;s|routes/(auth)/||;s|/+page.svelte||;s|^+page.svelte|/ (dashboard)|')
  [ -z "$name" ] && name="/ (dashboard)"
  # Complexity tier
  if [ "$lines" -gt 1000 ]; then
    tier=":red_circle: Very High"
  elif [ "$lines" -gt 500 ]; then
    tier=":orange_circle: High"
  elif [ "$lines" -gt 200 ]; then
    tier=":yellow_circle: Medium"
  else
    tier=":green_circle: Low"
  fi
  page_table="${page_table}${lines}|${name}|${svelte_imports}|${total_imports}|${tier}\n"
done < <(find routes -name '+page.svelte' | grep -v test-helpers | sort)

# Sort by lines descending, add rank
page_rows=$(printf '%b' "$page_table" | sort -t'|' -k1 -rn | awk -F'|' '{printf "| %d | `%s` | %s | %s | %s | %s |\n", NR, $2, $1, $3, $4, $5}')

# ── Component Import Frequency ───────────────────────────────

comp_freq=$(cat <<'SCRIPT'
# Count imports from routes
grep -rh 'from "\$lib/components/' routes/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/.*from "//;s/".*//' | sort > /tmp/inv-route-imports.txt
# Count imports from lib
grep -rh 'from "\$lib/components/' lib/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/.*from "//;s/".*//' | sort > /tmp/inv-lib-imports.txt

# Merge and count
echo "| Component | Route Imports | Lib Imports | Total |"
echo "|---|---:|---:|---:|"

# Get unique component paths
cat /tmp/inv-route-imports.txt /tmp/inv-lib-imports.txt | sort -u | while read -r comp; do
  route_n=$(grep -cxF "$comp" /tmp/inv-route-imports.txt 2>/dev/null || true)
  lib_n=$(grep -cxF "$comp" /tmp/inv-lib-imports.txt 2>/dev/null || true)
  total=$((route_n + lib_n))
  # Only .svelte components, skip .js files
  echo "$comp" | grep -q '\.svelte$' || continue
  basename=$(echo "$comp" | sed 's|.*/||;s|\.svelte||')
  echo "${total}|${basename}|${route_n}|${lib_n}"
done | sort -t'|' -k1 -rn | head -15 | awk -F'|' '{printf "| `%s` | %s | %s | **%s** |\n", $2, $3, $4, $1}'
SCRIPT
)
comp_table=$(bash -c "$comp_freq" 2>/dev/null)

# ── Shell Wrapper Usage ──────────────────────────────────────

shell_table_header="| Shell Wrapper | Lib Imports | Route Imports | Total |
|---|---:|---:|---:|"

shell_rows=""
for wrapper in ShellSheet ShellDialog ShellPopover ShellActionSheet SubNavbarFilterLayout ShellPopup ShellMessagebar ShellPanel ShellNotification; do
  lib_n=$(grep -rl "from \"\\\$lib/shell/${wrapper}.svelte\"" lib/ --include='*.svelte' 2>/dev/null | grep -cv test-helpers || true)
  route_n=$(grep -rl "from \"\\\$lib/shell/${wrapper}.svelte\"" routes/ --include='*.svelte' 2>/dev/null | grep -cv test-helpers || true)
  total=$((lib_n + route_n))
  [ "$total" -eq 0 ] && continue
  shell_rows="${shell_rows}${total}|${wrapper}|${lib_n}|${route_n}\n"
done
shell_table_rows=$(printf '%b' "$shell_rows" | sort -t'|' -k1 -rn | awk -F'|' '{printf "| `%s` | %s | %s | **%s** |\n", $2, $3, $4, $1}')

# ── Konsta Direct in Routes ──────────────────────────────────

konsta_direct=$(grep -rh "from \"konsta/svelte\"" routes/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/import {//;s/} from.*//' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' | sort | uniq -c | sort -rn | awk '{printf "| `%s` | %s |\n", $2, $1}')

# ── Single-Use Components ────────────────────────────────────

single_use_total=$(find routes lib -name '*.svelte' 2>/dev/null | grep -v test-helpers | xargs grep -h 'from "\$lib/components/' 2>/dev/null | sed 's/.*from "//;s/".*//' | grep '\.svelte$' | sort | uniq -c | awk '$1 == 1' | wc -l | tr -d ' ')

single_use_by_domain=""
for domain in admin tickets dashboard settings library filters search icons shared ui; do
  total_in_domain=$(find "lib/components/$domain" -name '*.svelte' 2>/dev/null | grep -cv test-helpers || true)
  [ "$total_in_domain" -eq 0 ] && continue
  single_n=$(find routes lib -name '*.svelte' 2>/dev/null | grep -v test-helpers | xargs grep -h "from \"\\\$lib/components/$domain/" 2>/dev/null | sed 's/.*from "//;s/".*//' | grep '\.svelte$' | sort | uniq -c | awk '$1 == 1' | wc -l | tr -d ' ')
  pct=$((single_n * 100 / total_in_domain))
  single_use_by_domain="${single_use_by_domain}| \`${domain}/\` | ${single_n} | ${pct}% |\n"
done

# ── Never Imported by Routes ─────────────────────────────────

never_by_routes=$(comm -23 \
  <(find lib/components -name '*.svelte' | grep -v test-helpers | sed 's|^lib/|\$lib/|' | sort) \
  <(find routes -name '*.svelte' | grep -v test-helpers | xargs grep -oh '\$lib/components/[^"]*\.svelte' 2>/dev/null | sort -u) \
  | wc -l | tr -d ' ')

# ── Store Coupling ───────────────────────────────────────────

store_table=$(grep -rh 'from "\$lib/stores/' lib/components/ routes/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/.*from "//;s/".*//' | sort | uniq -c | sort -rn | head -10 | awk '{name=$2; gsub(/.*\//, "", name); gsub(/\.svelte\.js|\.svelte/, "", name); printf "| `%s` | %s |\n", name, $1}')

# ── Lucide Icon Usage ────────────────────────────────────────

icon_table=$(grep -rh "from \"@lucide" routes/ lib/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/import {//;s/} from.*//' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' | grep -v '^import type' | sort | uniq -c | sort -rn | head -12 | awk '{printf "| `%s` | %s |\n", $2, $1}')

total_icons=$(grep -rh "from \"@lucide" routes/ lib/ --include='*.svelte' 2>/dev/null | grep -v test-helpers | sed 's/import {//;s/} from.*//' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' | grep -v '^import type' | sort -u | wc -l | tr -d ' ')

# ── Assemble Stats Section ───────────────────────────────────

stats_block=$(cat <<EOF
### Page Complexity Ranking

Ranked by total lines of code. "Svelte imports" = \`.svelte\` component imports. "Total imports" = all import statements.

| Rank | Page | Lines | Svelte Imports | Total Imports | Complexity |
|---:|---|---:|---:|---:|---|
$page_rows

### Component Import Frequency (top 15)

How many files import each component. Higher = more reused, higher blast radius on changes.

$comp_table

### Shell Wrapper Usage

Shell wrappers abstract Konsta navigation-tier components. "Lib imports" = content components using the wrapper.

$shell_table_header
$shell_table_rows

### Konsta Components Used Directly in Routes

These Konsta components appear in route files rather than through shell wrappers. Layout primitives (List, Block, Button) are fine; overlay components (Dialog, Actions) should use shells.

| Konsta Component | Direct Route Uses |
|---|---:|
$konsta_direct

### Single-Use Components ($single_use_total total)

Components imported by exactly one file. Not necessarily a problem (domain-specific components are expected).

| Domain | Single-Use Count | % of Domain |
|---|---:|---:|
$(printf '%b' "$single_use_by_domain")

### Components Never Directly Imported by Routes ($never_by_routes total)

These components are only used by other components (internal to the component tree). Normal for leaf-level rendering components.

### Store Coupling

How many files import each store. High coupling = changes affect many files.

| Store | Total Imports |
|---|---:|
$store_table

### Lucide Icon Usage ($total_icons distinct icons)

| Icon | Imports |
|---|---:|
$icon_table
EOF
)

# ── Write to inventory file ──────────────────────────────────

cd "$REPO_ROOT"

QUICK_TMP=$(mktemp)
STATS_TMP=$(mktemp)
echo "$quick_stats" > "$QUICK_TMP"
echo "$stats_block" > "$STATS_TMP"

# Replace both marker regions using a single awk pass that reads from temp files
awk -v quick_file="$QUICK_TMP" -v stats_file="$STATS_TMP" '
  /<!-- BEGIN AUTO-GENERATED QUICK-STATS/ {
    print
    while ((getline line < quick_file) > 0) print line
    close(quick_file)
    skip = 1
    next
  }
  /<!-- END AUTO-GENERATED QUICK-STATS/ { skip = 0 }
  /<!-- BEGIN AUTO-GENERATED STATS/ {
    print
    print ""
    while ((getline line < stats_file) > 0) print line
    close(stats_file)
    skip = 1
    next
  }
  /<!-- END AUTO-GENERATED STATS/ { skip = 0 }
  skip { next }
  { print }
' "$INVENTORY" > "${INVENTORY}.tmp"

mv "${INVENTORY}.tmp" "$INVENTORY"
rm -f "$QUICK_TMP" "$STATS_TMP"
