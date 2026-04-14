/**
 * Runtime validation for all three schemas.
 * Lightweight — no external deps. Returns { valid, errors }.
 */

import { LAYOUT_SCHEMA_VERSION, FORM_FACTORS, LAYOUT_STAGGERS, STANDARDS, KEY_KINDS } from "../types/layout";
import { KEYCAP_SCHEMA_VERSION } from "../types/keycap";
import { VISUAL_SCHEMA_VERSION } from "../types/visual";

// ─── Helpers ───

const has = (obj, key) => obj != null && typeof obj[key] !== "undefined";
const isStr = (v) => typeof v === "string" && v.length > 0;
const isNum = (v) => typeof v === "number" && !isNaN(v);
const isIn = (v, set) => set.includes(v);

// ─── Layout validation ───

export const validateLayout = (preset) => {
  const e = [];
  if (!preset) return { valid: false, errors: ["null"] };

  if (preset.schema !== LAYOUT_SCHEMA_VERSION) e.push(`schema: expected "${LAYOUT_SCHEMA_VERSION}"`);
  if (!preset.meta?.name) e.push("meta.name required");

  const b = preset.board;
  if (!b) {
    e.push("board required");
  } else {
    if (!isStr(b.id)) e.push("board.id required");
    if (!isIn(b.formFactor, FORM_FACTORS)) e.push(`board.formFactor invalid: "${b.formFactor}"`);
    if (!isIn(b.layoutStagger, LAYOUT_STAGGERS)) e.push(`board.layoutStagger invalid: "${b.layoutStagger}"`);
    if (!isIn(b.standard, STANDARDS)) e.push(`board.standard invalid: "${b.standard}"`);
    if (!isNum(b.width)) e.push("board.width required");
    if (!isNum(b.height)) e.push("board.height required");
  }

  const keys = preset.layout?.keys;
  if (!Array.isArray(keys) || keys.length === 0) {
    e.push("layout.keys required (non-empty)");
  } else {
    const ids = new Set();
    keys.forEach((k, i) => {
      const t = `key[${i}]`;
      if (!isStr(k.id)) e.push(`${t}.id required`);
      if (ids.has(k.id)) e.push(`${t}.id duplicate: "${k.id}"`);
      ids.add(k.id);
      if (!isStr(k.keyName)) e.push(`${t}.keyName required`);
      if (typeof k.label !== "string") e.push(`${t}.label required (string)`);
      if (!isNum(k.x)) e.push(`${t}.x required`);
      if (!isNum(k.y)) e.push(`${t}.y required`);
      if (!isNum(k.w) || k.w <= 0) e.push(`${t}.w required (positive)`);
      if (has(k, "kind") && !isIn(k.kind, KEY_KINDS)) e.push(`${t}.kind invalid: "${k.kind}"`);
    });
  }

  return { valid: e.length === 0, errors: e };
};

// ─── Keycap validation ───

export const validateKeycap = (preset) => {
  const e = [];
  if (!preset) return { valid: false, errors: ["null"] };

  if (preset.schema !== KEYCAP_SCHEMA_VERSION) e.push(`schema: expected "${KEYCAP_SCHEMA_VERSION}"`);
  if (!isStr(preset.id)) e.push("id required");
  if (!preset.meta?.name) e.push("meta.name required");

  const p = preset.profile;
  if (!p) {
    e.push("profile required");
  } else {
    if (!isStr(p.id)) e.push("profile.id required");
    if (typeof p.uniform !== "boolean") e.push("profile.uniform required (boolean)");
    if (!p.defaultCap) e.push("profile.defaultCap required");
    if (!p.uniform && !p.rows) e.push("profile.rows required for non-uniform profiles");
  }

  if (preset.caps) {
    Object.entries(preset.caps).forEach(([capId, cap]) => {
      const t = `caps["${capId}"]`;
      if (!isStr(cap.id)) e.push(`${t}.id required`);
      if (cap.type !== "procedural" && cap.type !== "mesh") e.push(`${t}.type must be "procedural" or "mesh"`);
      if (cap.type === "procedural" && !cap.geometry) e.push(`${t}.geometry required for procedural`);
      if (cap.type === "mesh" && !cap.mesh?.url) e.push(`${t}.mesh.url required for mesh type`);
    });
  }

  return { valid: e.length === 0, errors: e };
};

// ─── Visual validation ───

export const validateVisual = (preset) => {
  const e = [];
  if (!preset) return { valid: false, errors: ["null"] };

  if (preset.schema !== VISUAL_SCHEMA_VERSION) e.push(`schema: expected "${VISUAL_SCHEMA_VERSION}"`);
  if (!isStr(preset.id)) e.push("id required");
  if (!preset.meta?.name) e.push("meta.name required");
  if (!preset.colors) e.push("colors required");

  return { valid: e.length === 0, errors: e };
};
