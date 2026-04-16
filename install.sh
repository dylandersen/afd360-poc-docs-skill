#!/usr/bin/env bash
# Symlink (or copy) this skill directory into ~/.cursor/skills/setup-docs
# and the slash command into ~/.cursor/commands/setup-docs.md.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SKILL_DEST="${HOME}/.cursor/skills/setup-docs"
CMD_SRC="${SCRIPT_DIR}/commands/setup-docs.md"
CMD_DEST_DIR="${HOME}/.cursor/commands"
CMD_DEST="${CMD_DEST_DIR}/setup-docs.md"

mkdir -p "$(dirname "${SKILL_DEST}")" "${CMD_DEST_DIR}"

if [[ -e "${SKILL_DEST}" || -L "${SKILL_DEST}" ]]; then
  echo "[setup-docs] ${SKILL_DEST} exists — removing"
  rm -rf "${SKILL_DEST}"
fi

ln -s "${SCRIPT_DIR}" "${SKILL_DEST}"
echo "[setup-docs] linked ${SCRIPT_DIR} -> ${SKILL_DEST}"

if [[ -e "${CMD_DEST}" || -L "${CMD_DEST}" ]]; then
  echo "[setup-docs] ${CMD_DEST} exists — replacing"
  rm -f "${CMD_DEST}"
fi

ln -s "${CMD_SRC}" "${CMD_DEST}"
echo "[setup-docs] linked ${CMD_SRC} -> ${CMD_DEST}"

echo ""
echo "Done. Restart Cursor, then type /setup-docs in chat."
