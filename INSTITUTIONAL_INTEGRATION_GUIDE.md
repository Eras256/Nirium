# Nirium Protocol — Institutional Integration Guide

**To:** Institutional Entity
**API Version:** v0.1.0
**Active Network:** Stellar Testnet (Validation Environment)
**Date:** March 2026
**Infrastructure Status:** In Production (Railway / Vercel)
**Confidentiality:** For internal use by authorized technical teams only

---

## Table of Contents

1. [Overview](#1-overview)
2. [Access and Authentication](#2-access-and-authentication)
3. [Tiers and Quotas Matrix](#3-tiers-and-quotas-matrix)
4. [Full Endpoint Reference](#4-full-endpoint-reference)
   - [4.1 Public Endpoints (No Auth)](#41-public-endpoints)
   - [4.2 Authentication](#42-authentication-endpoints)

---

## 1. Overview

**Nirium Protocol** is an institutional DeFi infrastructure built on the **Stellar / Soroban network**. It provides:

- **Atomic Execution of Financial Strategies** via Soroban smart contracts.
- **Autonomous AI Agents** for market analysis and algorithmic execution.
- **Low-Latency REST API + WebSocket** with multi-level authentication.
- **90-Day Institutional Sandbox** for technical validation without capital risk.
- **Immutable Audit Trail** via IPFS for regulatory compliance.

### Architecture

```
Your System (Institutional Entity)
    │
    ├── Frontend (Vercel) ──→ Visual Interface and Dashboards
    │                           │
    ├── REST API  ──────→  Nirium Agent API (Node.js / Railway)
    │                           │
    ├── WebSocket ──────→       ├── Stellar Horizon (Market Data)
    │                           ├── Soroban RPC (Smart Contracts)
    └── Webhooks ←──────        └── IPFS (Immutable Audit)
```

---

## 2. Access and Authentication

### Method 1 — `x-api-key` Header (Recommended for Servers)
\`\`\`http
GET /api/market HTTP/1.1
Host: api.nirium.xyz
x-api-key: sk_inst_xxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

---

## 10. QA Test Suite

**100% QA Pass Rate** as of March 30th, 2026:
- **E2E Health Check:** 7/7 automated pipeline coverage.
- **Security & PEN:** 10/10 compliance (SQLi/XSS/Replay protection).
- **Functional QA:** 24/24 operational flows successfully executed.
- **Smoke Tests:** 13/13 subsystems operational.

---

## 11. Security and Compliance

- **Transport:** TLS 1.3 encryption.
- **Authentication:** JWT HS256 + SHA-256 Hashed API Keys.
- **Anti-Replay:** Mandatory 5-minute sliding window via signed timestamps.

---

## 14. SLA and Support Levels

- **API Availability:** 99.5% Monthly uptime.
- **P95 Latency:** < 500ms for market endpoints.
- **Critical Support:** < 30-minute response time.

