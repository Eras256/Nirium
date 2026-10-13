# Nirium Protocol - Internal Security Review v3.1

**Last revised:** 2026-10-12 · **Original review run:** May 2026 · **Type:** internal self-review. It is **not** a third-party audit and carries no certification.

**Update, 2026-10-12 (checked against this repository's code and CI that day):** v3.0 of this report was titled "Internal Comprehensive QA & Tier 1 Advanced Auditing", described its method as "full-spectrum pentesting", and closed with a score of "83/83 vectors PASS" and a "PRODUCTION-READY" rating. Those three claims are withdrawn. A single-pass self-review does not support a tier label or a pentest label, a pass count over a checklist the same team wrote says little to an outside reader, and several checklist lines described controls that are not mounted in the running code (domain lock, response obfuscation, AML screening; see the README note dated 2026-10-07). This version keeps what can be checked: method, findings, fixes, and what was left out. The previous text remains in git history.

## Scope

Soroban/Rust contracts (`NiriumVault`, `NiriumProtocol`), the Node.js API, the Next.js frontend, CI/CD, and the Stellar SEPs the project touches. The mainnet treasury node runs over a third-party DeFindex vault (audited by OtterSec, not by us); that contract is outside the scope of this review.

## Method

- Static analysis: `cargo clippy`, grep for unsafe patterns (`eval`, unchecked arithmetic, missing `require_auth`).
- Dependency audit: `cargo audit` and `pnpm audit` in CI (`security-gate.yml`).
- Fuzzing: 5 `cargo-fuzz` targets (`fuzz_vault_create`, `fuzz_flash_loan`, `fuzz_elo_record`, `fuzz_xdr_parse`, `fuzz_auth_keys`), smoke-run in CI for 60 seconds per target. This is not long-running fuzzing.
- Manual code review of the contracts and the API middleware by the people who wrote them.
- Runtime checks against the testnet deployment (authentication, rate limiting, input validation, SSRF filtering on webhook URLs).

No external penetration test, no formal verification, and no independent code review was performed.

## Findings

### FINDING-001 - cargo audit: 2 RUSTSEC advisories in soroban-sdk (informational)
Component: `soroban-env-host`, a transitive dependency of the Stellar SDK.
- RUSTSEC-2024-0388: `derivative` unmaintained (via `ark-poly`).
- RUSTSEC-2024-0436: `paste` unmaintained (via `wasmi_core` / `soroban-wasmi`).

Both are "unmaintained" notices with no associated CVE, in crates we do not control. Fix applied: `audit.toml` ignore list with the justification written next to each entry; the CI gate was updated to match. Status: resolved by documented exception, not by removing the dependency.

### FINDING-002 - pnpm audit: handlebars via ts-jest (critical, test toolchain only)
Component: `ts-jest` → `handlebars` (JavaScript injection through AST type confusion and own-property handling, GHSA-8r5x-fm3f-whwj and GHSA-p8wg-vrv2-v86f).
Exposure: the package is only in the test toolchain; it does not ship in the production bundle or server. Exploiting it requires control of a template, which a CI test runner does not accept from outside.

History: the first override (`handlebars >=4.7.9`) still resolved to a vulnerable release, and the Security Gate failed on it again in October 2026. Fix applied 2026-10-12: override raised to `>=4.7.10`, lockfile regenerated, `pnpm audit --audit-level=high` exits 0 locally. `sharp >=0.35.5` and `@modelcontextprotocol/sdk >=1.31.0` overrides were already in place. Status: resolved locally; CI confirmation pending the merge of that change.

### FINDING-003 - SEP-10 / SEP-24 / SEP-31 / SEP-12: partial implementation (informational)
- SEP-1 `stellar.toml`: deployed and valid.
- SEP-10 web authentication: endpoint declared in the toml; server implementation not built.
- SEP-24 interactive anchor flow, SEP-31 cross-border payments, SEP-12 KYC / Travel Rule: not built.

Does not affect the testnet deployment. Required before any third-party wallet integration on mainnet.

## Fixes applied during the review

Contracts:
- Token spoofing: the canonical USDC address is read from contract storage, not from caller input.
- `initialize()` is admin-signed to prevent front-running at deployment.
- Flash-loan fee and simulated-profit math use `checked_mul` instead of unchecked `i128` (SC-OVERFLOW-01).
- `create_pool` restricted to admin (SC-POOL-01).
- `overflow-checks = true` in the release profile; `extend_ttl()` on state mutations.

API:
- JWT algorithms pinned to `HS256`, which blocks `alg: none` and RS256-confusion (JWT-ALG-01); expiry reduced from 24h to 1h (AUTH-JWT-TIER-01).
- `crypto.timingSafeEqual` for admin and API key comparison; API keys stored as SHA-256 hash only.
- WebSocket connection limit of 10 per minute per IP (WS-FLOOD-01).
- Memory cleanup on the rate-limiter usage map (AUTH-MEMLEAK-01).
- Prototype-pollution guard on request bodies (PROTO-POLL-01).
- `img-src` restricted to explicit domains (CSP-IMG-01); Host-header allowlist (HOST-HDR-01).
- Webhook URL validation blocks private IPs, loopback and cloud metadata endpoints.

Frontend and configuration:
- Debug filesystem writes removed from production code (DEBUG-FS-01).
- Etherfuse API key moved from a `NEXT_PUBLIC_` variable to server-only (API-KEY-EXPOSURE-01).
- UI enforces withdraw-first flow (VAULT-FALLBACK-01).
- `stellar.toml` syntax fixed (SEP1-FORMAT-01).

## Not covered / out of scope

- **No independent audit** of `NiriumVault` or `NiriumProtocol`. A formal third-party audit is planned before any mainnet deployment of `NiriumVault`. No client funds reach that contract today.
- **No penetration test** by an outside party.
- **Invariant-based fuzzing and mutation testing** were skipped (integration of `cargo-mutants` is still planned).
- **Controls that exist in the repository but are not mounted on any route:** domain lock and response obfuscation. The AML screening middleware was removed on 2026-10-07 because it was never imported anywhere.
- **No formal threat model** is published yet.
- **Frontend obfuscation** is a friction measure, not a security control, and is not counted as one.
- **Regulatory posture** (Mexican and cross-border) is a legal question this document does not answer; see the open legal review described in the README.
- **Open before any mainnet `NiriumVault` deployment:** full SEP-10 / SEP-24 / SEP-31 / SEP-12 flows, a public bug-bounty program, sanctions screening, a proof-of-reserves snapshot.

## Reporting

See [SECURITY.md](SECURITY.md) for responsible disclosure.
