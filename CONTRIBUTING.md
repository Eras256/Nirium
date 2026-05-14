# Contributing to Nirium

Thank you for your interest in contributing to Nirium Protocol. This document covers setup, conventions, and guidelines for open-source contributors.

> **Note:** Nirium operates under the [Stellar Code of Conduct](CODE_OF_CONDUCT.md). All contributors are expected to uphold these standards, which emphasize **patience with newcomers** and **seeking diverse perspectives**. Violations can be reported to [xvaiosx7@gmail.com](mailto:xvaiosx7@gmail.com) or [community@stellar.org](mailto:community@stellar.org).

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Rust (for Soroban contracts — `rustup target add wasm32-unknown-unknown`)
- Git

### Getting Started

```bash
# Clone the public repo
git clone https://github.com/Eras256/Nirium.git
cd Nirium

# Install dependencies
pnpm install

# Start development (frontend only — agent API is private)
pnpm dev
```

### Package Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js frontend (port 3000) |
| `pnpm build` | Build all public packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean build artifacts |
| `pnpm format` | Format code with Prettier |

---

## Project Structure (Public Repo)

```
Nirium/
├── apps/web/                  → Next.js 15 Dashboard — 21 routes, i18n (EN/ES/ZH)
├── packages/sdk/              → TypeScript SDK v0.5.0 (npm: nirium)
├── packages/sdk-python/       → Python SDK v0.5.0 (PyPI: nirium)
├── packages/contracts/        → Soroban smart contracts (Rust) — 6 contracts
├── nirium-soroban-contracts/  → Additional Soroban contracts
└── .github/workflows/         → CI, release, security-gate
```

The agent API server and desktop app are maintained in a private repository. SDKs, contracts, CLI, and MCP tools are open-source.

---

## Contribution Guidelines

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. Commit using conventional commits (see below)
7. Push and open a PR against `main`

Reviewers will not follow up for missing context — include a clear description of what changed and why.

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance, tooling, CI |

### Code Style

- **TypeScript:** strict mode, explicit types for all public APIs
- **Rust:** `cargo fmt` + `cargo clippy` (zero warnings)
- **CSS:** Tailwind utilities + custom design tokens
- **Comments:** only when the *why* is non-obvious — no narration of what the code does

### Smart Contract Changes

Contract modifications require:
1. Updated unit tests in `contracts/tests/`
2. Updated mock contracts if interfaces change
3. Security review note in the PR description
4. Confirmation that `cargo clippy` and `cargo audit` pass

---

## Security

If you discover a security vulnerability, **do not open a public issue.**

Email: **xvaiosx7@gmail.com**

Include: description, reproduction steps, potential impact, and any suggested remediation. See [SECURITY.md](SECURITY.md) for the full responsible disclosure policy and expected response timelines.

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), in compliance with Stellar Community Fund open-source requirements.

---

*Updated May 12, 2026*
