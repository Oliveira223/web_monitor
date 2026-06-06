// Posições normalizadas para o SVG limpo (SétimoAndar_clean.svg)
// SVG viewBox: 0 0 5035 2460 — formula: svg_x = drawio_x + 810, svg_y = drawio_y - 570
// Conteúdo real do mapa termina em svg_y ≈ 2440 (viewBox cortado de 2831 → 2460)
// Uso: left = pos.x * containerWidth, top = pos.y * containerHeight

const NODE_POSITIONS = {
  // ── Gabinetes — fileira superior (grupo rotacionado -90° no draw.io) ───────
  "pc:Marcon":          { x: 0.2060, y: 0.0496, label: "Marcon"           },
  "pc:Anderson":        { x: 0.2500, y: 0.0496, label: "Anderson"         },
  "pc:Moraes":          { x: 0.2950, y: 0.0496, label: "Moraes"           },
  "pc:Rafael":          { x: 0.3400, y: 0.0496, label: "Rafael"           },

  // ── Sala de pesquisa — esquerda ────────────────────────────────────────────
  "pc:Isadora":         { x: 0.1296, y: 0.3821, label: "Isadora"          },
  "pc:Arthur":          { x: 0.0442, y: 0.4947, label: "Arthur"           },
  "pc:Rodrigo Susin":   { x: 0.0724, y: 0.4947, label: "Rodrigo Susin"    },
  "pc:Carlos Eduardo":  { x: 0.0442, y: 0.5357, label: "Carlos Eduardo"   },
  "pc:Pedro Henrique":  { x: 0.0724, y: 0.5357, label: "Pedro Henrique"   },
  "pc:Milena":          { x: 0.0442, y: 0.6453, label: "Milena"           },
  "pc:Francesco":       { x: 0.0724, y: 0.6453, label: "Francesco"        },
  "pc:Luiz":            { x: 0.0442, y: 0.6862, label: "Luiz"             },
  "pc:Rodrigo Machado": { x: 0.0724, y: 0.6862, label: "Rodrigo Machado"  },

  // ── Área direita (Lape Math / Data Com) ───────────────────────────────────
  "pc:Bernardo Fraga":    { x: 0.8183, y: 0.7615, label: "Bernardo Fraga"        },
  "pc:Pedro Oliveira":    { x: 0.7870, y: 0.7624, label: "Pedro Oliveira"        },
  "pc:Giovana":           { x: 0.9208, y: 0.8225, label: "Giovana"               },
  "pc:Thiago Zilberknop": { x: 0.9022, y: 0.8225, label: "Thiago Zilberknop"     },
  "pc:Thiago Faria":      { x: 0.8481, y: 0.7987, label: "Thiago Faria"          },
  "pc:Pedro Sangali":     { x: 0.8184, y: 0.7987, label: "Pedro Sangali"         },
  "pc:Bernardo Mendes":   { x: 0.7872, y: 0.7982, label: "Bernardo Mendes"       },
  "pc:Debora+Arthur+Theo":{ x: 0.8482, y: 0.7624, label: "Débora, Arthur e Theo" },
};
