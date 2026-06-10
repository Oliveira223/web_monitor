import asyncio
import threading
from datetime import datetime, timezone
from typing import Optional
from config import NODES, PING_INTERVAL_S, PING_TIMEOUT_MS

_lock  = threading.Lock()
_state: dict = {}

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _init_state() -> dict:
    """Todos os nós começam offline; atualizado após o primeiro ciclo de ping."""
    ts = _now_iso()
    return {
        node_id: {"id": node_id, "status": "offline", "lastSeen": ts, "idleSince": None}
        for node_id in NODES
    }

_state = _init_state()

def get_state() -> dict:
    with _lock:
        return dict(_state)

async def _ping_once(ip: str) -> bool:
    try:
        timeout_s = max(1, PING_TIMEOUT_MS // 1000)
        proc = await asyncio.create_subprocess_exec(
            "ping", "-c", "1", "-W", str(timeout_s), ip,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await proc.wait()
        return proc.returncode == 0
    except Exception:
        return False

def _make_node(node_id: str, alive: bool, prev: Optional[dict]) -> dict:
    now = _now_iso()
    if alive:
        return {"id": node_id, "status": "active", "lastSeen": now, "idleSince": None}
    return {
        "id":        node_id,
        "status":    "offline",
        "lastSeen":  prev["lastSeen"] if prev else now,
        "idleSince": None,
    }

async def _ping_loop():
    while True:
        node_ids = list(NODES.keys())
        ips      = [NODES[nid] for nid in node_ids]

        results = await asyncio.gather(
            *[_ping_once(ip) for ip in ips],
            return_exceptions=True,
        )

        prev = get_state()
        new_state = {
            nid: _make_node(nid, result is True, prev.get(nid))
            for nid, result in zip(node_ids, results)
        }

        with _lock:
            _state.update(new_state)

        active  = sum(1 for n in new_state.values() if n["status"] == "active")
        offline = len(new_state) - active
        ts      = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] ping cycle — active: {active}  offline: {offline}")

        await asyncio.sleep(PING_INTERVAL_S)

def start_pinger():
    """Inicia o loop de ping em thread de background."""
    def _run():
        asyncio.run(_ping_loop())
    threading.Thread(target=_run, daemon=True).start()
