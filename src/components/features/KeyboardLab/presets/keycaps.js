/**
 * Built-in keycap profile presets.
 */

/** Cherry MX — sculpted, cylindrical dish */
export const CHERRY_PROFILE = {
  schema: "eletypes-cap/1",
  id: "cherry-profile",
  meta: { name: "Cherry", author: "eletypes" },
  profile: {
    id: "cherry",
    name: "Cherry MX",
    uniform: false,
    rows: {
      0: { topAngle: -6,  height: 1.0,  depth: 0.04 },
      1: { topAngle: -3,  height: 0.95, depth: 0.04 },
      2: { topAngle: 0,   height: 0.90, depth: 0.05 },
      3: { topAngle: 5,   height: 0.88, depth: 0.05 },
      4: { topAngle: 9,   height: 0.92, depth: 0.04 },
      5: { topAngle: 5,   height: 0.90, depth: 0.03 },
    },
    defaultCap: {
      topWidth: 0.85,
      topDepth: 0.85,
      height: 0.38,
      cornerRadius: 0.06,
      dishType: "cylindrical",
      dishDepth: 0.05,
    },
  },
  caps: {
    "cherry-homing": {
      id: "cherry-homing",
      name: "Cherry Homing Bar",
      type: "procedural",
      geometry: { topWidth: 0.82, topDepth: 0.82, height: 0.38, cornerRadius: 0.06, dishType: "cylindrical", dishDepth: 0.08 },
      tags: ["homing"],
    },
  },
};

/** SA — tall sculpted, spherical dish */
export const SA_PROFILE = {
  schema: "eletypes-cap/1",
  id: "sa-profile",
  meta: { name: "SA", author: "eletypes" },
  profile: {
    id: "sa",
    name: "SA",
    uniform: false,
    rows: {
      0: { topAngle: -12, height: 1.2,  depth: 0.06 },
      1: { topAngle: -8,  height: 1.15, depth: 0.06 },
      2: { topAngle: -3,  height: 1.1,  depth: 0.07 },
      3: { topAngle: 5,   height: 1.05, depth: 0.07 },
      4: { topAngle: 10,  height: 1.1,  depth: 0.06 },
      5: { topAngle: 5,   height: 1.05, depth: 0.05 },
    },
    defaultCap: {
      topWidth: 0.78,
      topDepth: 0.78,
      height: 0.52,
      cornerRadius: 0.07,
      dishType: "spherical",
      dishDepth: 0.07,
    },
  },
};

/** DSA — uniform, spherical dish, low profile */
export const DSA_PROFILE = {
  schema: "eletypes-cap/1",
  id: "dsa-profile",
  meta: { name: "DSA", author: "eletypes" },
  profile: {
    id: "dsa",
    name: "DSA",
    uniform: true,
    defaultCap: {
      topWidth: 0.80,
      topDepth: 0.80,
      height: 0.32,
      cornerRadius: 0.06,
      dishType: "spherical",
      dishDepth: 0.04,
    },
  },
};

/** XDA — uniform, flat-ish, wide top */
export const XDA_PROFILE = {
  schema: "eletypes-cap/1",
  id: "xda-profile",
  meta: { name: "XDA", author: "eletypes" },
  profile: {
    id: "xda",
    name: "XDA",
    uniform: true,
    defaultCap: {
      topWidth: 0.88,
      topDepth: 0.88,
      height: 0.35,
      cornerRadius: 0.08,
      dishType: "spherical",
      dishDepth: 0.02,
    },
  },
};

/** All keycap presets */
export const KEYCAP_PRESETS = {
  "cherry-profile": CHERRY_PROFILE,
  "sa-profile": SA_PROFILE,
  "dsa-profile": DSA_PROFILE,
  "xda-profile": XDA_PROFILE,
};

export const listKeycapPresets = () =>
  Object.values(KEYCAP_PRESETS).map((p) => ({ id: p.id, name: p.meta.name }));

export const getKeycapPreset = (id) => KEYCAP_PRESETS[id] || CHERRY_PROFILE;
