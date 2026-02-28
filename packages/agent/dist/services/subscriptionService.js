// ═══════════════════════════════════════════════════════════════
// Nirium — WebSocket Subscription Service + Signal Broadcast
// ═══════════════════════════════════════════════════════════════
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
const clients = new Map();
const subscriptions = new Map();
const recentSignals = [];
const recentLogs = [];
const MAX_RECENT_SIGNALS = 100;
const MAX_RECENT_LOGS = 500;
let logBatch = [];
let wss = null;
/**
 * Initialize WebSocket server on the given HTTP server.
 */
export function initializeWebSocket(server) {
    wss = new WebSocketServer({ server, path: '/ws/signals' });
    wss.on('connection', (ws, req) => {
        const clientId = uuidv4();
        const client = {
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
            }
            catch (error) {
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
function handleClientMessage(clientId, message) {
    const client = clients.get(clientId);
    if (!client)
        return;
    switch (message.type) {
        case 'subscribe': {
            const subId = message.subscriptionId;
            if (subId) {
                client.subscriptions.add(subId);
                sendToClient(client.ws, { type: 'subscribed', subscriptionId: subId });
            }
            break;
        }
        case 'unsubscribe': {
            const subId = message.subscriptionId;
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
function sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}
/**
 * Broadcast a log message to all connected clients.
 */
export function broadcastLog(level, message, details) {
    const logEntry = {
        id: uuidv4(),
        message,
        level: level,
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
export function broadcastSignal(signal) {
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
export function drainLogBatch() {
    const batch = [...logBatch];
    logBatch = [];
    return batch;
}
/**
 * Create a new subscription.
 */
export function createSubscription(userId, filters) {
    const sub = {
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
export function getUserSubscriptions(userId) {
    return Array.from(subscriptions.values()).filter(s => s.user_id === userId);
}
/**
 * Delete a subscription.
 */
export function deleteSubscription(subId) {
    return subscriptions.delete(subId);
}
/**
 * Get subscription statistics.
 */
export function getSubscriptionStats() {
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
export function getRecentSignals(count = 20) {
    return recentSignals.slice(-count);
}
//# sourceMappingURL=subscriptionService.js.map