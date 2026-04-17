#!/usr/bin/env bash
# Symlink (or copy) this skill directory into ~/.cursor/skills/afd360-poc-docs-skill
# and the slash command into ~/.cursor/commands/setup-docs.md.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SKILL_DEST="${HOME}/.cursor/skills/afd360-poc-docs-skill"
CMD_SRC="${SCRIPT_DIR}/commands/setup-docs.md"
CMD_DEST_DIR="${HOME}/.cursor/commands"
CMD_DEST="${CMD_DEST_DIR}/setup-docs.md"

mkdir -p "$(dirname "${SKILL_DEST}")" "${CMD_DEST_DIR}"

if [[ -e "${SKILL_DEST}" || -L "${SKILL_DEST}" ]]; then
  echo "[afd360-poc-docs-skill] ${SKILL_DEST} exists — removing"
  rm -rf "${SKILL_DEST}"
fi

ln -s "${SCRIPT_DIR}" "${SKILL_DEST}"
echo "[afd360-poc-docs-skill] linked ${SCRIPT_DIR} -> ${SKILL_DEST}"

if [[ -e "${CMD_DEST}" || -L "${CMD_DEST}" ]]; then
  echo "[afd360-poc-docs-skill] ${CMD_DEST} exists — replacing"
  rm -f "${CMD_DEST}"
fi

ln -s "${CMD_SRC}" "${CMD_DEST}"
echo "[afd360-poc-docs-skill] linked ${CMD_SRC} -> ${CMD_DEST}"

echo ""
echo "Done. Restart Cursor, then type /setup-docs in chat."
