/**
 * Design document resolver — the composition engine.
 *
 * Takes a design doc + asset resolver, resolves all references,
 * applies overrides, and produces a NormalizedKeyboard.
 *
 * This is a wrapper around normalizeKeyboard() that adds:
 * - Async asset reference resolution
 * - Design-level override merging
 * - Per-key override application
 */

import { normalizeKeyboard } from "./normalize";

/**
 * Resolve a design document into a fully normalized keyboard.
 *
 * @param {import('../types/design').DesignDocument} design
 * @param {(assetRef: string) => Promise<Object>} resolver
 * @returns {Promise<import('../types/normalized').NormalizedKeyboard>}
 */
export async function resolveDesign(design, resolver) {
  // 1. Resolve all asset references
  const layout = await resolver(design.assets.layout);
  const keycap = design.assets.keycap ? await resolver(design.assets.keycap) : null;
  const legend = design.assets.legend ? await resolver(design.assets.legend) : null;
  const visual = design.assets.visual ? await resolver(design.assets.visual) : null;
  const shell = design.assets.shell ? await resolver(design.assets.shell) : null;

  // 2. Apply design-level overrides
  const overrides = design.overrides || {};

  // Merge visual overrides
  const mergedVisual = visual && overrides.visual
    ? { ...visual, colors: { ...visual.colors, ...overrides.visual } }
    : visual;

  // Merge legend overrides
  const mergedLegend = legend && overrides.legend
    ? { ...legend, style: { ...legend.style, ...overrides.legend } }
    : legend;

  // 3. Apply per-key overrides to the layout
  let resolvedLayout = layout;
  if (overrides.keys && Object.keys(overrides.keys).length > 0) {
    const keys = (layout.layout?.keys || []).map((key) => {
      const keyOverride = overrides.keys[key.id];
      if (!keyOverride) return key;
      return { ...key, ...keyOverride };
    });
    resolvedLayout = {
      ...layout,
      layout: { ...layout.layout, keys },
    };
  }

  // 4. Normalize
  const normalized = normalizeKeyboard(resolvedLayout, keycap, mergedVisual);

  // 5. Attach shell and legend to the result
  normalized.shell = shell;
  normalized.legend = mergedLegend;

  return normalized;
}

/**
 * Create a design document from the current editor state.
 * Convenience function for the demo/editor to produce a design doc
 * from individual selections.
 */
export function designFromSelections({
  name = "Untitled Design",
  layoutRef,
  keycapRef,
  legendRef,
  shellRef,
  colorOverrides,
  legendOverrides,
  keyOverrides,
  caseProfile,
  mountOffset,
  mountFit,
  caseScale,
  extrudeWidth,
}) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

  const design = {
    schema: "eletypes-design/1",
    id,
    meta: {
      name,
      version: "1",
      created: new Date().toISOString(),
    },
    assets: {
      layout: layoutRef,
    },
  };

  if (keycapRef) design.assets.keycap = keycapRef;
  if (legendRef) design.assets.legend = legendRef;
  if (shellRef) design.assets.shell = shellRef;

  const overrides = {};
  if (colorOverrides && Object.keys(colorOverrides).length > 0) overrides.visual = colorOverrides;
  if (legendOverrides && Object.keys(legendOverrides).length > 0) overrides.legend = legendOverrides;
  if (keyOverrides && Object.keys(keyOverrides).length > 0) overrides.keys = keyOverrides;

  // Case profile + mount settings
  if (caseProfile?.points) overrides.caseProfile = caseProfile;
  const mount = {};
  if (mountOffset && (mountOffset.x || mountOffset.y || mountOffset.z)) mount.offset = mountOffset;
  if (mountFit != null && mountFit !== 0.85) mount.fit = mountFit;
  if (caseScale != null && caseScale !== 1.0) mount.caseScale = caseScale;
  if (extrudeWidth != null && extrudeWidth !== 1.0) mount.extrudeWidth = extrudeWidth;
  if (Object.keys(mount).length > 0) overrides.mount = mount;
  if (Object.keys(overrides).length > 0) design.overrides = overrides;

  return design;
}
