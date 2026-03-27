// ═══════════════════════════════════════════════════════════════
// Nirium — WebSocket Subscription Service + Signal Broadcast
// ═══════════════════════════════════════════════════════════════

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Signal, Subscription, SubscriptionFilter, LogEntry } from '../types/database.types.js';
import { verifyToken } from '../middleware/auth.js';

interface ConnectedClient {
    id: string;
    ws: WebSocket;
    subscriptions: Set<string>;
    connectedAt: Date;
}

const clients = new Map<string, ConnectedClient>();
const subscriptions = new Map<string, Subscription>();
const recentSignals: Signal[] = [];
const recentLogs: LogEntry[] = [];
const MAX_RECENT_SIGNALS = 100;
const MAX_RECENT_LOGS = 500;
let logBatch: LogEntry[] = [];

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server on the given HTTP server.
 */
export function initializeWebSocket(server: HttpServer): WebSocketServer {
    wss = new WebSocketServer({ server, path: '/ws/signals' });

    wss.on('connection', (ws, req) => {
        // --- JWT SECURITY GUARD (ClawJacked Vulnerability Patch) ---
        const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
        const token = urlParams.get('token');

        if (!token) {
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Access Denied. Missing JWT token.' }));
            ws.close(1008, 'Unauthorized');
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Access Denied. Invalid or expired JWT token.' }));
            ws.close(1008, 'Unauthorized');
            return;
        }
        // -----------------------------------------------------------

        const clientId = uuidv4();
        const client: ConnectedClient = {
            id: clientId,
            ws,
            subscriptions: new Set(),
            connectedAt: new Date(),
        };
        clients.set(clientId, client);

        console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`);

        // Send welcome message
        sendToClient(ws, {
            type: 'welcome',
            clientId,
            message: 'Connected to Nirium Signal Stream',
            version: '0.1.0',
            totalClients: clients.size,
        });

        // Send recent log history
        if (recentLogs.length > 0) {
            sendToClient(ws, {
                type: 'log_history',
                logs: recentLogs.slice(-50),
            });
        }

        // Handle messages
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleClientMessage(clientId, message);
            } catch (error) {
                sendToClient(ws, { type: 'error', message: 'Invalid JSON' });
            }
        });

        ws.on('close', () => {
            clients.delete(clientId);
            console.log(`[WS] Client disconnected: ${clientId} (total: ${clients.size})`);
        });

        ws.on('error', (error) => {
            console.error(`[WS] Client error (${clientId}):`, error.message);
            clients.delete(clientId);
        });

        // Ping/pong keepalive
        ws.on('pong', () => {
            // Client is alive
        });
    });

    // Keepalive interval
    setInterval(() => {
        wss?.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            }
        });
    }, 30_000);

    console.log('[WS] WebSocket server initialized at /ws/signals');
    return wss;
}

/**
 * Handle incoming messages from a WebSocket client.
 */
function handleClientMessage(clientId: string, message: Record<string, unknown>): void {
    const client = clients.get(clientId);
    if (!client) return;

    switch (message.type) {
        case 'subscribe': {
            const subId = message.subscriptionId as string;
            if (subId) {
                client.subscriptions.add(subId);
                sendToClient(client.ws, { type: 'subscribed', subscriptionId: subId });
            }
            break;
        }
        case 'unsubscribe': {
            const subId = message.subscriptionId as string;
            if (subId) {
                client.subscriptions.delete(subId);
                sendToClient(client.ws, { type: 'unsubscribed', subscriptionId: subId });
            }
            break;
        }
        case 'ping': {
            sendToClient(client.ws, { type: 'pong', timestamp: Date.now() });
            break;
        }
        case 'get_recent': {
            const count = Math.min(Number(message.count) || 20, MAX_RECENT_SIGNALS);
            sendToClient(client.ws, {
                type: 'recent_signals',
                signals: recentSignals.slice(-count),
            });
            break;
        }
        default:
            sendToClient(client.ws, { type: 'error', message: `Unknown message type: ${message.type}` });
    }
}

/**
 * Send a message to a specific WebSocket client.
 */
function sendToClient(ws: WebSocket, data: Record<string, unknown>): void {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

/**
 * Broadcast a log message to all connected clients.
 */
export function broadcastLog(level: string, message: string, details?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
        id: uuidv4(),
        message,
        level: level as LogEntry['level'],
        details,
        created_at: new Date().toISOString(),
    };

    // Store in recent logs
    recentLogs.push(logEntry);
    if (recentLogs.length > MAX_RECENT_LOGS) {
        recentLogs.splice(0, recentLogs.length - MAX_RECENT_LOGS);
    }

    // Add to batch for IPFS archival
    logBatch.push(logEntry);

    // Broadcast to all connected clients
    const payload = JSON.stringify({ type: 'log', ...logEntry });
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(payload);
        }
    });
}

/**
 * Broadcast a signal to matching subscribers.
 */
export function broadcastSignal(signal: Signal): void {
    // Store in recent signals
    recentSignals.push(signal);
    if (recentSignals.length > MAX_RECENT_SIGNALS) {
        recentSignals.splice(0, recentSignals.length - MAX_RECENT_SIGNALS);
    }

    const payload = JSON.stringify({ type: 'signal', ...signal });
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(payload);
        }
    });
}

/**
 * Get and clear the current log batch for IPFS archival.
 */
export function drainLogBatch(): LogEntry[] {
    const batch = [...logBatch];
    logBatch = [];
    return batch;
}

/**
 * Create a new subscription.
 */
export function createSubscription(userId: string, filters: SubscriptionFilter): Subscription {
    const sub: Subscription = {
        id: uuidv4(),
        user_id: userId,
        filters,
        is_active: true,
        created_at: new Date().toISOString(),
    };
    subscriptions.set(sub.id, sub);
    return sub;
}

/**
 * Get all subscriptions for a user.
 */
export function getUserSubscriptions(userId: string): Subscription[] {
    return Array.from(subscriptions.values()).filter(s => s.user_id === userId);
}

/**
 * Delete a subscription.
 */
export function deleteSubscription(subId: string): boolean {
    return subscriptions.delete(subId);
}

/**
 * Get subscription statistics.
 */
export function getSubscriptionStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    connectedClients: number;
    totalSignalsSent: number;
    recentSignals: number;
} {
    return {
        totalSubscriptions: subscriptions.size,
        activeSubscriptions: Array.from(subscriptions.values()).filter(s => s.is_active).length,
        connectedClients: clients.size,
        totalSignalsSent: recentSignals.length,
        recentSignals: recentSignals.length,
    };
}

/**
 * Get recent signals.
 */
export function getRecentSignals(count = 20): Signal[] {
    return recentSignals.slice(-count);
}
