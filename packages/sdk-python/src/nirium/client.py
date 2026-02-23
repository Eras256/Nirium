"""
Nirium Agent — Full Python SDK with 100% feature parity to the TypeScript SDK.

Usage:
    from nirium import Agent

    agent = Agent(api_key="nrm_your_key_here", base_url="http://localhost:3001")

    # Health check
    print(agent.ping())  # True

    # Get market data
    market = agent.get_market()
    print(f"XLM Price: ${market['xlmPrice']}")

    # Execute a strategy
    result = agent.execute("flash-loan-arb", "XLM", {"amount": 5000})
    print(f"Profit: {result['profit']}")

    # Subscribe to real-time signals
    import asyncio
    asyncio.run(agent.subscribe(lambda signal: print(signal)))
"""

from __future__ import annotations

import json
import asyncio
import threading
from typing import Any, Callable, Optional
from dataclasses import dataclass, field

import requests
import websockets


@dataclass
class AgentConfig:
    """Configuration for the Nirium Agent."""
    api_key: str
    base_url: str = "http://localhost:3001"
    ws_url: Optional[str] = None
    timeout: int = 30

    def __post_init__(self):
        self.base_url = self.base_url.rstrip("/")
        if self.ws_url is None:
            self.ws_url = self.base_url.replace("http", "ws") + "/ws/signals"


class Agent:
    """
    Nirium Agent — Full API + WebSocket client.

    Provides 100% feature parity with the TypeScript SDK.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:3001",
        ws_url: Optional[str] = None,
        timeout: int = 30,
    ):
        self.config = AgentConfig(
            api_key=api_key,
            base_url=base_url,
            ws_url=ws_url,
            timeout=timeout,
        )
        self._session = requests.Session()
        self._session.headers.update({
            "Content-Type": "application/json",
            "x-api-key": self.config.api_key,
        })
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._ws_task: Optional[asyncio.Task] = None
        self._signal_callbacks: list[Callable] = []
        self._log_callbacks: list[Callable] = []

    # ─── HTTP Methods ────────────────────────────────────────

    def _request(
        self,
        method: str,
        path: str,
        body: Optional[dict[str, Any]] = None,
    ) -> Any:
        """Make an HTTP request to the agent API."""
        url = f"{self.config.base_url}{path}"
        try:
            response = self._session.request(
                method=method,
                url=url,
                json=body,
                timeout=self.config.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Nirium API Error: {e}") from e

    # ─── Health ──────────────────────────────────────────────

    def ping(self) -> bool:
        """Health check — returns True if agent is reachable."""
        try:
            data = self._request("GET", "/health")
            return data.get("status") == "operational"
        except Exception:
            return False

    def health(self) -> dict[str, Any]:
        """Detailed health information."""
        return self._request("GET", "/health")

    def system_health(self) -> dict[str, Any]:
        """Detailed system health (Horizon, Soroban, WebSocket, IPFS)."""
        return self._request("GET", "/api/system/health")

    # ─── Execution ───────────────────────────────────────────

    def execute(
        self,
        strategy: str,
        asset: str,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Execute a strategy (routed through Testnet/Mainnet)."""
        return self._request("POST", "/api/execute", {
            "strategy": strategy,
            "asset": asset,
            "params": params or {},
        })

    def execute_demo(self, strategy: str, asset: str) -> dict[str, Any]:
        """Demo execution (rate-limited, public)."""
        return self._request("POST", "/api/execute-demo", {
            "strategy": strategy,
            "asset": asset,
        })

    # ─── Market Data ─────────────────────────────────────────

    def get_market(self) -> dict[str, Any]:
        """Get current market state."""
        return self._request("GET", "/api/market")

    def get_loop_status(self) -> dict[str, Any]:
        """Get autonomous loop status."""
        return self._request("GET", "/api/loop/status")

    def start_loop(self, config: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        """Start the autonomous scanning loop."""
        return self._request("POST", "/api/loop/start", {"config": config})

    def stop_loop(self) -> dict[str, Any]:
        """Stop the autonomous scanning loop."""
        return self._request("POST", "/api/loop/stop")

    def trigger_scan(self) -> dict[str, Any]:
        """Trigger a manual market scan."""
        return self._request("POST", "/api/loop/scan")

    # ─── Subscriptions ───────────────────────────────────────

    def create_subscription(
        self,
        signal_types: Optional[list[str]] = None,
        min_confidence: Optional[float] = None,
        min_profit_percentage: Optional[float] = None,
        pairs: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """Create a signal subscription with filters."""
        filters: dict[str, Any] = {}
        if signal_types:
            filters["signal_types"] = signal_types
        if min_confidence is not None:
            filters["min_confidence"] = min_confidence
        if min_profit_percentage is not None:
            filters["min_profit_percentage"] = min_profit_percentage
        if pairs:
            filters["pairs"] = pairs
        return self._request("POST", "/api/subscriptions", {"filters": filters})

    def get_recent_signals(self, count: int = 20) -> dict[str, Any]:
        """Get recent signals."""
        return self._request("GET", f"/api/signals/recent?count={count}")

    # ─── Skills ──────────────────────────────────────────────

    def get_skills(self) -> dict[str, Any]:
        """List all loaded skills."""
        return self._request("GET", "/api/skills")

    def install_skill(self, source: str) -> dict[str, Any]:
        """Install a skill from source."""
        return self._request("POST", "/api/skills/install", {"source": source})

    # ─── WebSocket ───────────────────────────────────────────

    async def subscribe(
        self,
        callback: Callable[[dict[str, Any]], None],
        subscription_id: Optional[str] = None,
    ) -> None:
        """
        Subscribe to real-time signals via WebSocket.

        This is an async function. Use asyncio.run() to start it:
            asyncio.run(agent.subscribe(my_callback))
        """
        self._signal_callbacks.append(callback)

        ws_url = self.config.ws_url
        assert ws_url is not None

        async for websocket in websockets.connect(ws_url):
            try:
                self._ws = websocket

                if subscription_id:
                    await websocket.send(json.dumps({
                        "type": "subscribe",
                        "subscriptionId": subscription_id,
                    }))

                async for message in websocket:
                    try:
                        data = json.loads(message)
                        msg_type = data.get("type")

                        if msg_type == "signal":
                            for cb in self._signal_callbacks:
                                cb(data)
                        elif msg_type == "log":
                            for cb in self._log_callbacks:
                                cb(data)
                    except json.JSONDecodeError:
                        continue

            except websockets.ConnectionClosed:
                print("[Nirium SDK] WebSocket disconnected, reconnecting...")
                continue
            except Exception as e:
                print(f"[Nirium SDK] WebSocket error: {e}")
                await asyncio.sleep(5)
                continue

    def subscribe_sync(
        self,
        callback: Callable[[dict[str, Any]], None],
        subscription_id: Optional[str] = None,
    ) -> threading.Thread:
        """
        Subscribe to signals in a background thread (sync wrapper).

        Returns the thread object for management.
        """
        def _run():
            asyncio.run(self.subscribe(callback, subscription_id))

        thread = threading.Thread(target=_run, daemon=True)
        thread.start()
        return thread

    def disconnect(self) -> None:
        """Close the WebSocket connection."""
        if self._ws:
            asyncio.get_event_loop().run_until_complete(self._ws.close())
            self._ws = None
        self._signal_callbacks.clear()
        self._log_callbacks.clear()

    def __repr__(self) -> str:
        return f"Agent(base_url='{self.config.base_url}', connected={self._ws is not None})"
