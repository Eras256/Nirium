#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — Orchestrator V2 (Railway Hardened)
// ═══════════════════════════════════════════════════════════════

import { fork, ChildProcess } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, request as http_request } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths relative to this script (src/scripts/master.ts o dist/src/scripts/master.js)
const AGENT_ENTRY   = resolve(__dirname, '../index.ts');
const INDEXER_ENTRY = resolve(__dirname, './nirium_indexer.ts');
const SWARM_ENTRY   = resolve(__dirname, './nirium_full_swarm.ts');

const COLOR = {
    reset:  '\x1b[0m',
    teal:   '\x1b[36m',
    yellow: '\x1b[33m',
    green:  '\x1b[32m',
    red:    '\x1b[31m',
    dim:    '\x1b[2m',
};

function log(label: string, color: string, msg: string): void {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`${COLOR.dim}[${ts}]${COLOR.reset} ${color}[${label}]${COLOR.reset} ${msg}`);
}

function spawnWorker(
    label: string,
    entryFile: string,
    color: string,
    restartDelay = 5_000,
    extraEnv: Record<string, string> = {}
): void {
    let child: ChildProcess | null = null;

    function start(): void {
        log(label, color, `Starting ${entryFile}`);

        const isJs = entryFile.endsWith('.js');
        
        child = fork(entryFile, [], {
            execArgv: isJs ? [] : ['--import', 'tsx/esm'],
            env: { ...process.env, ...extraEnv },
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        });

        child.on('exit', (code, signal) => {
            log(label, COLOR.red, `Exited (code=${code}, signal=${signal}) — restarting in ${restartDelay / 1000}s`);
            child = null;
            setTimeout(start, restartDelay);
        });

        child.on('error', (err) => {
            log(label, COLOR.red, `Error: ${err.message}`);
        });
    }

    start();
}

// ─── Healthcheck & Proxy Server (Railway Primary) ────────────────
const LISTEN_PORT = Number(process.env.PORT) || 3001;

const healthServer = createServer((req, res) => {
    // 🚑 Health Checks
    if (req.url === '/health' || req.url === '/api/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'online', 
            service: 'nirium-matrix-v2',
            swarm: 'active_30_agents',
            timestamp: new Date().toISOString() 
        }));
        return;
    }

    // 📡 Reverse Proxy to AGENT (Port 3002)
    const connector = {
        hostname: '127.0.0.1',
        port: 3002,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxyRequest = http_request(connector, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyRequest.on('error', (err) => {
        log('PROXY', COLOR.red, `Agent not ready on port 3002: ${err.message}`);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Nirium Agent Warming Up', 
            code: 'NEURAL_LINK_BOOTING' 
        }));
    });

    req.pipe(proxyRequest);
});

// Forzar arranque inmediato del puerto 3001
healthServer.on('error', (e: any) => {
    log('MASTER', COLOR.red, `Server error: ${e.message}`);
});

healthServer.listen(LISTEN_PORT, '0.0.0.0', () => {
    log('MASTER', COLOR.teal, `╔══════════════════════════════════════╗`);
    log('MASTER', COLOR.teal, `║  NIRIUM MATRIX V2 ACTIVE — PORT ${LISTEN_PORT}  ║`);
    log('MASTER', COLOR.teal, `╚══════════════════════════════════════╝`);
});

// ─── Boot sequence (Deferred) ───────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production' || __dirname.includes('/dist/');
const AGENT_FILE = IS_PROD ? resolve(__dirname, '../index.js') : AGENT_ENTRY;
const INDEXER_FILE = IS_PROD ? resolve(__dirname, './nirium_indexer.js') : INDEXER_ENTRY;
const SWARM_FILE = IS_PROD ? resolve(__dirname, './nirium_full_swarm.js') : SWARM_ENTRY;

// Arrancar procesos con desfases para estabilidad
setTimeout(() => {
    spawnWorker('AGENT', AGENT_FILE, COLOR.teal, 8_000, {
        PORT: '3002',
        AGENT_PORT: '3002'
    });
}, 2000);

setTimeout(() => spawnWorker('INDEXER', INDEXER_FILE, COLOR.yellow, 10_000), 5000);
setTimeout(() => spawnWorker('SWARM',   SWARM_FILE,   COLOR.green,  15_000), 12000);

// ─── Graceful shutdown ────────────────────────────────────────
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
