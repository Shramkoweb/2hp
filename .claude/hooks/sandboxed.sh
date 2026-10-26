#!/bin/bash
exec sandbox-exec -f "$CLAUDE_PROJECT_DIR/.claude/hooks/sandbox.sb" \
  -D ROOT="$(realpath "$CLAUDE_PROJECT_DIR")" \
  -D HOME="$HOME" \
  -D TMP="$(realpath "${TMPDIR:-/tmp}")" \
  -D FILE="${FILE:-/dev/null}" \
  "$@"
