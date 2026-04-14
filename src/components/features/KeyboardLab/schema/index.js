/**
 * Schema barrel export — single import point for all schema concerns.
 *
 * Usage:
 *   import { normalizeKeyboard, validateLayout, LAYOUT_SCHEMA_VERSION } from "./schema";
 */

// Types / constants
export { LAYOUT_SCHEMA_VERSION, FORM_FACTORS, LAYOUT_STAGGERS, STANDARDS, KEY_KINDS, KEY_DEFAULTS } from "./types/layout";
export { KEYCAP_SCHEMA_VERSION, PROFILE_IDS } from "./types/keycap";
export { VISUAL_SCHEMA_VERSION } from "./types/visual";

// Validation
export { validateLayout, validateKeycap, validateVisual } from "./validation/validate";

// Normalization
export { normalizeKeyboard, extractRenderData } from "./normalize/normalize";

// Derivation (existing, kept for backwards compat)
export { computeBounds, buildKeyIndex, buildCodeMap, isAccentKey, extractKeys, groupByCluster } from "./derive";
