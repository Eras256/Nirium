"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ═══════════════════════════════════════════════════════════════
// Nirium MCP Server — Tool calling proxy for IDEs and local LLMs
// ═══════════════════════════════════════════════════════════════
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const node_fetch_1 = __importDefault(require("node-fetch"));
const API_URL = process.env.AGENT_API_URL || "http://127.0.0.1:3001";
const server = new index_js_1.Server({ name: "nirium-mcp-server", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_market_state",
                description: "Obtiene métricas nativas de Stellar (SDEX orderbook, Base Fee, Soroswap AMM depth). Útil para evaluar viabilidad de arbitraje.",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "execute_strategy",
                description: "Inyecta una instrucción al Agent Loop para ejecutar una estrategia (ej. path-arbitrage) firmando un xdr multi-operación.",
                inputSchema: {
                    type: "object",
                    properties: {
                        strategy: { type: "string" },
                        asset: { type: "string", description: "Format: XLM-USDC" },
                    },
                    required: ["strategy", "asset"],
                },
            }
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "get_market_state") {
            const res = await (0, node_fetch_1.default)(`${API_URL}/api/market`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        if (name === "execute_strategy") {
            const res = await (0, node_fetch_1.default)(`${API_URL}/api/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args)
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        throw new Error(`Tool [${name}] not found`);
    }
    catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Nirium MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Fatal error in MCP server:", err);
    process.exit(1);
});
