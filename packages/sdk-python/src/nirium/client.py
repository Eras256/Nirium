# ═══════════════════════════════════════════════════════════════
# Nirium Python SDK v0.2.0 — Official Quantitative Client
# Synced with backend API (real Horizon data, Soroban execution)
# ═══════════════════════════════════════════════════════════════
import asyncio
import json
import logging
import aiohttp
import websockets
from typing import Callable, Dict, Any, List, Optional

logger = logging.getLogger("nirium.client")


class Agent:
    """
    Nirium Agent — Full API + WebSocket client for the Nirium autonomous agent.

    Usage:
        agent = Agent(api_url="http://localhost:3001", api_key="nrm_your_key")
        market = await agent.get_market()
        print(f"XLM Price: ${market['xlmPrice']:.4f}")
    """

    def __init__(self, api_url: str = "http://localhost:3001", api_key: str = None, token: str = None):
        self.api_url = api_url.rstrip('/')
        self.ws_url = self.api_url.replace("http", "ws") + "/ws/signals"
        self.api_key = api_key
        self.token = token

        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["x-api-key"] = self.api_key
        elif self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

        self.callbacks: Dict[str, List[Callable]] = {"signal": [], "log": [], "connected": []}

    # ─── Decorators ────────────────────────────────────────────

    def on(self, event_type: str):
        """Decorator to register event callbacks."""
        def decorator(func: Callable):
            if event_type not in self.callbacks:
                self.callbacks[event_type] = []
            self.callbacks[event_type].append(func)
            return func
        return decorator

    async def _emit(self, event_type: str, data: Any):
        for callback in self.callbacks.get(event_type, []):
            if asyncio.iscoroutinefunction(callback):
                await callback(data)
            else:
                callback(data)

    # ─── HTTP Helpers ─────────────────────────────────────────

    async def _get(self, path: str) -> Dict:
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.get(f"{self.api_url}{path}") as resp:
                resp.raise_for_status()
                return await resp.json()

    async def _post(self, path: str, payload: Dict = None) -> Dict:
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.post(f"{self.api_url}{path}", json=payload or {}) as resp:
                resp.raise_for_status()
                return await resp.json()

    async def _delete(self, path: str) -> Dict:
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.delete(f"{self.api_url}{path}") as resp:
                resp.raise_for_status()
                return await resp.json()

    # ─── Health ───────────────────────────────────────────────

    async def ping(self) -> bool:
        """Check if the agent is reachable."""
        try:
            data = await self._get("/health")
            return data.get("status") == "operational"
        except Exception:
            return False

    async def health(self) -> Dict:
        """Get detailed health info."""
        return await self._get("/health")

    async def system_health(self) -> Dict:
        """Get full system health (Horizon, Soroban, WebSocket, IPFS, LLM)."""
        return await self._get("/api/system/health")

    # ─── Market Data ─────────────────────────────────────────

    async def get_market(self) -> Dict:
        """Fetch real market state from Horizon (XLM price, SDEX spread, fees, paths)."""
        return await self._get("/api/market")

    async def get_loop_status(self) -> Dict:
        """Get autonomous loop status."""
        return await self._get("/api/loop/status")

    async def start_loop(self, config: Dict = None) -> Dict:
        """Start the autonomous scanning loop."""
        return await self._post("/api/loop/start", {"config": config or {}})

    async def stop_loop(self) -> Dict:
        """Stop the autonomous scanning loop."""
        return await self._post("/api/loop/stop")

    async def trigger_scan(self) -> Dict:
        """Trigger a manual market scan."""
        return await self._post("/api/loop/scan")

    # ─── Execution ───────────────────────────────────────────

    async def execute(self, strategy: str, asset: str, params: Optional[Dict] = None) -> Dict:
        """Execute a strategy via real Soroban contract call.

        Strategies: flash-loan-arb, path-arbitrage, cross-dex, blend-yield, soroswap-swap
        """
        return await self._post("/api/execute", {
            "strategy": strategy,
            "asset": asset,
            "params": params or {},
        })

    async def execute_demo(self, strategy: str, asset: str) -> Dict:
        """Execute a strategy in demo mode (Soroban dry-run, no TX submitted)."""
        return await self._post("/api/execute-demo", {
            "strategy": strategy,
            "asset": asset,
        })

    # ─── Signals ─────────────────────────────────────────────

    async def get_recent_signals(self, count: int = 20) -> Dict:
        """Get recent market signals."""
        return await self._get(f"/api/signals/recent?count={count}")

    # ─── Skills ──────────────────────────────────────────────

    async def get_skills(self) -> Dict:
        """List all loaded skills (built-in + user-installed)."""
        return await self._get("/api/skills")

    async def install_skill(self, source: str) -> Dict:
        """Install a skill by slug."""
        return await self._post("/api/skills/install", {"source": source})

    async def uninstall_skill(self, slug: str) -> Dict:
        """Uninstall a user-installed skill."""
        return await self._post("/api/skills/uninstall", {"slug": slug})

    # ─── Webhooks ────────────────────────────────────────────

    async def register_webhook(self, url: str, events: List[str], secret: str = None) -> Dict:
        """Register a webhook endpoint with HMAC signing."""
        return await self._post("/api/webhooks", {"url": url, "events": events, "secret": secret})

    async def get_webhooks(self) -> List[Dict]:
        """List all registered webhooks."""
        return await self._get("/api/webhooks")

    async def delete_webhook(self, webhook_id: str) -> Dict:
        """Delete a webhook by ID."""
        return await self._delete(f"/api/webhooks/{webhook_id}")

    async def test_webhook(self, webhook_id: str) -> Dict:
        """Send a test event to a webhook."""
        return await self._post(f"/api/webhooks/{webhook_id}/test")

    # ─── WebSocket ───────────────────────────────────────────

    async def subscribe(self, callback: Callable = None):
        """Start real-time WebSocket connection for signals."""
        if callback:
            self.callbacks.setdefault("signal", []).append(callback)

        auth_query = f"?apiKey={self.api_key}" if self.api_key else ""
        url = f"{self.ws_url}{auth_query}"

        while True:
            try:
                async with websockets.connect(url) as ws:
                    logger.info("Connected to Nirium Signal Stream")
                    await self._emit("connected", None)

                    async for message in ws:
                        data = json.loads(message)
                        event = data.get("type")
                        if event in self.callbacks:
                            await self._emit(event, data)
            except Exception as e:
                logger.error(f"WS Disconnected: {e}. Reconnecting in 5s...")
                await asyncio.sleep(5)
