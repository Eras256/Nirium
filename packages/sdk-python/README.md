# nirium

Official Python SDK for the **Nirium Protocol** — autonomous DeFi agent on Stellar/Soroban.

## Install

```bash
pip install nirium
```

## Quick Start

```python
import asyncio
from nirium import Agent

agent = Agent(
    api_url="https://api.nirium.xyz",
    api_key="sk_inst_your_key_here",
)

async def main():
    # Health check
    alive = await agent.ping()
    print(f"Agent alive: {alive}")

    # Real market data from Stellar Horizon
    market = await agent.get_market()
    print(f"XLM Price: ${market['xlmPrice']:.4f}")

    # Execute a strategy
    result = await agent.execute("flash-loan-arb", "XLM-USDC", {"amount": 5000})
    print(f"Profit: {result['profit']}")

asyncio.run(main())
```

## Real-Time Signals (WebSocket)

```python
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...", token="eyJhbG...")

@agent.on("signal")
async def on_signal(data):
    print(f"Signal: {data['signal_type']} — {data['data']['details']}")

asyncio.run(agent.subscribe())
```

## Authentication

```python
# API Key for REST endpoints
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

# With JWT token for WebSocket
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...", token="eyJhbG...")
```

### Endpoint Access Model

| Access | Endpoints |
|---|---|
| **Public** (no key) | `health`, `loop/status`, `execute-demo`, `signals/recent`, `skills` list |
| **Protected** (API key) | `execute`, `market`, `loop/start\|stop\|scan`, `subscriptions`, `skills/install`, `webhooks` |
| **WebSocket** (JWT) | `/ws/signals` — real-time signal stream |

## API Coverage

| Category | Methods |
|---|---|
| Health | `ping()`, `health()`, `system_health()` |
| Execution | `execute()`, `execute_demo()` |
| Market | `get_market()`, `get_loop_status()`, `start_loop()`, `stop_loop()`, `trigger_scan()` |
| Signals | `get_recent_signals()` |
| Skills | `get_skills()`, `install_skill()`, `uninstall_skill()` |
| Webhooks | `register_webhook()`, `get_webhooks()`, `delete_webhook()`, `test_webhook()` |
| WebSocket | `subscribe()`, `on()` decorator |

## Requirements

- Python >= 3.10
- aiohttp >= 3.9.0
- websockets >= 13.0

## License

MIT — Nirium Protocol
