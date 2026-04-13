#!/bin/bash
# Deploy ELO, Marketplace contracts with new admin wallet
set -euo pipefail

SECRET="$1"
PUBLIC="$2"
RPC="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[Nirium]${NC} $1"; }
ok()  { echo -e "${GREEN}[✓]${NC} $1"; }

# ─── Build ───
log "Building ELO contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path packages/contracts/elo/Cargo.toml 2>&1 | tail -3

log "Building Marketplace contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path packages/contracts/marketplace/Cargo.toml 2>&1 | tail -3

log "Building Skill Vault contract..."
cargo build --target wasm32-unknown-unknown --release --manifest-path packages/contracts/skill-vault/Cargo.toml 2>&1 | tail -3

# ─── Deploy ELO ───
log "Deploying ELO Reputation contract..."
ELO_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/nirium_elo.wasm \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" 2>&1 | grep -oP 'C[A-Z2-7]{55}' | tail -1)
ok "ELO deployed: $ELO_ID"

log "Initializing ELO..."
stellar contract invoke \
    --id "$ELO_ID" \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize --admin "$PUBLIC" 2>&1 | tail -2
ok "ELO initialized with admin: ${PUBLIC:0:10}..."

# ─── Deploy Marketplace ───
log "Deploying Strategy Marketplace contract..."
MKT_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/nirium_marketplace.wasm \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" 2>&1 | grep -oP 'C[A-Z2-7]{55}' | tail -1)
ok "Marketplace deployed: $MKT_ID"

log "Initializing Marketplace..."
stellar contract invoke \
    --id "$MKT_ID" \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --admin "$PUBLIC" \
    --treasury "$PUBLIC" \
    --usdc_token "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" 2>&1 | tail -2
ok "Marketplace initialized"

# ─── Deploy Skill Vault ───
log "Deploying Skill Vault contract..."
VAULT_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/nirium_skill_vault.wasm \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" 2>&1 | grep -oP 'C[A-Z2-7]{55}' | tail -1)
ok "Skill Vault deployed: $VAULT_ID"

log "Initializing Skill Vault..."
stellar contract invoke \
    --id "$VAULT_ID" \
    --source "$SECRET" \
    --rpc-url "$RPC" \
    --network-passphrase "$PASSPHRASE" \
    -- initialize \
    --admin "$PUBLIC" \
    --treasury "$PUBLIC" \
    --usdc_token "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" 2>&1 | tail -2
ok "Skill Vault initialized"

# ─── Summary ───
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN} All Contracts Deployed & Initialized!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  ELO Contract:         $ELO_ID"
echo "  Marketplace Contract: $MKT_ID"
echo "  Skill Vault Contract: $VAULT_ID"
echo "  Admin:                ${PUBLIC:0:10}...${PUBLIC: -6}"
echo ""
echo "Update your .env.local:"
echo "  NEXT_PUBLIC_CONTRACT_ELO=\"$ELO_ID\""
echo "  NEXT_PUBLIC_CONTRACT_MARKETPLACE=\"$MKT_ID\""
echo "  NEXT_PUBLIC_CONTRACT_SKILL_VAULT=\"$VAULT_ID\""
echo ""
