/**
 * DEPRECATED — backwards compatibility shim.
 * Import from presets/index.js or schema/derive.js instead.
 */

import generic75 from "./presets/generic75";
import { computeBounds, buildKeyIndex, buildCodeMap, isAccentKey } from "./schema/derive";

export const KEYBOARD_LAYOUT = generic75.keys;
export const LAYOUT_BOUNDS = computeBounds(generic75.keys);
export const KEY_INDEX_MAP = buildKeyIndex(generic75.keys);
export const CODE_TO_NAME = buildCodeMap(generic75.keys);
export { isAccentKey };
