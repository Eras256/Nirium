#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — Orchestrator V2.4 (Omnipresent Network)
// ═══════════════════════════════════════════════════════════════

import { fork } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, request as http_request } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_ENTRY   = resolve(__dirname, '../index.ts');
const INDEXER_ENTRY = resolve(__dirname, './nirium_indexer.ts');
const SWARM_ENTRY   = resolve(__dirname, './nirium_full_swarm.ts');

const COLOR = { reset: '\x1b[0m', teal: '\x1b[36m', green: '\x1b[32m', red: '\x1b[31m', dim: '\x1b[2m' };

function log(label: string, color: string, msg: string): void {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`${COLOR.dim}[${ts}]${COLOR.reset} ${color}[${label}]${COLOR.reset} ${msg}`);
}

function spawnWorker(label: string, entryFile: string, color: string): void {
    function start(): void {
        log(label, color, `Starting ${entryFile}`);
        const child = fork(entryFile, [], {
            execArgv: entryFile.endsWith('.js') ? [] : ['--import', 'tsx/esm'],
            env: { ...process.env },
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
        });
        child.on('exit', () => setTimeout(start, 5000));
    }
    start();
}

// 🩺 Logic for Health Response
const handleRequest = (req: any, res: any) => {
    const url = req.url || '';
    if (url.includes('health') || url === '/') {
        const body = JSON.stringify({ status: 'online', service: 'nirium-matrix-v2.4', matrix: 'omnipresent' });
        res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Access-Control-Allow-Origin': '*' });
        res.end(body);
        return;
    }
    const proxyRequest = http_request({ hostname: '127.0.0.1', port: 3002, path: req.url, method: req.method, headers: req.headers }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyRequest.on('error', () => { res.writeHead(503); res.end('Initializing...'); });
    req.pipe(proxyRequest);
};

// 📡 OMNIPRESENTE: Escuchar en el puerto dinámico Y en el puerto 3001 por seguridad
const DYNAMIC_PORT = Number(process.env.PORT) || 8080;

// Servidor Principal (Dinámico)
createServer(handleRequest).listen(DYNAMIC_PORT, '0.0.0.0', () => {
    log('MASTER', COLOR.green, `DYNAMIC SERVER READY ON PORT ${DYNAMIC_PORT}`);
});

// Servidor de Respaldo (Fijo en 3001)
if (DYNAMIC_PORT !== 3001) {
    createServer(handleRequest).listen(3001, '0.0.0.0', () => {
        log('MASTER', COLOR.teal, `BACKUP SERVER READY ON PORT 3001`);
    });
}

// ─── Boot Sequence ─────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === 'production' || __dirname.includes('/dist/');
const AGENT_FILE   = IS_PROD ? resolve(__dirname, '../index.js') : AGENT_ENTRY;
const INDEXER_FILE = IS_PROD ? resolve(__dirname, './nirium_indexer.js') : INDEXER_ENTRY;
const SWARM_FILE   = IS_PROD ? resolve(__dirname, './nirium_full_swarm.js') : SWARM_ENTRY;

setTimeout(() => spawnWorker('AGENT', AGENT_FILE, COLOR.teal), 2000);
setTimeout(() => spawnWorker('INDEXER', INDEXER_FILE, COLOR.green), 5000);
setTimeout(() => spawnWorker('SWARM', SWARM_FILE, COLOR.green), 12000);

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
