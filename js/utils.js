// Formata uma ISO string como tempo relativo legível
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString);
  if (diff < 60000)   return 'agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
  return `${Math.floor(diff / 3600000)}h atrás`;
}

// Retorna N índices aleatórios únicos dentro de [0, arrayLength)
function randomIndices(arrayLength, count) {
  const indices = new Set();
  while (indices.size < Math.min(count, arrayLength)) {
    indices.add(Math.floor(Math.random() * arrayLength));
  }
  return [...indices];
}
