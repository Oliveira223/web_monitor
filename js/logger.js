const MAX_LOG_ENTRIES = 40;

let _entries;
let _badge;
let _currentSource = null;

function initLogger() {
  _entries = document.getElementById('log-entries');
  _badge   = document.getElementById('log-source-badge');
  if (!_entries || !_badge) return; // página TV não tem painel de log

  document.getElementById('log-clear-btn').addEventListener('click', () => {
    _entries.innerHTML = '';
    _addSystemEntry('log limpo');
  });

  _addSystemEntry('monitor iniciado');
}

function logUpdate(prevNodes, nextNodes, source) {
  if (!_entries) return; // página TV não tem painel de log

  if (source !== _currentSource) {
    _currentSource = source;
    _badge.textContent = source === 'backend' ? 'BACKEND' : 'MOCK';
    _badge.className   = `log-badge ${source}`;
    _addSystemEntry(source === 'backend' ? 'conectado ao backend' : 'usando mock (backend indisponível)');
  }

  for (const [id, next] of Object.entries(nextNodes)) {
    const prev = prevNodes[id];
    if (!prev || prev.status === next.status) continue;
    _addChangeEntry(id, prev.status, next.status);
  }
}

function _ts() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

function _prepend(el) {
  _entries.prepend(el);
  while (_entries.children.length > MAX_LOG_ENTRIES) {
    _entries.removeChild(_entries.lastChild);
  }
}

function _addChangeEntry(id, from, to) {
  const label = NODE_POSITIONS[id]?.label ?? id;
  const el    = document.createElement('div');
  el.className = 'log-entry';
  el.innerHTML =
    `<span class="log-ts">${_ts()}</span>` +
    `<span class="log-name">${label}</span>` +
    `<span class="log-status status-${from}">${CONFIG.STATUS_LABELS[from]}</span>` +
    `<span class="log-arrow">→</span>` +
    `<span class="log-status status-${to}">${CONFIG.STATUS_LABELS[to]}</span>`;
  _prepend(el);
}

function _addSystemEntry(msg) {
  const el = document.createElement('div');
  el.className = 'log-entry log-system';
  el.innerHTML =
    `<span class="log-ts">${_ts()}</span>` +
    `<span class="log-sys-msg">${msg}</span>`;
  _prepend(el);
}
