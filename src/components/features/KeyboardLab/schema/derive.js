/**
 * Runtime derivation functions — the bridge between stored presets and renderers.
 *
 * All functions are pure: layout data in, derived data out.
 * No module-level singletons. Memoization happens at the React layer (useMemo).
 */

/**
 * Compute the bounding box of a key layout.
 * @param {Array} keys - BoardLayout.keys array
 * @returns {{ width: number, height: number }}
 */
export const computeBounds = (keys) => {
  let maxX = 0, maxY = 0;
  for (const k of keys) {
    maxX = Math.max(maxX, k.x + k.w);
    maxY = Math.max(maxY, k.y + (k.h || 1));
  }
  return { width: maxX, height: maxY };
};

/**
 * Build a key name/label → index lookup map.
 * Supports: key.id, key.label, key.code (all as lookup keys).
 * @param {Array} keys - BoardLayout.keys array
 * @returns {Map<string, number>}
 */
export const buildKeyIndex = (keys) => {
  const map = new Map();
  keys.forEach((key, i) => {
    map.set(key.id, i);
    if (key.label && key.label !== key.id && !map.has(key.label)) {
      map.set(key.label, i);
    }
    if (key.code && key.code !== key.id) {
      map.set(key.code, i);
    }
  });
  return map;
};

/**
 * Build a KeyboardEvent.code → layout key id map.
 * Used by the integration layer to translate DOM events → triggerKey calls.
 * @param {Array} keys - BoardLayout.keys array
 * @returns {Map<string, string>}
 */
export const buildCodeMap = (keys) => {
  const map = new Map();
  for (const key of keys) {
    const code = key.code || key.id;
    map.set(code, key.id);
  }
  return map;
};

/**
 * Check if a key is an accent key (larger/special, gets distinct color).
 * @param {{ kind: string }} key
 * @returns {boolean}
 */
export const isAccentKey = (key) => key.kind === "accent";

/**
 * Group keys by cluster for editor/highlighting.
 * @param {Array} keys
 * @returns {Map<string, Array>}
 */
export const groupByCluster = (keys) => {
  const groups = new Map();
  for (const key of keys) {
    const cluster = key.cluster || "unclustered";
    if (!groups.has(cluster)) groups.set(cluster, []);
    groups.get(cluster).push(key);
  }
  return groups;
};
