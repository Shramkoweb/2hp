#!/bin/bash
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in "$CLAUDE_PROJECT_DIR"/*) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
export FILE="$file"
run() { bash .claude/hooks/sandboxed.sh "node_modules/.bin/$@" 2>&1; }

out=$(run prettier --write --ignore-unknown --log-level warn "$file")
case "$file" in
  *.astro | *.ts | *.js | *.mjs)
    out+=$(run eslint --fix --max-warnings 0 --no-warn-ignored "$file")
    ;;
  "$CLAUDE_PROJECT_DIR"/src/*.css)
    out+=$(run stylelint --fix --max-warnings 0 "$file")
    ;;
esac

[ -n "$out" ] || exit 0
jq -n --arg out "$out" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("Lint findings in the file you just edited:\n" + $out)
  }
}'
