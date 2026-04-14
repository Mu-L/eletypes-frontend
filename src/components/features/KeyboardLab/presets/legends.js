/**
 * Built-in legend style presets.
 */

export const LEGEND_PRESETS = {
  "gmk-classic": {
    schema: "eletypes-legend/1",
    id: "gmk-classic",
    meta: { name: "GMK Classic" },
    style: {
      fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
      fontSize: 11,
      fontWeight: 700,
      color: "#cccccc",
      position: "center",
      letterSpacing: 0.03,
      uppercase: true,
    },
  },
  "minimalist": {
    schema: "eletypes-legend/1",
    id: "minimalist",
    meta: { name: "Minimalist" },
    style: {
      fontFamily: "'Inter', 'SF Pro', sans-serif",
      fontSize: 9,
      fontWeight: 500,
      color: "#999999",
      position: "center",
      letterSpacing: 0.02,
      uppercase: false,
    },
  },
  "retro": {
    schema: "eletypes-legend/1",
    id: "retro",
    meta: { name: "Retro" },
    style: {
      fontFamily: "'Courier New', monospace",
      fontSize: 10,
      fontWeight: 700,
      color: "#e0d8c0",
      position: "center",
      letterSpacing: 0.05,
      uppercase: true,
    },
  },
  "top-print": {
    schema: "eletypes-legend/1",
    id: "top-print",
    meta: { name: "Top Print" },
    style: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: 8,
      fontWeight: 600,
      color: "#bbbbbb",
      position: "top-left",
      letterSpacing: 0.02,
      uppercase: false,
    },
  },
  "blank": {
    schema: "eletypes-legend/1",
    id: "blank",
    meta: { name: "Blank" },
    style: {
      fontFamily: "sans-serif",
      fontSize: 0,
      fontWeight: 400,
      color: "transparent",
      position: "center",
      uppercase: false,
    },
  },
};

export const listLegendPresets = () =>
  Object.values(LEGEND_PRESETS).map((p) => ({ id: p.id, name: p.meta.name }));

export const getLegendPreset = (id) => LEGEND_PRESETS[id] || LEGEND_PRESETS["gmk-classic"];
