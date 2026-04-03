#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — Orchestrator V2.2 (Ultra-Resilient)
// ═══════════════════════════════════════════════════════════════

import { fork, ChildProcess } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, request as http_request } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
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

function spawnWorker(label: string, entryFile: string, color: string, restartDelay = 5_000, extraEnv: Record<string, string> = {}): void {
    function start(): void {
        log(label, color, `Starting ${entryFile}`);
        const child = fork(entryFile, [], {
            execArgv: entryFile.endsWith('.js') ? [] : ['--import', 'tsx/esm'],
            env: { ...process.env, ...extraEnv },
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        });
        child.on('exit', (code) => {
            log(label, COLOR.red, `Exited (code=${code}) — restarting in ${restartDelay / 1000}s`);
            setTimeout(start, restartDelay);
        });
    }
    start();
}

// ─── Healthcheck & Proxy ───────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;

// Servidor de respuesta UNIVERSAL (Arregla 502)
const healthServer = createServer((req, res) => {
    log('HTTP', COLOR.dim, `${req.method} ${req.url}`);

    // Si es una ruta de salud conocida o el root, responder 200 OK
    if (req.url === '/health' || req.url === '/api/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ 
            status: 'online', 
            service: 'nirium-matrix-v2.2', 
            matrix: 'active',
            port: PORT,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Proxy para el resto de rutas (al Agente en 3002)
    const proxyRequest = http_request({
        hostname: '127.0.0.1',
        port: 3002,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyRequest.on('error', () => {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Nirium Agent Initializing' }));
    });

    req.pipe(proxyRequest);
});

// Forzar escucha en todas las interfaces explícitamente
healthServer.listen(PORT, '0.0.0.0', () => {
    log('MASTER', COLOR.green, `╔════════════════════════════════════════════════╗`);
    log('MASTER', COLOR.green, `║  NIRIUM ORCHESTRATOR READY ON PORT ${PORT}  ║`);
    log('MASTER', COLOR.green, `╚════════════════════════════════════════════════╝`);
});

// ─── Boot Sequence ─────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === 'production' || __dirname.includes('/dist/');
const AGENT_FILE   = IS_PROD ? resolve(__dirname, '../index.js') : AGENT_ENTRY;
const INDEXER_FILE = IS_PROD ? resolve(__dirname, './nirium_indexer.js') : INDEXER_ENTRY;
const SWARM_FILE   = IS_PROD ? resolve(__dirname, './nirium_full_swarm.js') : SWARM_ENTRY;

setTimeout(() => spawnWorker('AGENT', AGENT_FILE, COLOR.teal, 8000, { PORT: '3002', AGENT_PORT: '3002' }), 3000);
setTimeout(() => spawnWorker('INDEXER', INDEXER_FILE, COLOR.yellow, 10000), 6000);
setTimeout(() => spawnWorker('SWARM',   SWARM_FILE,   COLOR.green,  15000), 15000);

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
