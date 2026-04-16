/**
 * Design Composition Schema — "eletypes-design/1"
 *
 * The primary user artifact. References assets by ID, adds local overrides.
 * Users save/share/remix designs, not individual schemas.
 *
 * @typedef {Object} DesignDocument
 * @property {"eletypes-design/1"} schema
 * @property {string} id                    — Stable design identity
 * @property {{name:string, author?:string, version?:string, description?:string}} meta
 * @property {DesignAssets} assets           — Asset references
 * @property {DesignOverrides} [overrides]   — Local overrides
 *
 * @typedef {Object} DesignAssets
 * @property {string} layout                — Required: "layout/generic-75-ansi@1"
 * @property {string} [keycap]              — "keycap/cherry-classic@1"
 * @property {string} [legend]              — "legend/gmk-center@1"
 * @property {string} [visual]              — "visual/botanical-dark@1"
 * @property {string} [shell]               — "shell/cyberboard-r3@1"
 *
 * @typedef {Object} DesignOverrides
 * @property {Object<string, KeyOverride>} [keys]  — Per-key overrides by key id
 * @property {Object} [visual]              — Partial visual color overrides
 * @property {Object} [legend]              — Partial legend style overrides
 *
 * @typedef {Object} KeyOverride
 * @property {string} [capRef]              — Override keycap for this key
 * @property {string} [color]               — Override color
 * @property {string} [legendColor]         — Override legend color
 * @property {string} [label]               — Override displayed label
 */

export const DESIGN_SCHEMA_VERSION = "eletypes-design/1";

/**
 * Create a new design document from asset selections.
 */
export const createDesign = ({ name, layout, keycap, legend, visual, shell, overrides }) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
  const design = {
    schema: DESIGN_SCHEMA_VERSION,
    id,
    meta: {
      name,
      version: "1",
      created: new Date().toISOString(),
    },
    assets: { layout },
  };
  if (keycap) design.assets.keycap = keycap;
  if (legend) design.assets.legend = legend;
  if (visual) design.assets.visual = visual;
  if (shell) design.assets.shell = shell;
  if (overrides && Object.keys(overrides).length > 0) design.overrides = overrides;
  return design;
};
