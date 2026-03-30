#!/bin/bash
#
# NIRIUM SECURITY TEST SUITE
# Automated security testing for Sandbox and Agent APIs
#
# Usage: ./security-test-suite.sh [API_URL]
# Example: ./security-test-suite.sh http://localhost:3001
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-http://localhost:3001}"
TEST_WALLET="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
TEST_EMAIL="security-test@nirium.xyz"
TEST_COMPANY="Security Test Corp"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       NIRIUM SECURITY TEST SUITE v1.0.0                  ║${NC}"
echo -e "${BLUE}║       Testing: $API_URL${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test result function
test_result() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [[ "$actual" == "$expected" ]]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} $test_name"
        echo -e "  Expected: $expected"
        echo -e "  Got: $actual"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══ $1 ═══${NC}"
}

# ========================================
# TEST 1: PUBLIC ENDPOINTS (NO AUTH)
# ========================================
section "TEST 1: Public Endpoints (No Authentication Required)"

info "Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
test_result "GET /health returns 200" "200" "$HEALTH_RESPONSE"

info "Testing /api/info endpoint..."
INFO_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/info")
test_result "GET /api/info returns 200" "200" "$INFO_RESPONSE"

info "Testing /api/public/market-snapshot..."
SNAPSHOT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/public/market-snapshot")
test_result "GET /api/public/market-snapshot returns 200" "200" "$SNAPSHOT_RESPONSE"

# ========================================
# TEST 2: AUTHENTICATION BYPASS ATTEMPTS
# ========================================
section "TEST 2: Authentication Bypass Attempts"

info "Attempting to access protected endpoint without auth..."
UNAUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/market")
test_result "GET /api/market without auth returns 401" "401" "$UNAUTH_RESPONSE"

info "Attempting with invalid API key..."
INVALID_KEY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "x-api-key: invalid_key_123" \
    "$API_URL/api/market")
test_result "GET /api/market with invalid key returns 401" "401" "$INVALID_KEY_RESPONSE"

info "Attempting with malformed JWT..."
INVALID_JWT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer invalid.jwt.token" \
    "$API_URL/api/market")
test_result "GET /api/market with invalid JWT returns 401" "401" "$INVALID_JWT_RESPONSE"

# ========================================
# TEST 3: SANDBOX PROVISIONING
# ========================================
section "TEST 3: Sandbox Provisioning"

info "Testing sandbox request endpoint..."
SANDBOX_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "$API_URL/api/sandbox/request" \
    -H "Content-Type: application/json" \
    -d "{
        \"companyName\": \"$TEST_COMPANY\",
        \"contactEmail\": \"$TEST_EMAIL\",
        \"walletAddress\": \"$TEST_WALLET\",
        \"tier\": \"sandbox\"
    }")

HTTP_CODE=$(echo "$SANDBOX_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$SANDBOX_RESPONSE" | grep -v "HTTP_CODE:")

if [[ "$HTTP_CODE" == "200" ]]; then
    test_result "POST /api/sandbox/request returns 200" "200" "$HTTP_CODE"

    # Verify response contains required fields
    if echo "$BODY" | grep -q '"apiKey"'; then
        echo -e "${GREEN}  ✓${NC} Response contains apiKey"
        GENERATED_API_KEY=$(echo "$BODY" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
        info "Generated API Key: ${GENERATED_API_KEY:0:20}..."
    else
        warning "Response missing apiKey field"
    fi

    if echo "$BODY" | grep -q '"expiresAt"'; then
        echo -e "${GREEN}  ✓${NC} Response contains expiresAt"
    else
        warning "Response missing expiresAt field"
    fi
else
    test_result "POST /api/sandbox/request returns 200" "200" "$HTTP_CODE"
    warning "Sandbox endpoint might not be implemented yet"
    echo -e "  Response: $BODY"
fi

# ========================================
# TEST 4: SQL INJECTION ATTEMPTS
# ========================================
section "TEST 4: SQL Injection Attempts"

info "Testing SQL injection in walletAddress field..."
SQL_INJ_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL/api/sandbox/request" \
    -H "Content-Type: application/json" \
    -d "{
        \"companyName\": \"Test\",
        \"contactEmail\": \"test@test.com\",
        \"walletAddress\": \"G' OR '1'='1\",
        \"tier\": \"sandbox\"
    }")

if [[ "$SQL_INJ_RESPONSE" == "400" ]] || [[ "$SQL_INJ_RESPONSE" == "422" ]]; then
    test_result "SQL injection attempt rejected" "$SQL_INJ_RESPONSE" "$SQL_INJ_RESPONSE"
else
    warning "SQL injection might not be properly validated (got $SQL_INJ_RESPONSE)"
fi

# ========================================
# TEST 5: XSS ATTEMPTS
# ========================================
section "TEST 5: XSS Attempts"

info "Testing XSS in companyName field..."
XSS_RESPONSE=$(curl -s -X POST "$API_URL/api/sandbox/request" \
    -H "Content-Type: application/json" \
    -d "{
        \"companyName\": \"<script>alert('xss')</script>\",
        \"contactEmail\": \"$TEST_EMAIL\",
        \"walletAddress\": \"$TEST_WALLET\",
        \"tier\": \"sandbox\"
    }")

if echo "$XSS_RESPONSE" | grep -q "<script>"; then
    warning "XSS payload not sanitized in response"
else
    echo -e "${GREEN}  ✓${NC} XSS payload appears to be sanitized"
fi

# ========================================
# TEST 6: RATE LIMITING
# ========================================
section "TEST 6: Rate Limiting"

info "Testing rate limiting — hitting aggressive-limited endpoint (POST /api/sandbox/request, max 20 rpm)..."
RATE_LIMIT_TRIGGERED=false

for i in {1..25}; do
    RATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$API_URL/api/sandbox/request" \
        -H "Content-Type: application/json" \
        -d '{"companyName":"rl-test","contactEmail":"rl@test.com","walletAddress":"GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"}')
    if [[ "$RATE_RESPONSE" == "429" ]]; then
        RATE_LIMIT_TRIGGERED=true
        info "429 triggered on request $i"
        break
    fi
done

if [ "$RATE_LIMIT_TRIGGERED" = true ]; then
    echo -e "${GREEN}  ✓${NC} Rate limiting is active and enforced"
else
    warning "Rate limiting not triggered after 25 requests — check TIER_LIMITS config"
fi

# ========================================
# TEST 7: JWT TOKEN VALIDATION
# ========================================
section "TEST 7: JWT Token Generation"

info "Testing demo authentication..."
DEMO_AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "$API_URL/api/public/demo-auth" \
    -H "Content-Type: application/json" \
    -d "{\"walletAddress\": \"$TEST_WALLET\"}")

DEMO_HTTP_CODE=$(echo "$DEMO_AUTH_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
DEMO_BODY=$(echo "$DEMO_AUTH_RESPONSE" | grep -v "HTTP_CODE:")

test_result "POST /api/public/demo-auth returns 200" "200" "$DEMO_HTTP_CODE"

if [[ "$DEMO_HTTP_CODE" == "200" ]]; then
    if echo "$DEMO_BODY" | grep -q '"token"'; then
        JWT_TOKEN=$(echo "$DEMO_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}  ✓${NC} JWT token generated"
        info "Token: ${JWT_TOKEN:0:30}..."

        # Test using the token
        info "Testing authenticated request with JWT..."
        AUTH_MARKET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "$API_URL/api/market")
        test_result "GET /api/market with valid JWT returns 200" "200" "$AUTH_MARKET_RESPONSE"
    else
        warning "Token not found in response"
    fi
fi

# ========================================
# TEST 8: SUPABASE RLS (if applicable)
# ========================================
section "TEST 8: Supabase Integration"

info "Checking if Supabase endpoints are protected..."
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    warning "Supabase URL found in environment - verify RLS policies are active"
    info "Manual check required: Login to Supabase console"
else
    info "Supabase not configured in this environment"
fi

# ========================================
# TEST 9: CORS CONFIGURATION
# ========================================
section "TEST 9: CORS Configuration"

info "Testing CORS headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_URL/health" \
    -H "Origin: https://evil.com" \
    -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    CORS_ORIGIN=$(echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2 | tr -d '\r')
    if [[ "$CORS_ORIGIN" == "*" ]]; then
        warning "CORS allows all origins (*) - consider restricting in production"
    else
        echo -e "${GREEN}  ✓${NC} CORS is properly restricted"
    fi
else
    info "CORS headers not found - might be handled by reverse proxy"
fi

# ========================================
# TEST 10: SENSITIVE DATA EXPOSURE
# ========================================
section "TEST 10: Sensitive Data Exposure"

info "Checking for exposed secrets in responses..."
INFO_FULL=$(curl -s "$API_URL/api/info")

if echo "$INFO_FULL" | grep -iq "secret\|password\|jwt_secret\|api_key"; then
    warning "Potential secrets found in /api/info response"
    echo "$INFO_FULL" | grep -i "secret\|password\|jwt_secret\|api_key"
else
    echo -e "${GREEN}  ✓${NC} No obvious secrets in API info"
fi

# ========================================
# SUMMARY
# ========================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:    $TOTAL_TESTS"
echo -e "${GREEN}Passed:         $PASSED_TESTS${NC}"
echo -e "${RED}Failed:         $FAILED_TESTS${NC}"
echo -e "${YELLOW}Warnings:       $WARNINGS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED - System appears secure${NC}"
    exit 0
elif [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${YELLOW}⚠ TESTS PASSED WITH WARNINGS - Review recommended${NC}"
    exit 0
else
    echo -e "${RED}✗ CRITICAL FAILURES DETECTED - DO NOT DEPLOY${NC}"
    exit 1
fi
