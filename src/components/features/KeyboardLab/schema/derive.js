/**
 * Runtime derivation functions.
 * Pure functions: preset data in → derived data out.
 * Memoization happens at the React layer (useMemo), not here.
 */

/**
 * Compute bounding box from keys array.
 * @param {Array<KeyDef>} keys
 * @returns {{ width: number, height: number }}
 */
export const computeBounds = (keys) => {
  let w = 0, h = 0;
  for (const k of keys) {
    w = Math.max(w, k.x + k.w);
    h = Math.max(h, k.y + (k.h || 1));
  }
  return { width: w, height: h };
};

/**
 * Build lookup map: id | keyName | label → key index.
 * Used by triggerKey() for O(1) resolution.
 * @param {Array<KeyDef>} keys
 * @returns {Map<string, number>}
 */
export const buildKeyIndex = (keys) => {
  const map = new Map();
  keys.forEach((key, i) => {
    // Primary: id
    map.set(key.id, i);
    // Secondary: keyName (KeyboardEvent.code)
    if (key.keyName && key.keyName !== key.id && !map.has(key.keyName)) {
      map.set(key.keyName, i);
    }
    // Tertiary: label shorthand (e.g., "A", "Esc")
    if (key.label && key.label !== key.id && key.label !== key.keyName && !map.has(key.label)) {
      map.set(key.label, i);
    }
  });
  return map;
};

/**
 * Build KeyboardEvent.code → key id map.
 * Used by the integration layer to translate DOM events.
 * @param {Array<KeyDef>} keys
 * @returns {Map<string, string>}
 */
export const buildCodeMap = (keys) => {
  const map = new Map();
  for (const key of keys) {
    map.set(key.keyName, key.id);
  }
  return map;
};

/** @param {{ kind: string }} key */
export const isAccentKey = (key) => key.kind === "accent";

/**
 * Group keys by cluster.
 * @param {Array<KeyDef>} keys
 * @returns {Map<string, Array<KeyDef>>}
 */
export const groupByCluster = (keys) => {
  const groups = new Map();
  for (const key of keys) {
    const c = key.cluster || "unclustered";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(key);
  }
  return groups;
};

/**
 * Extract the keys array from a preset, handling both full preset
 * and raw keys array for backwards compatibility.
 * @param {Object|Array} presetOrKeys
 * @returns {Array<KeyDef>}
 */
export const extractKeys = (presetOrKeys) => {
  if (Array.isArray(presetOrKeys)) return presetOrKeys;
  if (presetOrKeys?.layout?.keys) return presetOrKeys.layout.keys;
  if (presetOrKeys?.keys) return presetOrKeys.keys;
  return [];
};
