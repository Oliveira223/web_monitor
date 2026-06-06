// ─── Estado central ───────────────────────────────────────────────────────────
let state = { nodes: {}, lastUpdated: null };

function setState(newNodes) {
  state = { nodes: newNodes, lastUpdated: new Date() };
  renderAll(state);
}

// ─── Fonte de dados ───────────────────────────────────────────────────────────
// Troque APENAS esta função quando o backend estiver pronto.
// REST:  const res = await fetch('/api/nodes'); return res.json();
// WS:    const ws = new WebSocket('ws://…'); ws.onmessage = e => setState(JSON.parse(e.data));
async function fetchData() {
  return getMockUpdate(state.nodes);
}

async function tick() {
  setState(await fetchData());
}

// ─── Zoom (somente via botões) ────────────────────────────────────────────────
let zoomLevel = 1.0;

function applyZoom() {
  document.getElementById('map-container').style.width = (zoomLevel * 100) + '%';
  document.getElementById('zoom-label').textContent    = Math.round(zoomLevel * 100) + '%';
  requestAnimationFrame(repositionAllMarkers);
}

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  zoomLevel = Math.min(CONFIG.ZOOM_MAX, +(zoomLevel + CONFIG.ZOOM_STEP).toFixed(2));
  applyZoom();
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  zoomLevel = Math.max(CONFIG.ZOOM_MIN, +(zoomLevel - CONFIG.ZOOM_STEP).toFixed(2));
  applyZoom();
});
document.getElementById('btn-zoom-reset').addEventListener('click', () => {
  zoomLevel = 1.0;
  applyZoom();
});

// ─── Pan (arrastar para mover quando em zoom) ─────────────────────────────────
(function setupPan() {
  const area = document.getElementById('map-area');
  let dragging = false;
  let startX, startY, scrollX, scrollY;

  area.addEventListener('mousedown', e => {
    if (e.target.classList.contains('node-marker')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    scrollX = area.scrollLeft; scrollY = area.scrollTop;
    area.classList.add('panning');
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    area.scrollLeft = scrollX - (e.clientX - startX);
    area.scrollTop  = scrollY - (e.clientY - startY);
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    area.classList.remove('panning');
  });
  // Sem zoom por scroll — a roda do mouse rola a página normalmente
})();

// ─── Relógio ──────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m;
}

// ─── Inicialização ────────────────────────────────────────────────────────────
initRender();
setState(initMock());
setInterval(tick, CONFIG.POLL_INTERVAL_MS);
updateClock();
setInterval(updateClock, 1000);
