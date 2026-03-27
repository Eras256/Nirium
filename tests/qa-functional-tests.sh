#!/bin/bash
#
# NIRIUM QA FUNCTIONAL TEST SUITE
# End-to-end functional testing for all API endpoints
#
# Usage: ./qa-functional-tests.sh [API_URL]
# Example: ./qa-functional-tests.sh http://localhost:3001
#

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="${1:-http://localhost:3001}"
TEST_WALLET="GTEST5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF4V"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       NIRIUM QA FUNCTIONAL TEST SUITE v1.0.0             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS=0
FAIL=0
JWT_TOKEN=""
API_KEY=""

pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    FAIL=$((FAIL + 1))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# ========================================
# FLOW 1: PUBLIC ENDPOINTS
# ========================================
section "FLOW 1: Public Endpoints (No Auth)"

info "Test 1.1: Health Check"
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q "operational\|healthy"; then
    pass "Health check returns operational status"
else
    fail "Health check failed"
fi

info "Test 1.2: API Info"
API_INFO=$(curl -s "$API_URL/api/info")
if echo "$API_INFO" | grep -q "version\|name"; then
    pass "API info endpoint returns metadata"
else
    fail "API info endpoint failed"
fi

info "Test 1.3: Market Snapshot (Public)"
SNAPSHOT=$(curl -s "$API_URL/api/public/market-snapshot")
if echo "$SNAPSHOT" | grep -q "timestamp\|assets\|testnet"; then
    pass "Public market snapshot available"
else
    fail "Market snapshot failed"
fi

info "Test 1.4: Quick Start Guide"
QUICKSTART=$(curl -s "$API_URL/api/public/quickstart")
if echo "$QUICKSTART" | grep -q "steps\|title"; then
    pass "Quick start guide available"
else
    fail "Quick start guide not found"
fi

# ========================================
# FLOW 2: DEMO AUTHENTICATION
# ========================================
section "FLOW 2: Demo Authentication Flow"

info "Test 2.1: Generate Demo JWT Token"
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/public/demo-auth" \
    -H "Content-Type: application/json" \
    -d "{\"walletAddress\": \"$TEST_WALLET\"}")

if echo "$AUTH_RESPONSE" | grep -q '"token"'; then
    JWT_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    pass "Demo JWT token generated"
    info "Token (preview): ${JWT_TOKEN:0:40}..."
else
    fail "Demo authentication failed"
    echo "Response: $AUTH_RESPONSE"
fi

# ========================================
# FLOW 3: AUTHENTICATED MARKET DATA
# ========================================
section "FLOW 3: Authenticated Market Data Access"

if [ -n "$JWT_TOKEN" ]; then
    info "Test 3.1: Get Market Data with JWT"
    MARKET=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/market")
    if echo "$MARKET" | grep -q "timestamp\|assets\|orderbook"; then
        pass "Market data accessible with JWT"
    else
        fail "Market data request failed"
        echo "Response: $MARKET"
    fi

    info "Test 3.2: Get Recent Signals"
    SIGNALS=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/signals/recent?count=5")
    if echo "$SIGNALS" | grep -q "signals"; then
        pass "Signals endpoint accessible"
    else
        fail "Signals endpoint failed"
    fi
else
    fail "Skipping authenticated tests - no JWT token"
fi

# ========================================
# FLOW 4: SANDBOX ACCOUNT CREATION
# ========================================
section "FLOW 4: Sandbox Account Provisioning"

info "Test 4.1: Request Sandbox Account"
SANDBOX=$(curl -s -X POST "$API_URL/api/sandbox/request" \
    -H "Content-Type: application/json" \
    -d '{
        "companyName": "QA Test Corp",
        "contactEmail": "qa@test.nirium.xyz",
        "walletAddress": "'"$TEST_WALLET"'",
        "tier": "institutional"
    }')

if echo "$SANDBOX" | grep -q '"apiKey"'; then
    API_KEY=$(echo "$SANDBOX" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
    pass "Sandbox account created with API key"
    info "API Key: ${API_KEY:0:30}..."

    # Extract expiration
    EXPIRES=$(echo "$SANDBOX" | grep -o '"expiresAt":"[^"]*"' | cut -d'"' -f4)
    info "Expires: $EXPIRES"
else
    fail "Sandbox creation failed or endpoint not implemented"
    echo "Response: $SANDBOX"
fi

info "Test 4.2: Check Sandbox Status"
if [ -n "$API_KEY" ]; then
    STATUS=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/api/sandbox/status")
    if echo "$STATUS" | grep -q "quotas\|usage"; then
        pass "Sandbox status accessible with API key"
    else
        fail "Sandbox status check failed"
    fi
else
    info "Skipping - no API key available"
fi

# ========================================
# FLOW 5: API KEY MANAGEMENT
# ========================================
section "FLOW 5: API Key Management"

if [ -n "$JWT_TOKEN" ]; then
    info "Test 5.1: Generate API Key via JWT"
    KEY_GEN=$(curl -s -X POST "$API_URL/api/auth/keys" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "QA Test Key",
            "permissions": ["execute", "subscribe"]
        }')

    if echo "$KEY_GEN" | grep -q '"apiKey"'; then
        pass "API key generated via JWT"
        GENERATED_KEY=$(echo "$KEY_GEN" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
        info "Generated Key: ${GENERATED_KEY:0:25}..."
    else
        fail "API key generation failed"
    fi

    info "Test 5.2: List User API Keys"
    KEYS_LIST=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/auth/keys")
    if echo "$KEYS_LIST" | grep -q "keys"; then
        pass "API keys listed successfully"
    else
        fail "Failed to list API keys"
    fi
fi

# ========================================
# FLOW 6: STRATEGY EXECUTION (DEMO)
# ========================================
section "FLOW 6: Strategy Execution (Demo Mode)"

info "Test 6.1: Execute Demo Strategy"
EXEC_DEMO=$(curl -s -X POST "$API_URL/api/execute-demo" \
    -H "Content-Type: application/json" \
    -d '{
        "strategy": "scan",
        "asset": "XLM"
    }')

if echo "$EXEC_DEMO" | grep -q "success\|result"; then
    pass "Demo execution successful"
else
    fail "Demo execution failed"
    echo "Response: $EXEC_DEMO"
fi

if [ -n "$JWT_TOKEN" ]; then
    info "Test 6.2: Execute Strategy with Auth (Production)"
    EXEC_PROD=$(curl -s -X POST "$API_URL/api/execute" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "strategy": "scan",
            "asset": "XLM",
            "params": {}
        }')

    if echo "$EXEC_PROD" | grep -q "success\|txHash"; then
        pass "Production execution successful"
    else
        fail "Production execution failed"
        echo "Response: $EXEC_PROD"
    fi
fi

# ========================================
# FLOW 7: AUTONOMOUS LOOP CONTROL
# ========================================
section "FLOW 7: Autonomous Loop Management"

if [ -n "$JWT_TOKEN" ]; then
    info "Test 7.1: Get Loop Status"
    LOOP_STATUS=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_URL/api/loop/status")
    if echo "$LOOP_STATUS" | grep -q "isRunning\|uptime"; then
        pass "Loop status accessible"
        IS_RUNNING=$(echo "$LOOP_STATUS" | grep -o '"isRunning":[^,}]*' | cut -d':' -f2)
        info "Loop running: $IS_RUNNING"
    else
        fail "Loop status check failed"
    fi

    info "Test 7.2: Manual Scan Trigger"
    MANUAL_SCAN=$(curl -s -X POST "$API_URL/api/loop/scan" \
        -H "Authorization: Bearer $JWT_TOKEN")
    if echo "$MANUAL_SCAN" | grep -q "success\|marketState"; then
        pass "Manual scan executed"
    else
        fail "Manual scan failed"
    fi
fi

# ========================================
# FLOW 8: SKILLS/PLUGINS
# ========================================
section "FLOW 8: Skills & Plugins Management"

info "Test 8.1: List Installed Skills"
SKILLS=$(curl -s "$API_URL/api/skills")
if echo "$SKILLS" | grep -q "skills\|total"; then
    pass "Skills list accessible"
    SKILL_COUNT=$(echo "$SKILLS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    info "Total skills: $SKILL_COUNT"
else
    fail "Skills endpoint failed"
fi

info "Test 8.2: Browse Marketplace"
MARKETPLACE=$(curl -s "$API_URL/api/skills/marketplace")
if echo "$MARKETPLACE" | grep -q "skills\|available"; then
    pass "Skills marketplace accessible"
else
    fail "Marketplace endpoint failed"
fi

# ========================================
# FLOW 9: WEBHOOKS
# ========================================
section "FLOW 9: Webhook Management"

if [ -n "$JWT_TOKEN" ]; then
    info "Test 9.1: Register Webhook"
    WEBHOOK=$(curl -s -X POST "$API_URL/api/webhooks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "url": "https://webhook.site/test",
            "events": ["execution.completed"],
            "secret": "test_secret_123"
        }')

    if echo "$WEBHOOK" | grep -q '"id"\|"url"'; then
        WEBHOOK_ID=$(echo "$WEBHOOK" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        pass "Webhook registered successfully"
        info "Webhook ID: $WEBHOOK_ID"

        if [ -n "$WEBHOOK_ID" ]; then
            info "Test 9.2: Test Webhook"
            WEBHOOK_TEST=$(curl -s -X POST "$API_URL/api/webhooks/$WEBHOOK_ID/test" \
                -H "Authorization: Bearer $JWT_TOKEN")
            if echo "$WEBHOOK_TEST" | grep -q "success\|sent"; then
                pass "Webhook test successful"
            else
                fail "Webhook test failed"
            fi

            info "Test 9.3: Delete Webhook"
            WEBHOOK_DEL=$(curl -s -X DELETE "$API_URL/api/webhooks/$WEBHOOK_ID" \
                -H "Authorization: Bearer $JWT_TOKEN")
            if echo "$WEBHOOK_DEL" | grep -q "success\|deleted"; then
                pass "Webhook deleted successfully"
            else
                fail "Webhook deletion failed"
            fi
        fi
    else
        fail "Webhook registration failed"
    fi
fi

# ========================================
# FLOW 10: SYSTEM HEALTH
# ========================================
section "FLOW 10: System Health Checks"

info "Test 10.1: Detailed System Health"
SYS_HEALTH=$(curl -s "$API_URL/api/system/health")
if echo "$SYS_HEALTH" | grep -q "agent\|horizon\|soroban"; then
    pass "System health endpoint accessible"

    # Check individual components
    if echo "$SYS_HEALTH" | grep -q '"healthy":true'; then
        info "Components appear healthy"
    else
        info "Some components might be unhealthy - check details"
    fi
else
    fail "System health check failed"
fi

# ========================================
# SUMMARY
# ========================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    QA TEST SUMMARY                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Passed:  ${GREEN}$PASS${NC}"
echo -e "Total Failed:  ${RED}$FAIL${NC}"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")
    echo -e "Success Rate:  $SUCCESS_RATE%"
fi

echo ""
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL QA TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAIL TEST(S) FAILED${NC}"
    exit 1
fi
