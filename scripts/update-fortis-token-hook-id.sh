#!/usr/bin/env bash
set -euo pipefail

# Generates a fresh program id for fortis_token_hook and updates Anchor.toml and frontend constant.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROG_KEY="$ROOT_DIR/target/deploy/fortis_token_hook-keypair.json"

solana-keygen new -o "$PROG_KEY" --no-bip39-passphrase --force
NEW_ID=$(solana-keygen pubkey "$PROG_KEY")

perl -pi -e "s/^fortis_token_hook *= *\".*\"/fortis_token_hook = \"$NEW_ID\"/" "$ROOT_DIR/Anchor.toml"
perl -pi -e "s/^export const TOKEN_HOOK_PROGRAM_ID = new PublicKey\\(\".*\"\\);/export const TOKEN_HOOK_PROGRAM_ID = new PublicKey(\"$NEW_ID\");/" "$ROOT_DIR/src/lib/solana.ts"

echo "Updated fortis_token_hook ID to $NEW_ID"
