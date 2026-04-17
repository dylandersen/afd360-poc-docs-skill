#!/usr/bin/env bash
# Symlink this skill into ~/.cursor/skills/afd360-poc-docs-skill and all slash
# commands into ~/.cursor/commands/.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SKILL_DEST="${HOME}/.cursor/skills/afd360-poc-docs-skill"
CMD_DEST_DIR="${HOME}/.cursor/commands"

mkdir -p "$(dirname "${SKILL_DEST}")" "${CMD_DEST_DIR}"

if [[ -e "${SKILL_DEST}" || -L "${SKILL_DEST}" ]]; then
  echo "[afd360-poc-docs-skill] ${SKILL_DEST} exists — removing"
  rm -rf "${SKILL_DEST}"
fi

ln -s "${SCRIPT_DIR}" "${SKILL_DEST}"
echo "[afd360-poc-docs-skill] linked ${SCRIPT_DIR} -> ${SKILL_DEST}"

for cmd in setup-docs update-docs; do
  CMD_SRC="${SCRIPT_DIR}/commands/${cmd}.md"
  CMD_DEST="${CMD_DEST_DIR}/${cmd}.md"

  if [[ ! -f "${CMD_SRC}" ]]; then
    echo "[afd360-poc-docs-skill] warning: ${CMD_SRC} not found — skipping"
    continue
  fi

  if [[ -e "${CMD_DEST}" || -L "${CMD_DEST}" ]]; then
    echo "[afd360-poc-docs-skill] ${CMD_DEST} exists — replacing"
    rm -f "${CMD_DEST}"
  fi

  ln -s "${CMD_SRC}" "${CMD_DEST}"
  echo "[afd360-poc-docs-skill] linked ${CMD_SRC} -> ${CMD_DEST}"
done

echo ""
echo "Done. Restart Cursor, then type /setup-docs or /update-docs in chat."
