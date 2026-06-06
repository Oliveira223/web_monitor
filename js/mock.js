const STATUSES = ['active', 'idle', 'offline'];

// Tabela de transições de estado com probabilidades acumuladas
const TRANSITIONS = {
  offline: [
    { next: 'active',  threshold: 0.50 },
    { next: 'idle',    threshold: 0.85 },
    { next: 'offline', threshold: 1.00 },
  ],
  active: [
    { next: 'idle',    threshold: 0.35 },
    { next: 'active',  threshold: 0.75 },
    { next: 'offline', threshold: 1.00 },
  ],
  idle: [
    { next: 'offline', threshold: 0.25 },
    { next: 'active',  threshold: 0.65 },
    { next: 'idle',    threshold: 1.00 },
  ],
};

function nextStatus(current) {
  // 10% de chance de ir para qualquer estado aleatório
  if (Math.random() < 0.10) {
    return STATUSES[Math.floor(Math.random() * STATUSES.length)];
  }

  const roll = Math.random();
  for (const { next, threshold } of TRANSITIONS[current]) {
    if (roll < threshold) return next;
  }
  return current;
}

function makeNode(id, status) {
  const now = new Date().toISOString();
  return {
    id,
    status,
    lastSeen:  status !== 'offline' ? now : new Date(Date.now() - Math.random() * 3600000).toISOString(),
    idleSince: status === 'idle'    ? now : null,
  };
}

// Cria o estado inicial com status aleatório para todos os nós
function initMock() {
  const nodes = {};
  for (const id of Object.keys(NODE_POSITIONS)) {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    nodes[id] = makeNode(id, status);
  }
  return nodes;
}

// Retorna uma cópia do estado com 1–N nós alterados
function getMockUpdate(currentNodes) {
  const ids     = Object.keys(currentNodes);
  const changed = randomIndices(ids.length, CONFIG.NODES_CHANGED_PER_TICK);
  const updated = { ...currentNodes };

  for (const idx of changed) {
    const id     = ids[idx];
    const status = nextStatus(currentNodes[id].status);
    updated[id]  = makeNode(id, status);
  }

  // Nós que continuam online têm lastSeen atualizado a cada tick
  const now = new Date().toISOString();
  for (const id of ids) {
    if (updated[id].status !== 'offline') {
      updated[id] = { ...updated[id], lastSeen: now };
    }
  }

  return updated;
}
