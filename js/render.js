const STATUS_ORDER = { active: 0, idle: 1, offline: 2 };

// ─── Tooltip ─────────────────────────────────────────────────────────────────

let _tt;

function initTooltip() {
  _tt = document.getElementById('tooltip');
}

function showTooltip(id, mx, my) {
  const node = state.nodes[id];
  const pos  = NODE_POSITIONS[id];
  if (!node || !pos) return;

  const color = CONFIG.STATUS_COLORS[node.status];

  _tt.innerHTML = `
    <div class="tt-name">
      <span class="tt-dot" style="background:${color}"></span>
      ${pos.label}
    </div>
    <div class="tt-rows">
      <span class="tt-key">id</span>
      <span class="tt-val">${id}</span>
      <span class="tt-key">status</span>
      <span class="tt-val status-${node.status}">${CONFIG.STATUS_LABELS[node.status]}</span>
      <span class="tt-key">visto</span>
      <span class="tt-val">${timeAgo(node.lastSeen)}</span>
    </div>
  `;

  _tt.classList.add('visible');
  _placeTooltip(mx, my);
}

function hideTooltip() {
  _tt.classList.remove('visible');
}

function _placeTooltip(mx, my) {
  const gap = 14;
  const tw  = _tt.offsetWidth;
  const th  = _tt.offsetHeight;
  let x = mx + gap;
  let y = my - th / 2;
  if (x + tw > window.innerWidth  - 8) x = mx - tw - gap;
  if (y < 8)                           y = 8;
  if (y + th > window.innerHeight - 8) y = window.innerHeight - th - 8;
  _tt.style.left = x + 'px';
  _tt.style.top  = y + 'px';
}

// ─── Inicialização (roda UMA VEZ) ────────────────────────────────────────────

function initRender() {
  initTooltip();
  initMap();
  initNodeGrid();
}

function initMap() {
  const container = document.getElementById('map-container');

  for (const [id, pos] of Object.entries(NODE_POSITIONS)) {
    const el = document.createElement('div');
    el.id         = `node-${id}`;
    el.className  = 'node-marker offline';
    el.dataset.id = id;
    el.addEventListener('mouseenter', e => showTooltip(id, e.clientX, e.clientY));
    el.addEventListener('mousemove',  e => _placeTooltip(e.clientX, e.clientY));
    el.addEventListener('mouseleave', hideTooltip);
    placeMarker(el, pos, container);
    container.appendChild(el);
  }

  window.addEventListener('resize', () => repositionAllMarkers());
}

function initNodeGrid() {
  const grid = document.getElementById('grid-offline');
  if (!grid) return; // página TV não tem lista de cards

  for (const [id, pos] of Object.entries(NODE_POSITIONS)) {
    const card = document.createElement('div');
    card.id        = `card-${id}`;
    card.className = 'node-card offline';
    card.innerHTML = `
      <div class="card-name">
        <span class="card-dot"></span>
        ${pos.label}
      </div>
      <div class="card-meta">
        <span class="node-badge" id="badge-${id}">—</span>
        <span class="node-time"  id="time-${id}">—</span>
      </div>
    `;
    grid.appendChild(card);
  }
}

// ─── Atualização (roda A CADA TICK) ─────────────────────────────────────────

function renderAll(state) {
  updateMap(state.nodes);
  updateGrid(state.nodes);
  updateHeader(state.nodes);
}

function updateMap(nodes) {
  Object.values(nodes).forEach(node => {
    const el = document.getElementById(`node-${node.id}`);
    if (!el) return;
    el.className = `node-marker ${node.status}`;
  });
}

function updateGrid(nodes) {
  const filterEl = document.getElementById('filter-input');
  if (!filterEl) return; // página TV não tem lista de cards

  const filter  = filterEl.value.toLowerCase();
  const visible = { active: 0, idle: 0, offline: 0 };

  Object.values(nodes).forEach(node => {
    const card   = document.getElementById(`card-${node.id}`);
    const badge  = document.getElementById(`badge-${node.id}`);
    const time   = document.getElementById(`time-${node.id}`);
    const marker = document.getElementById(`node-${node.id}`);
    if (!card) return;

    const label   = NODE_POSITIONS[node.id]?.label ?? node.id;
    const matches = !filter || label.toLowerCase().includes(filter);

    card.className    = `node-card ${node.status}`;
    badge.textContent = CONFIG.STATUS_LABELS[node.status];
    badge.className   = `node-badge status-${node.status}`;
    time.textContent  = timeAgo(node.lastSeen);

    // Mover card para o grupo correto se necessário
    const targetGrid = document.getElementById(`grid-${node.status}`);
    if (targetGrid && card.parentElement !== targetGrid) targetGrid.appendChild(card);

    card.style.display = matches ? '' : 'none';
    if (matches) visible[node.status]++;
    if (marker) marker.style.opacity = matches ? '' : '0.15';
  });

  // Mostrar/ocultar grupos e atualizar contagens
  for (const status of ['active', 'idle', 'offline']) {
    document.getElementById(`gcount-${status}`).textContent = visible[status];
    document.getElementById(`group-${status}`).style.display = visible[status] ? '' : 'none';
  }
}

function updateHeader(nodes) {
  const counts = { active: 0, idle: 0, offline: 0 };
  Object.values(nodes).forEach(n => counts[n.status]++);

  document.getElementById('count-active').textContent  = counts.active;
  document.getElementById('count-idle').textContent    = counts.idle;
  document.getElementById('count-offline').textContent = counts.offline;

  if (state.lastUpdated) {
    const txt = 'atualizado ' + timeAgo(state.lastUpdated.toISOString());
    const header  = document.getElementById('last-updated');
    if (header) header.textContent = txt;
    const sidebar = document.getElementById('last-updated-sidebar');
    if (sidebar) sidebar.textContent = txt;
  }
}

// ─── Posicionamento ───────────────────────────────────────────────────────────

// Círculo 13px — offset de 6.5px centraliza no ponto
function placeMarker(el, pos, container) {
  el.style.left = (pos.x * container.offsetWidth  - 6.5) + 'px';
  el.style.top  = (pos.y * container.offsetHeight - 6.5) + 'px';
}

function repositionAllMarkers() {
  const container = document.getElementById('map-container');
  for (const [id, pos] of Object.entries(NODE_POSITIONS)) {
    const el = document.getElementById(`node-${id}`);
    if (el) placeMarker(el, pos, container);
  }
}
