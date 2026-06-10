// ─── Estado central ───────────────────────────────────────────────────────────
let state = { nodes: {}, lastUpdated: null };

function setState(newNodes) {
  state = { nodes: newNodes, lastUpdated: new Date() };
  renderAll(state);
}

// ─── Fonte de dados ───────────────────────────────────────────────────────────
// Retorna { data, source } — source é 'backend' ou 'mock'.
// USE_BACKEND=false em config.js força mock mesmo com backend rodando.
async function fetchData() {
  if (!CONFIG.USE_BACKEND) return { data: getMockUpdate(state.nodes), source: 'mock' };
  try {
    const res  = await fetch(CONFIG.BACKEND_URL);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (Object.keys(data).length === 0) return { data: getMockUpdate(state.nodes), source: 'mock' };
    return { data, source: 'backend' };
  } catch {
    return { data: getMockUpdate(state.nodes), source: 'mock' };
  }
}

async function tick() {
  const { data, source } = await fetchData();
  logUpdate(state.nodes, data, source);
  setState(data);
}

// ─── Zoom (somente via botões) ────────────────────────────────────────────────
let zoomLevel = 1.0;

function applyZoom() {
  document.getElementById('map-container').style.width = (zoomLevel * 100) + '%';
  const lbl = document.getElementById('zoom-label');
  if (lbl) lbl.textContent = Math.round(zoomLevel * 100) + '%';
  requestAnimationFrame(repositionAllMarkers);
}

const _btnIn    = document.getElementById('btn-zoom-in');
const _btnOut   = document.getElementById('btn-zoom-out');
const _btnReset = document.getElementById('btn-zoom-reset');
if (_btnIn) _btnIn.addEventListener('click', () => {
  zoomLevel = Math.min(CONFIG.ZOOM_MAX, +(zoomLevel + CONFIG.ZOOM_STEP).toFixed(2));
  applyZoom();
});
if (_btnOut) _btnOut.addEventListener('click', () => {
  zoomLevel = Math.max(CONFIG.ZOOM_MIN, +(zoomLevel - CONFIG.ZOOM_STEP).toFixed(2));
  applyZoom();
});
if (_btnReset) _btnReset.addEventListener('click', () => {
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

  const dateEl = document.getElementById('tv-date');
  if (dateEl) {
    const DAYS   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    dateEl.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  }
}

// ─── Inicialização ────────────────────────────────────────────────────────────
// O relógio roda independente do carregamento de nodes.json.
updateClock();
setInterval(updateClock, 1000);

// tudo que depende de NODE_POSITIONS vem após o await.
(async () => {
  try {
    await loadNodes();
  } catch (err) {
    console.error('[init] loadNodes falhou, usando NODE_POSITIONS vazio:', err);
    window.NODE_POSITIONS = window.NODE_POSITIONS ?? {};
  }
  initRender();
  initLogger();
  setState(initMock());
  tick();
  setInterval(tick, CONFIG.POLL_INTERVAL_MS);
})();
