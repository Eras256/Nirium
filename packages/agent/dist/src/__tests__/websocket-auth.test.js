// ═══════════════════════════════════════════════════════════════
// Nirium — Test: WebSocket JWT Security Guard
// ═══════════════════════════════════════════════════════════════
//
// Prueba 3 escenarios reales:
//   1. Conexión sin token → rechazada
//   2. Conexión con token inválido/falso → rechazada
//   3. Conexión con token JWT válido → aceptada y recibe "welcome"
//
// ═══════════════════════════════════════════════════════════════
import WebSocket from 'ws';
import { createAppServer } from '../server.js';
import { generateToken } from '../middleware/auth.js';
// ─── Helpers ───────────────────────────────────────────────────
/** Levanta el servidor en un puerto aleatorio y devuelve la URL base WS. */
function startTestServer() {
    return new Promise((resolve) => {
        // Usamos createAppServer para que el WS quede inicializado igual que en prod
        const { server } = createAppServer();
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({
                wsBase: `ws://127.0.0.1:${addr.port}/ws/signals`,
                close: () => server.close(),
            });
        });
    });
}
/** Conecta al WS y devuelve el primer mensaje recibido (con timeout de 3s). */
function getFirstMessage(url, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url);
        const timer = setTimeout(() => {
            ws.close();
            reject(new Error('Timeout: no message received'));
        }, timeoutMs);
        ws.on('message', (data) => {
            clearTimeout(timer);
            ws.close();
            try {
                resolve(JSON.parse(data.toString()));
            }
            catch {
                reject(new Error('Invalid JSON received'));
            }
        });
        ws.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}
// ─── Tests ─────────────────────────────────────────────────────
describe('🔒 WebSocket JWT Security Guard — Parche ClawJacked', () => {
    let wsBase;
    let close;
    beforeAll(async () => {
        const server = await startTestServer();
        wsBase = server.wsBase;
        close = server.close;
    });
    afterAll((done) => {
        close();
        done();
    });
    // ── TEST 1 ──────────────────────────────────────────────────
    it('❌ RECHAZA conexión sin token → "Unauthorized: Missing JWT token"', async () => {
        // Sin query param ?token=
        const msg = await getFirstMessage(`${wsBase}`);
        expect(msg.type).toBe('error');
        expect(msg.message).toContain('Missing JWT token');
    });
    // ── TEST 2 ──────────────────────────────────────────────────
    it('❌ RECHAZA conexión con token INVÁLIDO → "Unauthorized: Invalid or expired"', async () => {
        // Token inventado / firmado con secreto falso
        const msg = await getFirstMessage(`${wsBase}?token=HeaderFalso.PayloadFalso.FirmaFalsa`);
        expect(msg.type).toBe('error');
        expect(msg.message).toContain('Invalid or expired JWT token');
    });
    // ── TEST 3 ──────────────────────────────────────────────────
    it('✅ ACEPTA conexión con token JWT VÁLIDO → recibe mensaje "welcome"', async () => {
        // Generamos un token real usando la misma función del sistema
        const validToken = generateToken('test-wallet-GXXXXXX', ['user']);
        const msg = await getFirstMessage(`${wsBase}?token=${validToken}`);
        expect(msg.type).toBe('welcome');
        expect(msg.message).toContain('Nirium Signal Stream');
    });
});
//# sourceMappingURL=websocket-auth.test.js.map