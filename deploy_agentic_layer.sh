#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Nirium — Agentic Layer Deployment Script (April 2026)
# Deploys Sentinel and Hub to Stellar Testnet
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────
NETWORK="testnet"
SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
WASM_DIR="./target/wasm32-unknown-unknown/release"

# Assets (Testnet USDC / XLM)
XLM_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HXZS65IRORAXU6S3S7Z6Z6Z6Z6Z6Z6Z6Z6" # Native XLM
USDC_ADDRESS="GBBD67IF633ZHJ2CCYBT6SF7763SJCXN6AAL2P6AKD3U3K74Z4MTUSDC"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${CYAN}[Nirium]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Load from .env.local (Safe loading)
if [ -f .env.local ]; then
    log "Loading environment from .env.local..."
    # Only export lines that look like KEY=VALUE and aren't commented out
    export $(grep -E '^[A-Z0-9_]+=' .env.local | xargs)
fi

STELLAR_PUBLIC_KEY=$NEXT_PUBLIC_ADMIN_PUBLIC_KEY

log "Starting Agentic Layer deployment..."

# ─── Step 1: Deploy Neural Sentinel ──────────────────────────
log "Deploying Neural Sentinel..."
SENTINEL_ID=$(stellar contract deploy \
    --wasm "${WASM_DIR}/nirium_sentinel.wasm" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}")

success "Neural Sentinel deployed: ${SENTINEL_ID}"

# ─── Step 2: Deploy Settlement Hub ───────────────────────────
log "Deploying Settlement Hub..."
HUB_ID=$(stellar contract deploy \
    --wasm "${WASM_DIR}/nirium_hub.wasm" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}")

success "Settlement Hub deployed: ${HUB_ID}"

# ─── Step 3: Initialize Sentinel ─────────────────────────────
log "Initializing Neural Sentinel (Oracle: Hub)..."
stellar contract invoke \
    --id "${SENTINEL_ID}" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" \
    -- initialize \
    --admin "${STELLAR_PUBLIC_KEY}" \
    --oracle "${HUB_ID}"

success "Sentinel initialized."

# ─── Step 4: Initialize Hub ──────────────────────────────────
log "Initializing Settlement Hub..."
stellar contract invoke \
    --id "${HUB_ID}" \
    --source "${STELLAR_SECRET_KEY}" \
    --rpc-url "${SOROBAN_RPC_URL}" \
    --network-passphrase "${SOROBAN_NETWORK_PASSPHRASE}" \
    -- initialize \
    --admin "${STELLAR_PUBLIC_KEY}" \
    --treasury "${STELLAR_PUBLIC_KEY}" \
    --sentinel "${SENTINEL_ID}" \
    --asset "${USDC_ADDRESS}"

success "Settlement Hub initialized."

# ─── Output Results ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}Update your .env.local with these IDs:${NC}"
echo "NEXT_PUBLIC_CONTRACT_SENTINEL=${SENTINEL_ID}"
echo "NEXT_PUBLIC_CONTRACT_HUB=${HUB_ID}"
echo ""
