/**
 * Cyberboard-inspired 75% ANSI preset.
 * Same key layout as generic 75%, different shell identity and visual.
 */

import generic75 from "./generic75";

export default {
  ...generic75,
  meta: {
    ...generic75.meta,
    name: "Cyberboard 75% ANSI",
    description: "Cyberboard R3-inspired with standard 75% ANSI key positions",
  },
  board: {
    ...generic75.board,
    id: "cyberboard-75-ansi",
    casePreset: "cyberboard-r3",
  },
  visual: {
    keycapColor: "#1a1a2e",
    accentColor: "#2d2d5e",
    caseColor: "#0a0a18",
    theme: "cyberboard",
  },
};
