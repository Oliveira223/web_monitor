// Carrega nodes.json — fonte única de verdade para posições e IPs.
// Preenche window.NODE_POSITIONS; chamado em main.js antes de qualquer render.
async function loadNodes() {
  try {
    const res = await fetch('nodes.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    window.NODE_POSITIONS = Object.fromEntries(
      Object.entries(raw).map(([id, n]) => [id, { x: n.x, y: n.y, label: n.label }])
    );
  } catch (err) {
    console.error('[loadNodes] falha ao carregar nodes.json:', err);
    window.NODE_POSITIONS = {};
  }
}
