/**
 * BoardLayout schema definition and validation.
 *
 * A BoardLayout is the core portable data unit — it contains everything
 * needed to render a keyboard in 2D or 3D. No rendering assumptions,
 * no shell identity, no theme colors.
 *
 * Schema: "eletypes-board/1"
 *
 * Shape:
 * {
 *   schema: "eletypes-board/1",
 *   id: string,              // unique preset identifier
 *   meta: {
 *     name: string,          // display name
 *     author: string,        // creator name
 *     layoutType: string,    // "60%"|"65%"|"75%"|"TKL"|"full"
 *     standard: string,      // "ANSI"|"ISO"|"JIS"
 *     description?: string,
 *   },
 *   keys: Array<{
 *     id: string,            // unique within layout, maps to KeyboardEvent.code
 *     label: string,         // display text
 *     x: number,             // position in key-units (top-left corner)
 *     y: number,
 *     w: number,             // width in key-units
 *     h?: number,            // height (default 1)
 *     kind: string,          // "alpha"|"mod"|"accent"|"fn"|"nav"|"arrow"
 *     cluster?: string,      // grouping hint: "fn-row","alpha","bottom-row","nav-col","arrow-cluster"
 *     rotation?: number,     // degrees, default 0
 *     code?: string,         // override if id !== KeyboardEvent.code
 *   }>
 * }
 */

export const SCHEMA_VERSION = "eletypes-board/1";

const VALID_KINDS = new Set(["alpha", "mod", "accent", "fn", "nav", "arrow"]);
const VALID_LAYOUT_TYPES = new Set(["60%", "65%", "75%", "TKL", "full"]);
const VALID_STANDARDS = new Set(["ANSI", "ISO", "JIS"]);

/**
 * Validate a BoardLayout object. Returns { valid, errors }.
 */
export const validateBoardLayout = (layout) => {
  const errors = [];

  if (!layout) {
    return { valid: false, errors: ["Layout is null/undefined"] };
  }

  if (layout.schema !== SCHEMA_VERSION) {
    errors.push(`Expected schema "${SCHEMA_VERSION}", got "${layout.schema}"`);
  }

  if (!layout.id || typeof layout.id !== "string") {
    errors.push("Missing or invalid id");
  }

  // Meta
  if (!layout.meta) {
    errors.push("Missing meta object");
  } else {
    if (!layout.meta.name) errors.push("Missing meta.name");
    if (!VALID_LAYOUT_TYPES.has(layout.meta.layoutType)) {
      errors.push(`Invalid meta.layoutType: "${layout.meta.layoutType}"`);
    }
    if (!VALID_STANDARDS.has(layout.meta.standard)) {
      errors.push(`Invalid meta.standard: "${layout.meta.standard}"`);
    }
  }

  // Keys
  if (!Array.isArray(layout.keys) || layout.keys.length === 0) {
    errors.push("Missing or empty keys array");
  } else {
    const ids = new Set();
    layout.keys.forEach((key, i) => {
      if (!key.id) errors.push(`Key ${i}: missing id`);
      if (ids.has(key.id)) errors.push(`Key ${i}: duplicate id "${key.id}"`);
      ids.add(key.id);
      if (typeof key.x !== "number") errors.push(`Key ${i} (${key.id}): missing x`);
      if (typeof key.y !== "number") errors.push(`Key ${i} (${key.id}): missing y`);
      if (typeof key.w !== "number" || key.w <= 0) errors.push(`Key ${i} (${key.id}): invalid w`);
      if (key.kind && !VALID_KINDS.has(key.kind)) {
        errors.push(`Key ${i} (${key.id}): invalid kind "${key.kind}"`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Create a minimal valid BoardLayout structure.
 */
export const createBoardLayout = ({ id, name, layoutType = "75%", standard = "ANSI", author = "eletypes", keys = [] }) => ({
  schema: SCHEMA_VERSION,
  id,
  meta: { name, author, layoutType, standard },
  keys: keys.map((k) => ({
    h: 1,
    kind: "alpha",
    cluster: null,
    rotation: 0,
    code: null,
    ...k,
  })),
});
