# Licensing

The code in this public repository is open source under the Apache License 2.0. Some parts of Nirium are not in this repository: they are private and are not covered by this license.

> **Correction, 2026-10-16.** An earlier version of this file said "Nirium is 100% Open Source Software" and listed `packages/agent` as Apache-2.0. That was wrong. The agent API (`packages/agent`) and the desktop wrapper (`packages/desktop`) are private, and the code in `packages/agent` in this repository is only a placeholder with a README. The table below now lists only what is actually published here.

---

## Public, licensed under Apache License 2.0

The root [`LICENSE`](LICENSE) file applies to everything in this repository.

| Package | What it is |
|---------|------------|
| `apps/web/` | nirium.xyz web dashboard |
| `packages/contracts/` | Soroban smart contracts (NiriumVault, NiriumProtocol) |
| `packages/policy-account/` | Soroban policy account that scopes a key to one vault |
| `packages/sdk/` | TypeScript library (`npm install nirium`) |
| `packages/sdk-python/` | Python library (`pip install nirium`) |
| `packages/pollar-adapter/` | Adapter to sign x402 payments with a social login |
| `packages/mcp/` | MCP server (`nirium-mcp` on npm) |
| `packages/cli/` | Command line tool (`nirium-cli` on npm) |

You may use, modify and distribute these packages in commercial and non-commercial projects, under the terms of the Apache License 2.0.

## Private, not part of this repository

| Package | What it is |
|---------|------------|
| `packages/agent/` | The hosted agent API and its execution logic. Only a placeholder README and stubs are published here. |
| `packages/desktop/` | Tauri desktop wrapper. |

These are not licensed under this repository's license. Access to the hosted API is through the public libraries above.

## Why it is split this way

The smart contracts and the integration libraries are public so that anyone can read, verify and build on them. The hosted execution engine stays private.

---

## Attribution

This software includes components licensed under Apache 2.0. See the `NOTICE` file at the repository root for attribution requirements (Apache 2.0 section 4(d)).

---

## Contact

For commercial licensing inquiries: **legal@nirium.xyz**
