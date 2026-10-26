#!/bin/bash
input=$(cat)
counter="${TMPDIR:-/tmp}/2hp-stop-$(jq -r .session_id <<<"$input")"
[ "$(jq -r .stop_hook_active <<<"$input")" = true ] || rm -f "$counter"

cd "$CLAUDE_PROJECT_DIR" || exit 0
[ -n "$(git status --porcelain)" ] || exit 0

if out=$(bash .claude/hooks/sandboxed.sh pnpm check 2>&1); then
  rm -f "$counter"
  exit 0
fi

attempt=$(($(cat "$counter" 2>/dev/null || echo 0) + 1))
if [ "$attempt" -gt 3 ]; then
  rm -f "$counter"
  jq -n '{systemMessage: "pnpm check still fails after 3 attempts; the agent may stop and report."}'
  exit 0
fi
echo "$attempt" >"$counter"

jq -n --arg out "$(tail -n 40 <<<"$out")" --arg attempt "$attempt" '{
  decision: "block",
  reason: ("pnpm check failed (attempt \($attempt) of 3). Fix it before stopping, or report why you cannot.\n" + $out)
}'
