// ══════════════════════════════════════════════════════════════════════
// Nirium Institutional Agent — [SOURCE PROTECTED]
// ══════════════════════════════════════════════════════════════════════
//
// This package contains the proprietary execution logic for the Nirium Network.
// The source code is not included in the public repository to protect IP.
//
// For integration, please use the provided SDKs:
// - npm: nirium
// - pip: nirium
//
// ══════════════════════════════════════════════════════════════════════

export * from './types/database.types.js';

export const startLoop = () => { throw new Error('Institutional logic protected. Use the hosted API at nirium-agent.fly.dev'); };
export const stopLoop = () => { throw new Error('Institutional logic protected.'); };

console.log('Nirium Institutional Agent — Proprietary Component');
