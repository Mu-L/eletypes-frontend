/**
 * Asset resolver — maps asset ref strings to asset documents.
 *
 * Asset ref format: "{type}/{id}@{version}"
 * Example: "layout/generic-75-ansi@1"
 *
 * The bundled resolver loads from imported presets.
 * Future: chain with localStorage resolver and remote API resolver.
 */

import generic75 from "../../presets/generic75";
import cyberboard75 from "../../presets/cyberboard75";
import { CHERRY_PROFILE, SA_PROFILE, DSA_PROFILE, XDA_PROFILE } from "../../presets/keycaps";
import { LEGEND_PRESETS } from "../../presets/legends";
import { DEFAULT_SHELL, CYBERBOARD_SHELL } from "../shellProfile";

// ─── Bundled asset registry ───

const BUNDLED = {
  // Layouts
  "layout/generic-75-ansi@1": generic75,
  "layout/cyberboard-75-ansi@1": cyberboard75,

  // Keycap profiles
  "keycap/cherry-classic@1": CHERRY_PROFILE,
  "keycap/sa-classic@1": SA_PROFILE,
  "keycap/dsa-uniform@1": DSA_PROFILE,
  "keycap/xda-uniform@1": XDA_PROFILE,

  // Legends
  "legend/gmk-center@1": LEGEND_PRESETS["gmk-classic"],
  "legend/minimalist@1": LEGEND_PRESETS["minimalist"],
  "legend/retro@1": LEGEND_PRESETS["retro"],
  "legend/top-print@1": LEGEND_PRESETS["top-print"],
  "legend/cyber@1": LEGEND_PRESETS["cyber"],
  "legend/blank@1": LEGEND_PRESETS["blank"],

  // Shells
  "shell/generic-75@1": DEFAULT_SHELL,
  "shell/cyberboard-r3@1": CYBERBOARD_SHELL,
};

/**
 * Resolve an asset reference to its document.
 * @param {string} assetRef — e.g., "layout/generic-75-ansi@1"
 * @returns {Promise<Object>} The resolved asset document
 * @throws {Error} If asset not found
 */
export async function bundledResolver(assetRef) {
  const asset = BUNDLED[assetRef];
  if (!asset) {
    throw new Error(`Unknown asset: "${assetRef}". Available: ${Object.keys(BUNDLED).join(", ")}`);
  }
  return asset;
}

/**
 * List all available bundled assets.
 * @returns {Array<{ref: string, type: string, name: string}>}
 */
export function listBundledAssets() {
  return Object.entries(BUNDLED).map(([ref, doc]) => ({
    ref,
    type: ref.split("/")[0],
    name: doc.meta?.name || doc.id || ref,
  }));
}

/**
 * List bundled assets filtered by type.
 * @param {string} type — "layout"|"keycap"|"legend"|"visual"|"shell"
 */
export function listBundledByType(type) {
  return listBundledAssets().filter((a) => a.type === type);
}

/**
 * Parse an asset ref into its components.
 * @param {string} ref — "layout/generic-75-ansi@1"
 * @returns {{ type: string, id: string, version: string }}
 */
export function parseAssetRef(ref) {
  const match = ref.match(/^(\w+)\/([\w-]+)@(\w+)$/);
  if (!match) throw new Error(`Invalid asset ref: "${ref}"`);
  return { type: match[1], id: match[2], version: match[3] };
}
