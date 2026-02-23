// ═══════════════════════════════════════════════════════════════
// Nirium Agent — Entry Point
// ═══════════════════════════════════════════════════════════════
import 'dotenv/config';
import { createAppServer, PORT, VERSION } from './server.js';
const { server } = createAppServer();
server.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  🧬 NIRIUM AGENT v${VERSION}`);
    console.log(`  ⚡ Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
    console.log(`  🌐 HTTP:    http://localhost:${PORT}`);
    console.log(`  🔌 WS:      ws://localhost:${PORT}/ws/signals`);
    console.log(`  🤖 LLM:     ${process.env.ACTIVE_LLM_PROVIDER || 'ollama'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
});
//# sourceMappingURL=index.js.map