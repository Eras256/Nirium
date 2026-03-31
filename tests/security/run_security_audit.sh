#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Nirium Protocol — Security Audit Runner
# ═══════════════════════════════════════════════════════════════
#
# Usage:
#   bash tests/security/run_security_audit.sh
#   bash tests/security/run_security_audit.sh --no-server   # if server already running
#   bash tests/security/run_security_audit.sh --port 3002   # custom port
#
# Requirements:
#   - Node.js 18+
#   - npm packages installed in packages/agent (npm install)
#   - tsx available (npx tsx) OR ts-node
#
# Exit codes:
#   0 — all tests passed
#   1 — one or more test failures
#   2 — setup/infrastructure failure
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────
AGENT_PORT="${AGENT_PORT:-3001}"
AGENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/packages/agent"
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${TESTS_DIR}/audit_run_$(date +%Y%m%d_%H%M%S).log"
AGENT_PID=""
START_SERVER=true
MAX_WAIT_SECONDS=30
PASS_COUNT=0
FAIL_COUNT=0

# ─── Colors ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Argument Parsing ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-server)
      START_SERVER=false
      shift
      ;;
    --port)
      AGENT_PORT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [--no-server] [--port PORT]"
      echo "  --no-server   Skip starting the agent server (use if already running)"
      echo "  --port PORT   Agent port (default: 3001)"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 2
      ;;
  esac
done

# ─── Helpers ────────────────────────────────────────────────────
log() {
  echo -e "${BLUE}[AUDIT]${RESET} $*"
}

success() {
  echo -e "${GREEN}[PASS]${RESET} $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${RESET} $*"
}

fail() {
  echo -e "${RED}[FAIL]${RESET} $*"
}

header() {
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  $*${RESET}"
  echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
}

# ─── Cleanup ────────────────────────────────────────────────────
cleanup() {
  local exit_code=$?
  if [[ -n "$AGENT_PID" ]] && kill -0 "$AGENT_PID" 2>/dev/null; then
    log "Stopping agent server (PID: $AGENT_PID)..."
    kill "$AGENT_PID" 2>/dev/null || true
    wait "$AGENT_PID" 2>/dev/null || true
    success "Agent server stopped."
  fi
  if [[ $exit_code -ne 0 ]]; then
    warn "Run log saved to: $LOG_FILE"
  fi
  exit $exit_code
}
trap cleanup EXIT INT TERM

# ─── Prerequisite Check ─────────────────────────────────────────
header "NIRIUM SECURITY AUDIT RUNNER"
log "Date: $(date)"
log "Agent port: $AGENT_PORT"
log "Tests dir: $TESTS_DIR"
log "Log file: $LOG_FILE"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "NOT FOUND")
if [[ "$NODE_VERSION" == "NOT FOUND" ]]; then
  fail "Node.js not found. Install Node.js 18+."
  exit 2
fi

NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  fail "Node.js $NODE_VERSION is too old. Requires Node 18+ (built-in fetch)."
  exit 2
fi
log "Node.js version: $NODE_VERSION (OK)"

# Check for tsx or ts-node
TSX_CMD=""
if command -v tsx &>/dev/null; then
  TSX_CMD="tsx"
elif npx --yes tsx --version &>/dev/null 2>&1; then
  TSX_CMD="npx tsx"
elif command -v ts-node &>/dev/null; then
  TSX_CMD="ts-node --esm"
elif npx --yes ts-node --version &>/dev/null 2>&1; then
  TSX_CMD="npx ts-node --esm"
else
  fail "Neither tsx nor ts-node found. Install with: npm install -g tsx"
  fail "Or add to dev dependencies: npm install --save-dev tsx"
  exit 2
fi
log "TypeScript runner: $TSX_CMD"

# ─── Server Management ──────────────────────────────────────────
wait_for_server() {
  local url="http://localhost:${AGENT_PORT}/health"
  local elapsed=0
  log "Waiting for server at $url (max ${MAX_WAIT_SECONDS}s)..."
  while [[ $elapsed -lt $MAX_WAIT_SECONDS ]]; do
    if curl -sf "$url" -o /dev/null 2>/dev/null; then
      success "Server is ready at $url"
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
    printf '.'
  done
  echo ""
  fail "Server did not start within ${MAX_WAIT_SECONDS}s"
  return 1
}

if [[ "$START_SERVER" == "true" ]]; then
  log "Starting Nirium Agent server..."

  # Check if something is already listening on the port
  if curl -sf "http://localhost:${AGENT_PORT}/health" -o /dev/null 2>/dev/null; then
    warn "Port $AGENT_PORT already in use — using existing server (skipping start)"
    START_SERVER=false
  else
    # Check agent directory exists
    if [[ ! -d "$AGENT_DIR" ]]; then
      fail "Agent directory not found: $AGENT_DIR"
      exit 2
    fi

    # Check node_modules
    if [[ ! -d "$AGENT_DIR/node_modules" ]]; then
      warn "node_modules missing — running npm install..."
      (cd "$AGENT_DIR" && npm install --silent 2>&1 | tee -a "$LOG_FILE") || {
        fail "npm install failed"
        exit 2
      }
    fi

    # Start the server in background
    AGENT_PORT="$AGENT_PORT" NODE_ENV=test \
      node --loader ts-node/esm "$AGENT_DIR/src/index.ts" >> "$LOG_FILE" 2>&1 &
    AGENT_PID=$!
    log "Agent server started (PID: $AGENT_PID)"

    # Wait for readiness
    if ! wait_for_server; then
      fail "Server failed to start. Check log: $LOG_FILE"
      if [[ -f "$LOG_FILE" ]]; then
        echo ""
        echo "Last 20 lines of server log:"
        tail -20 "$LOG_FILE" || true
      fi
      exit 2
    fi
  fi
else
  log "Skipping server start (--no-server flag)"
  if ! curl -sf "http://localhost:${AGENT_PORT}/health" -o /dev/null 2>/dev/null; then
    fail "No server found at http://localhost:${AGENT_PORT}/health"
    fail "Start the agent server first, or omit --no-server"
    exit 2
  fi
  success "Existing server detected at port $AGENT_PORT"
fi

# ─── Pre-run Health Check ───────────────────────────────────────
log "Running pre-audit health check..."
HEALTH_RESPONSE=$(curl -sf "http://localhost:${AGENT_PORT}/health" 2>/dev/null || echo '{}')
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    try { const o=JSON.parse(d); console.log(o.status||'unknown'); }
    catch { console.log('parse_error'); }
  });
" 2>/dev/null || echo "unknown")

if [[ "$HEALTH_STATUS" == "operational" ]]; then
  success "Health check: $HEALTH_STATUS"
else
  warn "Health status: $HEALTH_STATUS (proceeding with tests anyway)"
fi

# ─── Run Security Tests ─────────────────────────────────────────
header "RUNNING SECURITY AUDIT TESTS"
log "Test file: $TESTS_DIR/security_audit_suite.ts"
log "Started at: $(date)"
echo ""

# Export port for tests
export AUDIT_BASE_URL="http://localhost:${AGENT_PORT}"

# Run the test suite using Node's built-in test runner via tsx
TEST_EXIT_CODE=0
$TSX_CMD \
  --tsconfig "${AGENT_DIR}/tsconfig.json" \
  "$TESTS_DIR/security_audit_suite.ts" \
  2>&1 | tee -a "$LOG_FILE" || TEST_EXIT_CODE=$?

echo ""
log "Tests completed at: $(date)"

# ─── Parse Results ──────────────────────────────────────────────
# Count pass/fail from the Node test runner output format
if [[ -f "$LOG_FILE" ]]; then
  PASS_COUNT=$(grep -c "^ok " "$LOG_FILE" 2>/dev/null || echo "0")
  FAIL_COUNT=$(grep -c "^not ok " "$LOG_FILE" 2>/dev/null || echo "0")
fi

# ─── Final Summary ──────────────────────────────────────────────
header "AUDIT SUMMARY"
echo ""
if [[ $TEST_EXIT_CODE -eq 0 ]]; then
  success "All security tests passed."
  echo ""
  echo -e "  ${GREEN}${BOLD}RESULT: PASS${RESET}"
else
  fail "One or more security tests failed."
  echo ""
  echo -e "  ${RED}${BOLD}RESULT: FAIL${RESET}"
fi

echo ""
echo "  Test Passes : $PASS_COUNT"
echo "  Test Fails  : $FAIL_COUNT"
echo "  Exit Code   : $TEST_EXIT_CODE"
echo "  Full Log    : $LOG_FILE"
echo ""

# ─── Critical Findings Extraction ───────────────────────────────
if [[ -f "$LOG_FILE" ]]; then
  CRITICAL_COUNT=$(grep -c "CRITICAL FINDING" "$LOG_FILE" 2>/dev/null || echo "0")
  if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
    echo -e "  ${RED}${BOLD}CRITICAL FINDINGS: $CRITICAL_COUNT${RESET}"
    echo ""
    grep "CRITICAL FINDING" "$LOG_FILE" | head -10 | while IFS= read -r line; do
      echo -e "  ${RED}!${RESET} $line"
    done
    echo ""
  fi
fi

echo "═══════════════════════════════════════════════════════════════"
echo ""

exit $TEST_EXIT_CODE
