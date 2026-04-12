
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * NIRIUM MCP SERVER (Ollama Enabled)
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'deepseek-r1-8b:latest';

async function askOllama(prompt: string) {
    try {
        const res = await fetch(OLLAMA_URL, {
            method: 'POST',
            body: JSON.stringify({ model: MODEL, prompt: prompt, stream: false })
        });
        const data: any = await res.json();
        return data.response;
    } catch (e) {
        return "Local reasoning unavailable.";
    }
}

const server = new Server(
  {
    name: "nirium-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const API_BASE = "http://localhost:3000/api";

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_nirium_skills",
        description: "List available agent skills in the Nirium marketplace",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_neural_recommendation",
        description: "Get a reasoned recommendation from local DeepSeek-R1 about which Nirium tool to use",
        inputSchema: {
          type: "object",
          properties: {
            goal: { type: "string", description: "The task you want the agent to perform" },
          },
          required: ["goal"],
        },
      },
      {
        name: "install_skill",
        description: "Initiate an x402 installation of a specific skill",
        inputSchema: {
          type: "object",
          properties: {
            skillId: { type: "string", description: "The ID of the skill to install" },
            account: { type: "string", description: "The Stellar public key of the agent" },
          },
          required: ["skillId", "account"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_nirium_skills") {
      const skills = [
          { id: 'flash-loan-executor', price: '0.01 USDC', desc: 'Soroban Flash Loans' },
          { id: 'whale-tracker', price: '0.01 USDC', desc: 'Mempool Whale Tracking' },
          { id: 'usdc-vault-manager', price: '0.01 USDC', desc: 'Yield Optimization' }
      ];
      return { content: [{ type: "text", text: JSON.stringify(skills) }] };
  }

  if (name === "get_neural_recommendation") {
      const { goal } = args as { goal: string };
      const prompt = `As the Nirium Neural Oracle, analyze this user goal: "${goal}". 
      Available tools: flash-loan-executor, whale-tracker, usdc-vault-manager.
      Which tool should they use? Provide a brief reasoned response.`;
      
      const recommendation = await askOllama(prompt);
      return { content: [{ type: "text", text: recommendation }] };
  }

  if (name === "install_skill") {
      const { skillId, account } = args as { skillId: string, account: string };
      return { 
          content: [{ 
              type: "text", 
              text: `To complete installation of ${skillId}, please sign the x402 challenge for account ${account}. Endpoint: ${API_BASE}/marketplace/install/${skillId}` 
          }] 
      };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nirium MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
