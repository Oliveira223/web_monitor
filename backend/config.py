import json
import os

PING_INTERVAL_S  = 2    # segundos entre ciclos completos de ping
PING_TIMEOUT_MS  = 500  # timeout por ping (flag -w no Windows)
API_HOST         = "localhost"
API_PORT         = 8000
CORS_ORIGIN      = "*"

# ── Modo desenvolvimento ──────────────────────────────────────────────────────
# True  → usa "ip_dev" do nodes.json quando disponível (IPs reais para testar)
# False → usa sempre "ip" (IPs reais do lab)
DEV_MODE = True

# ── Lê nodes.json — fonte única de verdade compartilhada com o frontend ───────
_json_path = os.path.join(os.path.dirname(__file__), '..', 'nodes.json')
with open(_json_path, encoding='utf-8') as f:
    _raw = json.load(f)

NODES = {
    nid: (node['ip_dev'] if DEV_MODE and 'ip_dev' in node else node['ip'])
    for nid, node in _raw.items()
}
