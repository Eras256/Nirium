// ═══════════════════════════════════════════════════════════════
// Nirium MCP Server v0.2.0 — Complete tool set for IDE/LLM control
// ═══════════════════════════════════════════════════════════════
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

const API_URL = process.env.AGENT_API_URL || "http://127.0.0.1:3001";

const server = new Server(
    { name: "nirium-mcp-server", version: "0.2.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_market_state",
                description: "Fetch real-time market data from Stellar Horizon: XLM price, SDEX spread, base fee, Blend APY, Soroswap pool depth, and path payment routes.",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "execute_strategy",
                description: "Execute a DeFi strategy on Stellar via Soroban contract. Strategies: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap.",
                inputSchema: {
                    type: "object",
                    properties: {
                        strategy: { type: "string", enum: ["flash-loan-arb", "path-arbitrage", "cross-dex", "blend-yield", "soroswap-swap"] },
                        asset: { type: "string", description: "Trading pair, e.g. XLM-USDC" },
                        amount: { type: "number", description: "Amount in stroops" },
                    },
                    required: ["strategy", "asset"],
                },
            },
            {
                name: "execute_demo",
                description: "Dry-run a strategy via Soroban simulation (no real transaction submitted). Useful for previewing execution results.",
                inputSchema: {
                    type: "object",
                    properties: {
                        strategy: { type: "string" },
                        asset: { type: "string" },
                    },
                    required: ["strategy", "asset"],
                },
            },
            {
                name: "get_loop_status",
                description: "Reports the autonomous scanning loop state: running/stopped, scan count, uptime, last AI decision, and current market state.",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "start_loop",
                description: "Start the autonomous market scanning loop with optional configuration (minProfitPercentage, maxBaseFee).",
                inputSchema: {
                    type: "object",
                    properties: {
                        minProfitPercentage: { type: "number", description: "Minimum profit % to trigger (default: 0.3)" },
                        maxBaseFee: { type: "number", description: "Max Stellar base fee in stroops (default: 500)" },
                    },
                    required: [],
                },
            },
            {
                name: "stop_loop",
                description: "Stop the autonomous scanning loop.",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "trigger_scan",
                description: "Trigger a single manual market scan (one-shot analysis).",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "get_system_health",
                description: "Detailed system health: Horizon connectivity, Soroban RPC status, WebSocket clients, IPFS gateway, and active LLM provider.",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "get_recent_signals",
                description: "Retrieves recent market signals (path arbitrage opportunities, yield shifts, fee spikes, etc).",
                inputSchema: {
                    type: "object",
                    properties: {
                        count: { type: "number", description: "Number of signals to fetch (default: 10)" },
                    },
                    required: [],
                },
            },
            {
                name: "list_skills",
                description: "List all installed skills/plugins (built-in and user-installed).",
                inputSchema: { type: "object", properties: {}, required: [] },
            },
            {
                name: "install_skill",
                description: "Install a skill/plugin by slug.",
                inputSchema: {
                    type: "object",
                    properties: {
                        source: { type: "string", description: "Skill slug to install" },
                    },
                    required: ["source"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        // ─── Market Data ──────────────────────────────────────
        if (name === "get_market_state") {
            const res = await fetch(`${API_URL}/api/market`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        // ─── Loop Control ─────────────────────────────────────
        if (name === "get_loop_status") {
            const res = await fetch(`${API_URL}/api/loop/status`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (name === "start_loop") {
            const res = await fetch(`${API_URL}/api/loop/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config: args || {} }),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (name === "stop_loop") {
            const res = await fetch(`${API_URL}/api/loop/stop`, { method: "POST" });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (name === "trigger_scan") {
            const res = await fetch(`${API_URL}/api/loop/scan`, { method: "POST" });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        // ─── Execution ────────────────────────────────────────
        if (name === "execute_strategy") {
            const res = await fetch(`${API_URL}/api/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (name === "execute_demo") {
            const res = await fetch(`${API_URL}/api/execute-demo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        // ─── System Health ────────────────────────────────────
        if (name === "get_system_health") {
            const res = await fetch(`${API_URL}/api/system/health`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        // ─── Signals ──────────────────────────────────────────
        if (name === "get_recent_signals") {
            const count = (args as any)?.count || 10;
            const res = await fetch(`${API_URL}/api/signals/recent?count=${count}`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        // ─── Skills ───────────────────────────────────────────
        if (name === "list_skills") {
            const res = await fetch(`${API_URL}/api/skills`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (name === "install_skill") {
            const res = await fetch(`${API_URL}/api/skills/install`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        throw new Error(`Tool [${name}] not found`);
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Nirium MCP Server v0.2.0 running on stdio");
}

main().catch((err) => {
    console.error("Fatal error in MCP server:", err);
    process.exit(1);
});
