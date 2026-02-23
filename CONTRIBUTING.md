# Contributing to Nirium

Thank you for your interest in contributing to Nirium! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- Rust (for Soroban contracts)
- Git

### Getting Started

```bash
# Clone the repo
git clone https://github.com/nirium/nirium.git
cd nirium

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start development (frontend + agent)
pnpm dev:all
```

### Package Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start frontend (Next.js) |
| `pnpm dev:agent` | Start agent backend |
| `pnpm dev:all` | Start both in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean build artifacts |
| `pnpm format` | Format code with Prettier |

## Project Structure

```
packages/
├── agent/         # Express backend + AI loop
├── cli/           # CLI scaffolding tool
├── contracts/     # Soroban smart contracts (Rust)
├── desktop/       # Tauri desktop companion
├── sdk/           # TypeScript SDK
├── sdk-python/    # Python SDK
└── web/           # Next.js frontend
```

## Contribution Guidelines

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. Commit with conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
7. Push and open a PR against `main`

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `test:` — Adding or updating tests
- `chore:` — Maintenance, tooling, CI

### Code Style

- TypeScript: strict mode, explicit types for public APIs
- Rust: `cargo fmt` + `cargo clippy`
- CSS: Tailwind utilities + custom design tokens
- Comments: JSDoc for public functions

### Smart Contract Changes

Contract modifications require:
1. Updated unit tests in `contracts/tests/`
2. Updated mock contracts if interfaces change
3. Security review comment in the PR description

## Creating a New Skill

Skills live in the marketplace. To create one:

1. Create a `manifest.json` following the `SkillManifest` interface
2. Implement action handlers
3. Define required permissions
4. Test locally with `nirium skill install ./my-skill`
5. Submit to NiriumHub (coming soon)

## Security

If you discover a security vulnerability, please do NOT open a public issue.
Instead, email security@nirium.dev with details.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
