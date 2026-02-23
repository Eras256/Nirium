#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Nirium — Soroban Contract Deployment Script
# Builds and deploys all contracts to Stellar Testnet
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites:
#   - soroban CLI installed: cargo install soroban-cli
#   - Funded Testnet account: https://laboratory.stellar.org/#account-creator?network=test
#   - Environment variables: STELLAR_SECRET_KEY, STELLAR_PUBLIC_KEY
#
# Usage:
#   export STELLAR_SECRET_KEY="S..."
#   export STELLAR_PUBLIC_KEY="G..."
#   bash deploy.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────
NETWORK="testnet"
SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
WASM_DIR="target/wasm32-unknown-unknown/release"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${CYAN}[Nirium]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ─── Pre-flight Checks ──────────────────────────────────────
log "Starting Nirium deployment to Stellar ${NETWORK}..."

if ! command -v soroban &> /dev/null; then
    error "soroban CLI not found. Install with: cargo install soroban-cli"
fi

if [ -z "${STELLAR_SECRET_KEY:-}" ]; then
    error "STELLAR_SECRET_KEY not set. Export your testnet secret key first."
fi

if [ -z "${STELLAR_PUBLIC_KEY:-}" ]; then
    error "STELLAR_PUBLIC_KEY not set. Export your testnet public key first."
fi

# Verify account is funded
log "Verifying account ${STELLAR_PUBLIC_KEY:0:10}...${STELLAR_PUBLIC_KEY: -6} on Testnet..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://horizon-testnet.stellar.org/accounts/${STELLAR_PUBLIC_KEY}")
if [ "$HTTP_STATUS" != "200" ]; then
    warn "Account not found on Testnet. Fund it at https://laboratory.stellar.org/#account-creator?network=test"
    error "Account must be funded before deploying contracts."
fi
success "Account verified and funded."

# ─── Step 1: Build Contracts ────────────────────────────────
log "Building Soroban contracts..."
soroban contract build 2>&1 || error "Contract build failed."
success "Contracts built successfully."

# Verify WASM output exists
if [ ! -f "${WASM_DIR}/nirium_contracts.wasm" ]; then
    error "WASM binary not found at ${WASM_DIR}/nirium_contracts.wasm"
fi

WASM_SIZE=$(wc -c < "${WASM_DIR}/nirium_contracts.wasm")
log "WASM binary size: ${WASM_SIZE} bytes"

# ─── Step 2: Deploy NiriumVault ─────────────────────────────
log "Deploying NiriumVault contract..."
VAULT_ID=$(soroban contract deploy \
    --wasm "${WASM_DIR}/nirium_contracts.wasm" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" 2>&1)

if [ $? -ne 0 ]; then
    error "NiriumVault deployment failed: ${VAULT_ID}"
fi
success "NiriumVault deployed: ${VAULT_ID}"

# ─── Step 3: Initialize the Vault ───────────────────────────
log "Initializing NiriumVault..."
INIT_RESULT=$(soroban contract invoke \
    --id "${VAULT_ID}" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" \
    -- initialize \
    --treasury "${STELLAR_PUBLIC_KEY}" \
    --admin "${STELLAR_PUBLIC_KEY}" 2>&1) || true

if echo "${INIT_RESULT}" | grep -qi "error"; then
    warn "Initialization returned: ${INIT_RESULT}"
    warn "Contract may already be initialized. Continuing..."
else
    success "NiriumVault initialized with admin: ${STELLAR_PUBLIC_KEY:0:10}..."
fi

# ─── Step 4: Verify Deployment ──────────────────────────────
log "Verifying deployment..."
VAULT_COUNT=$(soroban contract invoke \
    --id "${VAULT_ID}" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" \
    -- get_vault_count 2>&1) || true

log "Vault count: ${VAULT_COUNT:-0}"

# ─── Step 5: Output Results ─────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN} Nirium Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Network:       ${CYAN}${NETWORK}${NC}"
echo -e "  Vault ID:      ${CYAN}${VAULT_ID}${NC}"
echo -e "  Admin:         ${CYAN}${STELLAR_PUBLIC_KEY:0:10}...${STELLAR_PUBLIC_KEY: -6}${NC}"
echo ""
echo -e "${YELLOW}Add these to your .env.local:${NC}"
echo ""
echo "  NEXT_PUBLIC_CONTRACT_ID=${VAULT_ID}"
echo "  NEXT_PUBLIC_STELLAR_NETWORK=${NETWORK}"
echo "  NEXT_PUBLIC_SOROBAN_RPC_URL=${SOROBAN_RPC_URL}"
echo "  NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org"
echo ""
echo -e "${YELLOW}Explorer:${NC}"
echo "  https://stellar.expert/explorer/testnet/contract/${VAULT_ID}"
echo ""

# Save contract IDs to file
cat > .contract-ids.env <<EOF
# Auto-generated by deploy.sh — $(date -u +"%Y-%m-%dT%H:%M:%SZ")
CONTRACT_ID=${VAULT_ID}
STELLAR_NETWORK=${NETWORK}
SOROBAN_RPC_URL=${SOROBAN_RPC_URL}
HORIZON_URL=https://horizon-testnet.stellar.org
EOF

success "Contract IDs saved to .contract-ids.env"
