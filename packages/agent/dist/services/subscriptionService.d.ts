import { WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { Signal, Subscription, SubscriptionFilter, LogEntry } from '../types/database.types.js';
/**
 * Initialize WebSocket server on the given HTTP server.
 */
export declare function initializeWebSocket(server: HttpServer): WebSocketServer;
/**
 * Broadcast a log message to all connected clients.
 */
export declare function broadcastLog(level: string, message: string, details?: Record<string, unknown>): void;
/**
 * Broadcast a signal to matching subscribers.
 */
export declare function broadcastSignal(signal: Signal): void;
/**
 * Get and clear the current log batch for IPFS archival.
 */
export declare function drainLogBatch(): LogEntry[];
/**
 * Create a new subscription.
 */
export declare function createSubscription(userId: string, filters: SubscriptionFilter): Subscription;
/**
 * Get all subscriptions for a user.
 */
export declare function getUserSubscriptions(userId: string): Subscription[];
/**
 * Delete a subscription.
 */
export declare function deleteSubscription(subId: string): boolean;
/**
 * Get subscription statistics.
 */
export declare function getSubscriptionStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    connectedClients: number;
    totalSignalsSent: number;
    recentSignals: number;
};
/**
 * Get recent signals.
 */
export declare function getRecentSignals(count?: number): Signal[];
//# sourceMappingURL=subscriptionService.d.ts.map