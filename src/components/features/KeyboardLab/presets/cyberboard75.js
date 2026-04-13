/**
 * Cyberboard-inspired 75% ANSI preset.
 *
 * Same key layout as the generic 75% (standard ANSI key positions).
 * The Cyberboard identity comes from its shell profile (thick bottom bezel,
 * LED bar), not from key positioning.
 *
 * This preset demonstrates that two presets can share key geometry
 * but pair with different shells for different visual identities.
 */

import generic75 from "./generic75";

export default {
  ...generic75,
  id: "cyberboard-75-ansi",
  meta: {
    ...generic75.meta,
    name: "Cyberboard 75% ANSI",
    author: "eletypes",
    description: "Cyberboard R3-inspired layout with standard 75% ANSI key positions",
  },
};
