/**
 * Built-in shell presets — formalized as eletypes-shell/1 documents.
 */

import { SHELL_SCHEMA_VERSION } from "./types/shell";

export const DEFAULT_SHELL = {
  schema: SHELL_SCHEMA_VERSION,
  id: "generic-75",
  meta: { name: "Generic 75% Case" },
  case: {
    paddingTop: 0.4,
    paddingBottom: 0.4,
    paddingLeft: 0.4,
    paddingRight: 0.4,
    cornerRadius: 0.08,
    height: 0.25,
    tilt: 0,
  },
  plate: {
    inset: 0.3,
    height: 0.02,
    color: "#0a0a0c",
  },
};

export const CYBERBOARD_SHELL = {
  schema: SHELL_SCHEMA_VERSION,
  id: "cyberboard-r3",
  meta: {
    name: "Cyberboard R3 Case",
    description: "Cybertruck-inspired wedge case with LED pixel matrix panel, angular sidewalls, and rear tilt",
  },
  case: {
    paddingTop: 1.8,      // Large top area for LED pixel matrix panel
    paddingBottom: 0.4,
    paddingLeft: 0.45,
    paddingRight: 0.45,
    cornerRadius: 0.02,   // Sharp angular edges — Cybertruck-like
    height: 0.8,          // Tall case — the back is very thick in the real board
    tilt: 8,              // Steep slope — visible wedge angle from the side photo
  },
  plate: {
    inset: 0.4,
    height: 0.02,
    color: "#060610",
  },
  modules: [
    { type: "led-matrix", position: "top-center", height: 1.2, width: 14 },
  ],
};
