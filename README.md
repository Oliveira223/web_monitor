# Lab Monitor — 7º Andar

Monitor em tempo real dos computadores do laboratório. Exibe um mapa interativo com marcadores coloridos sobre a planta do andar e uma lista filtrável de todos os nós.

---

## Estrutura

```
web_monitor/
  index.html              — painel completo (mapa + lista + log de eventos)
  monitor.html            — visão TV fullscreen (mapa + sidebar escura)
  nodes.json              — fonte única de verdade: id, posição x/y, label, ip
  css/style.css           — tema escuro (index.html)
  css/monitor.css         — tema TV (monitor.html)
  js/
    config.js             — configurações globais (URL do backend, cores, zoom)
    data.js               — carrega nodes.json e expõe NODE_POSITIONS
    utils.js              — utilitários (timeAgo, etc.)
    mock.js               — gerador de dados falsos (Markov chain) — fallback
    logger.js             — painel de log de eventos
    render.js             — renderização do mapa, cards e header
    main.js               — estado central, loop de polling
  assets/
    SétimoAndar_clean.svg — planta do andar usada no mapa
  backend/
    config.py             — lê nodes.json e constrói NODES (ip por nó)
    pinger.py             — loop async de ping para todos os IPs
    server.py             — servidor HTTP com endpoint GET /api/nodes
  SétimoAndar.drawio      — fonte editável do mapa (draw.io)
```

---

## Como rodar

### 1. Backend Python (requer Python 3.8+, sem dependências externas)

```bash
cd web_monitor/backend
python server.py
```

O servidor sobe em `http://localhost:8000`. Você verá no terminal:

```
Backend rodando em  http://localhost:8000
Endpoint disponível: http://localhost:8000/api/nodes
[14:22:01] ping cycle — active: 3  offline: 18
```

### 2. Frontend

Serve os arquivos estáticos com qualquer servidor HTTP local (não abre `index.html` direto com `file://` — o SVG não carrega por restrições de CORS).

**Opção A — rodar de dentro da pasta `web_monitor/`** (mais simples):

```bash
cd web_monitor
python -m http.server 8080
```

**Opção B — rodar da pasta pai** (`04_MONITOR/`):

```bash
python -m http.server 8080 --directory web_monitor
```


Acesse:
- `http://localhost:8080` — painel completo com log
- `http://localhost:8080/monitor.html` — visão TV (sidebar escura, fullscreen)

> **Sem o backend rodando** o frontend cai automaticamente para o modo mock (dados simulados com Markov chain). O painel de log no rodapé mostra se está conectado ao backend ou usando mock.

---

## Configurar IPs dos nós

Edite **`nodes.json`** — é a única fonte de verdade para posições e IPs. O frontend e o backend Python leem o mesmo arquivo.

```json
{
  "pc:Marcon": { "x": 0.2060, "y": 0.0496, "label": "Marcon", "ip": "192.168.1.101" }
}
```

### Modo desenvolvimento (`DEV_MODE`)

Adicione `"ip_dev"` a qualquer nó em `nodes.json` para definir um IP alternativo de teste:

```json
{
  "pc:Marcon": { ..., "ip": "192.168.1.101", "ip_dev": "8.8.8.8" }
}
```

Com `DEV_MODE = True` em `backend/config.py`, o backend usa `ip_dev` quando disponível (ex.: `8.8.8.8` sempre responde, simulando um PC ligado). Para produção, defina `DEV_MODE = False`.

---

## Adicionar ou reposicionar nós

### 1. Encontrar as coordenadas no draw.io

Abra `SétimoAndar.drawio` no [draw.io](https://app.diagrams.net). Clique no elemento que representa o PC e anote os valores `x` e `y` da geometria (painel à direita).

Converta para coordenadas SVG:

```
svg_x = drawio_x + 810
svg_y = drawio_y - 570
```

Normalize pelas dimensões do viewBox (`5035 × 2460`):

```
pos_x = svg_x / 5035
pos_y = svg_y / 2460
```

### 2. Adicionar a entrada em `nodes.json`

```json
{
  "pc:NovoUsuario": { "x": 0.4231, "y": 0.3150, "label": "Novo Usuário", "ip": "192.168.1.130" }
}
```

Só isso — frontend e backend leem o mesmo arquivo, não é preciso tocar em mais nada.

---

## Atualizar o mapa SVG

O mapa vem do arquivo `SétimoAndar.drawio`. Para exportar uma nova versão:

1. Abra no draw.io
2. **File → Export As → SVG**
3. Marque **"Transparent background"** e desmarque **"Include a copy of the diagram"**
4. Salve como `assets/SétimoAndar_clean.svg`

O viewBox deve permanecer `0 0 5035 2460` para que as coordenadas dos nós continuem corretas.

---

## Conectar ao backend real (produção)

Quando o backend REST estiver pronto, edite apenas a função `fetchData` em `js/main.js`:

```js
// REST polling
async function fetchData() {
  const res = await fetch('/api/nodes');
  return { data: await res.json(), source: 'backend' };
}

// WebSocket (substitui o setInterval)
const ws = new WebSocket('ws://host/nodes');
ws.onmessage = e => setState(JSON.parse(e.data));
```

A URL do backend para o modo atual fica em `js/config.js`:

```js
BACKEND_URL: 'http://localhost:8000/api/nodes',
USE_BACKEND: true,   // false → força o mock mesmo com backend rodando
```

---

## Status dos nós

| Status | Significado |
|--------|-------------|
| `active` | PC respondeu ao ping recente |
| `offline` | PC não respondeu |
| `idle` | Reservado para futuro agente local (CPU/input inativo) |

O backend atual detecta apenas `active` / `offline` via ping ICMP. Para `idle`, será necessário um agente rodando em cada máquina.
