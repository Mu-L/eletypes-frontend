/**
 * Eletypes Keyboard Layout Schema — "eletypes-kbd/1"
 *
 * Canonical format for keyboard layout presets, 2D editing, 3D rendering, and JSON sharing.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │ Top-level structure                                      │
 * │                                                         │
 * │  meta     → document metadata (who, when, version)      │
 * │  board    → keyboard-level specs (size, standard, type)  │
 * │  layout   → coordinate data (keys array)                │
 * │  visual   → optional styling hints (colors, theme)      │
 * └─────────────────────────────────────────────────────────┘
 *
 * Design choices:
 *
 * 1. meta vs board vs layout — three distinct concerns:
 *    meta is about the document (author, version, created date)
 *    board is about the physical keyboard (75%, ANSI, dimensions)
 *    layout is about the keys (positions, sizes, identities)
 *    This means you can swap the visual layer without touching the layout,
 *    or share the same board spec across different key arrangements.
 *
 * 2. Key identity: id vs keyName vs label
 *    id:      internal unique identifier within this layout (required, string)
 *    keyName: logical key identity, typically KeyboardEvent.code (required)
 *    label:   what's printed on the keycap (required, can be "")
 *    This avoids overloading one field for both lookup and display.
 *
 * 3. Required vs optional:
 *    Required: schema, meta.name, board.layoutType, board.standard,
 *              board.width, board.height, and per-key: id, keyName, label, x, y, w
 *    Optional: meta.author, meta.version, meta.created, meta.description,
 *              board.keyboardType, board.unit, board.casePreset, board.modules,
 *              per-key: h (default 1), r (rotation), kind, cluster, profile
 *              visual (entire section)
 *
 * 4. board.width / board.height are the bounding dimensions of the key field
 *    in key-units. Renderers use these for centering/framing without scanning all keys.
 *    They can be auto-computed but storing them avoids redundant computation
 *    and makes the JSON self-describing.
 *
 * 5. visual is intentionally optional and loosely typed — it's a hint layer,
 *    not a contract. Renderers may ignore it entirely.
 */

/**
 * @typedef {Object} KeyboardPreset
 *
 * @property {string} schema                  — "eletypes-kbd/1"
 *
 * @property {Object} meta                    — Document metadata
 * @property {string} meta.name               — Display name (required)
 * @property {string} [meta.author]           — Creator
 * @property {string} [meta.version]          — Preset version (semver or free string)
 * @property {string} [meta.created]          — ISO date string
 * @property {string} [meta.description]      — Human-readable description
 *
 * @property {Object} board                   — Keyboard-level specs
 * @property {string} board.layoutType        — "60%" | "65%" | "75%" | "TKL" | "full" | "split" (required)
 * @property {string} board.standard          — "ANSI" | "ISO" | "JIS" (required)
 * @property {string} [board.keyboardType]    — "mechanical" | "membrane" | "optical" | "topre"
 * @property {number} board.width             — Bounding width of key field in key-units (required)
 * @property {number} board.height            — Bounding height of key field in key-units (required)
 * @property {number} [board.unit]            — Physical size of 1u in mm (default 19.05)
 * @property {string} [board.casePreset]      — Shell profile id to pair with (e.g., "cyberboard-r3")
 * @property {Array}  [board.modules]         — Optional top-level modules: [{ type, position, ... }]
 *
 * @property {Object} layout                  — Key placement data
 * @property {Array<KeyDef>} layout.keys      — Array of key definitions (required)
 *
 * @property {Object} [visual]                — Optional styling hints
 * @property {string} [visual.keycapColor]
 * @property {string} [visual.accentColor]
 * @property {string} [visual.caseColor]
 * @property {string} [visual.theme]          — Named theme hint
 */

/**
 * @typedef {Object} KeyDef
 *
 * @property {string} id                — Unique within this layout (required)
 * @property {string} keyName           — Logical key identity, e.g., KeyboardEvent.code (required)
 * @property {string} label             — Keycap display text (required, "" for blank)
 *
 * @property {number} x                 — X position in key-units, top-left corner (required)
 * @property {number} y                 — Y position in key-units, top-left corner (required)
 * @property {number} w                 — Width in key-units (required)
 * @property {number} [h=1]             — Height in key-units
 * @property {number} [r=0]             — Rotation in degrees
 *
 * @property {string} [kind="alpha"]    — "alpha" | "mod" | "accent" | "fn" | "nav" | "arrow"
 * @property {string} [cluster]         — Grouping hint: "fn-row", "alpha", "nav-col", "arrow-cluster", etc.
 * @property {number} [profile]         — Row profile index (0=top, 4=bottom) for sculpted keycaps
 */

// ─── Constants ───

export const SCHEMA_VERSION = "eletypes-kbd/1";

const VALID_KINDS = new Set(["alpha", "mod", "accent", "fn", "nav", "arrow"]);
const VALID_LAYOUT_TYPES = new Set(["60%", "65%", "75%", "TKL", "full", "split"]);
const VALID_STANDARDS = new Set(["ANSI", "ISO", "JIS"]);

// ─── Validation ───

export const validatePreset = (preset) => {
  const errors = [];
  if (!preset) return { valid: false, errors: ["Preset is null/undefined"] };

  // Schema
  if (preset.schema !== SCHEMA_VERSION) {
    errors.push(`Expected schema "${SCHEMA_VERSION}", got "${preset.schema}"`);
  }

  // Meta
  if (!preset.meta?.name) errors.push("Missing meta.name");

  // Board
  if (!preset.board) {
    errors.push("Missing board object");
  } else {
    if (!VALID_LAYOUT_TYPES.has(preset.board.layoutType)) {
      errors.push(`Invalid board.layoutType: "${preset.board.layoutType}"`);
    }
    if (!VALID_STANDARDS.has(preset.board.standard)) {
      errors.push(`Invalid board.standard: "${preset.board.standard}"`);
    }
    if (typeof preset.board.width !== "number") errors.push("Missing board.width");
    if (typeof preset.board.height !== "number") errors.push("Missing board.height");
  }

  // Layout
  if (!preset.layout?.keys?.length) {
    errors.push("Missing or empty layout.keys");
  } else {
    const ids = new Set();
    preset.layout.keys.forEach((key, i) => {
      const tag = `Key[${i}]`;
      if (!key.id) errors.push(`${tag}: missing id`);
      if (ids.has(key.id)) errors.push(`${tag}: duplicate id "${key.id}"`);
      ids.add(key.id);
      if (!key.keyName) errors.push(`${tag}: missing keyName`);
      if (typeof key.label !== "string") errors.push(`${tag}: missing label`);
      if (typeof key.x !== "number") errors.push(`${tag}: missing x`);
      if (typeof key.y !== "number") errors.push(`${tag}: missing y`);
      if (typeof key.w !== "number" || key.w <= 0) errors.push(`${tag}: invalid w`);
      if (key.kind && !VALID_KINDS.has(key.kind)) {
        errors.push(`${tag}: invalid kind "${key.kind}"`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

// ─── Factory ───

/**
 * Create a well-formed preset. Fills in defaults for optional fields.
 */
export const createPreset = ({
  name,
  author = "eletypes",
  version = "1.0",
  description = "",
  layoutType = "75%",
  standard = "ANSI",
  keyboardType = "mechanical",
  casePreset = null,
  modules = [],
  keys = [],
  visual = null,
}) => {
  // Normalize keys with defaults
  const normalizedKeys = keys.map((k, i) => ({
    id: k.id || `key-${i}`,
    keyName: k.keyName || k.id,
    label: k.label ?? "",
    x: k.x,
    y: k.y,
    w: k.w,
    h: k.h ?? 1,
    r: k.r ?? 0,
    kind: k.kind ?? "alpha",
    cluster: k.cluster ?? null,
    profile: k.profile ?? null,
  }));

  // Auto-compute board dimensions from keys
  let width = 0, height = 0;
  for (const k of normalizedKeys) {
    width = Math.max(width, k.x + k.w);
    height = Math.max(height, k.y + k.h);
  }

  return {
    schema: SCHEMA_VERSION,
    meta: {
      name,
      author,
      version,
      created: new Date().toISOString(),
      description,
    },
    board: {
      layoutType,
      standard,
      keyboardType,
      width,
      height,
      unit: 19.05,
      casePreset,
      modules,
    },
    layout: {
      keys: normalizedKeys,
    },
    ...(visual ? { visual } : {}),
  };
};
