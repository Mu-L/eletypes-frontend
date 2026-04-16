/**
 * Local design persistence — localStorage adapter.
 *
 * Designs stored as eletypes-design/1 JSON under key prefix "eletypes-design-".
 */

const PREFIX = "eletypes-design-";

/**
 * Save a design document to localStorage.
 * @param {import('../schema/types/design').DesignDocument} design
 */
export function saveDesign(design) {
  if (!design?.id) throw new Error("Design must have an id");
  const data = {
    ...design,
    meta: {
      ...design.meta,
      updated: new Date().toISOString(),
    },
  };
  localStorage.setItem(PREFIX + design.id, JSON.stringify(data));
}

/**
 * Load a design document by id.
 * @param {string} id
 * @returns {import('../schema/types/design').DesignDocument|null}
 */
export function loadDesign(id) {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * List all saved designs.
 * @returns {Array<{id: string, name: string, updated: string}>}
 */
export function listDesigns() {
  const designs = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        designs.push({
          id: data.id,
          name: data.meta?.name || data.id,
          updated: data.meta?.updated || data.meta?.created || "",
        });
      } catch {
        // Skip corrupt entries
      }
    }
  }
  return designs.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
}

/**
 * Delete a design by id.
 * @param {string} id
 */
export function deleteDesign(id) {
  localStorage.removeItem(PREFIX + id);
}

/**
 * Export a design as formatted JSON string.
 * @param {import('../schema/types/design').DesignDocument} design
 * @returns {string}
 */
export function exportDesignJSON(design) {
  return JSON.stringify(design, null, 2);
}

/**
 * Import a design from JSON string. Validates basic structure.
 * @param {string} json
 * @returns {import('../schema/types/design').DesignDocument}
 * @throws {Error} If invalid
 */
export function importDesignJSON(json) {
  const design = JSON.parse(json);
  if (design.schema !== "eletypes-design/1") {
    throw new Error(`Expected schema "eletypes-design/1", got "${design.schema}"`);
  }
  if (!design.id || !design.assets?.layout) {
    throw new Error("Design must have id and assets.layout");
  }
  return design;
}
