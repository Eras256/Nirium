# Security Policy

## Reporting a Vulnerability

We take the security of Nirium Protocol seriously. If you believe you have found a security vulnerability, please report it responsibly.

### How to Report

**Email:** xvaiosx7@gmail.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Any suggested remediation

### What to Expect

| Timeline | Action |
|----------|--------|
| **24 hours** | Acknowledgement of your report |
| **72 hours** | Initial assessment and triage |
| **7 days** | Detailed response with remediation plan |
| **30 days** | Target resolution for critical issues |

### Scope

The following components are in scope for security reports:

| Component | Status | Notes |
|-----------|--------|-------|
| **NiriumVault** (Soroban) | ⚠️ Unaudited | Treasury & flash loan contract |
| **ELO Registry** (Soroban) | ⚠️ Unaudited | Reputation scoring contract |
| **Strategy Marketplace** (Soroban) | ⚠️ Unaudited | CID registry contract |
| **Neural Sentinel** (Soroban) | ⚠️ Unaudited | Performance scoring contract |
| **Settlement Hub** (Soroban) | ⚠️ Unaudited | x402 & MPP escrow contract |
| **Skill Vault** (Soroban) | ⚠️ Unaudited | x402 payment gate contract |
| **Frontend** (Next.js) | In scope | Web application at nirium.xyz |
| **API endpoints** | In scope | REST API and webhook handlers |
| **Agent bots** | In scope | Autonomous agent scripts |

### Out of Scope

- Third-party services (Stellar network, Soroban runtime, Ollama, LLM providers)
- Social engineering attacks against team members
- Denial of service attacks against testnet infrastructure
- Issues in dependencies that are already publicly disclosed

## Audit Status

> **⚠️ IMPORTANT: Nirium smart contracts have NOT been formally audited by any third-party security firm.**

The protocol is currently deployed on **Stellar Testnet only** and uses test tokens with no monetary value. A formal third-party audit is planned for Month 3 of operations (Soroban layer via SCF Audit Bank; API/server layer independently funded).

**JARGUS Internal Audit v2.0 (April 2026):** 78/78 vectors PASS, 0 critical, 0 high. This is a rigorous self-assessment, not a third-party certification.

### Security Measures Currently in Place

- Atomic operation enforcement (Panic-on-loss protection in Soroban contracts)
- `require_auth` on all state-modifying contract functions
- `checked_*` arithmetic throughout (no overflow)
- `max_execution_amount` cap per agent delegation
- Emergency pause (`Pausable` contract state)
- JWT: HS256, 1h expiry, RBAC tiers
- API keys stored as SHA-256 hash only
- SQL injection and prompt injection guards on all inputs
- HMAC-SHA256 webhook signature validation
- Row Level Security (RLS) on Supabase
- Non-custodial architecture (users retain key control)
- IPFS-backed immutable audit trails

## Responsible Disclosure

We kindly ask that you:
- **Do not** publicly disclose the vulnerability before we've had a chance to address it
- **Do not** exploit the vulnerability beyond what is necessary to demonstrate it
- **Do not** access or modify other users' data
- **Do** provide sufficient detail for us to reproduce and fix the issue

## Recognition

We appreciate the security research community's efforts. Reporters of valid security issues will be acknowledged (with permission) in our security advisories.

## Contact

- **Security issues:** xvaiosx7@gmail.com
- **General inquiries:** xvaiosx7@gmail.com
- **Twitter/X:** [@NiriumXYZ](https://x.com/Niriumstellar)

---

*This security policy is effective as of April 22, 2026.*
