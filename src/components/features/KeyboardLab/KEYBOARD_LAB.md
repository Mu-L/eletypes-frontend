# Keyboard Lab — Data-Driven 3D Keyboard Visualization Platform

## Status: Feature Branch (`feat/keyboard-lab`) — 14 commits

---

## 1. Schemas (4 Independent Layers)

### Layout Schema — `eletypes-kbd/1`

Defines keyboard structure, key identity, and 2D placement.

```
schema → meta → board → layout.keys[]
```

| Section | Purpose | Required fields |
|---------|---------|-----------------|
| `meta` | Document metadata | `name` |
| `board` | Keyboard specs | `id`, `formFactor`, `layoutStagger`, `standard`, `width`, `height` |
| `layout.keys[]` | Per-key placement | `id`, `keyName`, `label`, `x`, `y`, `w` |

Per-key optional: `h` (default 1), `r` (rotation), `kind` (alpha/mod/accent/fn/nav/arrow), `cluster`, `capRef`.

### Keycap Schema — `eletypes-cap/1`

Defines profile families, row sculpting, cap variants, and future mesh references.

```
schema → meta → profile (family + row rules + defaultCap) → caps{} (named variants)
```

| Concept | Fields |
|---------|--------|
| Profile family | id, name, uniform (bool), rows (per-row sculpt), defaultCap |
| Row sculpting | topAngle, height (multiplier), depth (dish depth) |
| Procedural cap | topWidth, topDepth, dishType, dishDepth, cornerRadius |
| Mesh-backed cap | format (glb/obj/stl), url, scale, rotationOffset, originOffset |

4 built-in profiles: Cherry (sculpted cylindrical), SA (tall sculpted spherical), DSA (uniform spherical), XDA (uniform wide).

### Legend Schema — `eletypes-legend/1`

Defines how key labels are rendered on keycap surfaces.

```
schema → meta → style → keyOverrides{}
```

| Field | Controls |
|-------|---------|
| `fontFamily` | CSS font stack |
| `fontSize` | Base size in px (8–40) |
| `fontWeight` | 400–800 |
| `color` | Legend text color |
| `position` | center, top-left, top-center, bottom-left, bottom-center |
| `uppercase` | Force single-char labels uppercase |
| `keyOverrides[id]` | Per-key label, color, fontSize, subLabel |

6 built-in presets: GMK (bold centered), Minimal (light), Retro (monospace), Top Print (top-left), Cyber (neon mono), Blank.

### Visual Schema — `eletypes-visual/1`

Defines colors, material hints, per-key overrides.

```
schema → meta → colors → case → material → keyOverrides{}
```

Colors by kind (alpha, accent, mod, fn), legend colors, case colors. Material hints (roughness, metalness, finish) for 3D only. Loosely typed — renderers may ignore.

### Shell Profile (lightweight, not a full schema)

Case geometry for 3D rendering. Per-shell: asymmetric padding, corner radius, height, tilt, plate specs. Cyberboard has thick bottom bezel.

---

## 2. Critical Architecture Decisions

### Multi-schema decoupling

```
Layout ←capRef→ Keycap
  ↓                ↓
  └────→ Normalization ←── Visual + Legend
              ↓
        Render Model (ephemeral, never persisted)
```

Each schema is independently shareable, importable, and editable. Changing profile doesn't touch layout. Changing colors doesn't touch either. Shell is optional — the 3D renderer has a default case.

### Normalization pipeline

```js
normalizeKeyboard(layout, keycapPreset, visualPreset) → NormalizedKeyboard
```

Resolves `capRef` → procedural geometry or mesh reference. Maps key Y position → profile row sculpt. Resolves colors by kind with per-key overrides. Output consumed by both 2D and 3D renderers. Computed at runtime, never stored.

### 3D rendering: InstancedMesh + demand mode

- **Single InstancedMesh** for all ~84 keycaps → 1 draw call
- **`frameloop="demand"`** → zero GPU cost at idle
- **Animation state in `Float32Array`** → zero React re-renders during keypress
- **`triggerKey()` is pure imperative** — mutates ref, calls `invalidate()`, no `setState`
- **Spring physics**: critically damped (stiffness=600, damping=50), ~80ms settle, no overshoot
- **Geometry**: procedural tapered keycap with dish, generated once per profile family

### Editor-first flat key objects

Keys are flat `{ id, keyName, label, x, y, w }` — not nested. This makes them:

- **Easy to edit**: `key.x += 0.25` (no `key.geometry.x`)
- **Easy to diff**: one-line JSON diff per change
- **Easy to undo/redo**: store/restore one object
- **Stable identity**: `key.id` survives position/size edits (selection state preserved)

Optional fields omitted when default — no noisy `h: 1, r: 0, kind: "alpha"` on every key.

### `capRef` as the only bridge

Layout keys reference keycaps abstractly via `capRef: "dragon-artisan"`. The layout schema never contains mesh paths, geometry parameters, or renderer-specific data. The keycap schema and normalization layer resolve the reference.

90% of keys don't need `capRef` — the profile family's row rules assign geometry automatically from key Y position. Only special keys (artisans, homing bars, novelties) need explicit references.

### Versioning: schema vs meta.version

- **`schema: "eletypes-kbd/1"`** — format version. Parsers branch on this. Changed only on breaking schema changes.
- **`meta.version: "1.0"`** — document revision. Changed by the user. No programmatic meaning.

### board.id — stable identity

`board.id` is a required stable identifier that survives edits. Used for linking presets, shell profiles, and future override systems. Different from `meta.name` which is a display string.

### `formFactor` vs `layoutStagger`

Separated from the original mixed `layoutType`:
- `formFactor`: physical size class (75%, 60%, TKL, Alice…)
- `layoutStagger`: key arrangement style (row-staggered, ortholinear, split…)

A 75% can be row-staggered or ortholinear. These are independent axes.

---

## 3. Functionality

### 3D Keyboard Visualization
- 75% ANSI layout with realistic row stagger, right nav column, arrow cluster
- 2 board presets: Generic 75% ANSI (84 keys), Cyberboard R2 (85 keys, different nav column)
- OrbitControls with constrained polar angles (can't clip below keyboard)
- Spring animation on key press (instant snap down, smooth spring return)
- Live typing bridge: DOM keydown → triggerKey() → 3D animation + label follows

### Sculpted Keycap Profiles
- Procedural geometry: tapered walls (top narrower than bottom), dish scooped into top surface
- Cherry: cylindrical dish, 15% taper, per-row height (R0=1.0, R3=0.88)
- SA: spherical dish, 22% taper, tall (height 0.52 vs Cherry 0.38)
- DSA: spherical dish, 20% taper, uniform (no row variation)
- XDA: spherical dish, 12% taper, wide flat top, uniform
- Real-time profile switching with geometry regeneration

### Keycap Opacity / Transparency
- Material supports real-time opacity (0.1–1.0)
- 9 color presets including translucent, pudding, jelly, frosted
- Opacity slider in editor

### Key Legends
- 3D-transformed HTML labels flat on keycap surface (drei `<Html transform>`)
- Labels follow key press animation (read Y offsets from KeyboardModel each frame)
- 6 legend style presets with live editing:
  - Font size slider (8–40)
  - Font weight selector (Light → Heavy)
  - Font family selector (8 system fonts)
  - Color picker
  - Uppercase toggle
- Per-key overrides via legend schema

### 2D Layout View
- Positioned DOM divs from same JSON as 3D renderer
- Click-to-select key inspector (shows all key properties)
- Color-coded by key kind
- JSON export / copy to clipboard

### Color System
- 9 color presets: midnight, ocean, sakura, forest, arctic, translucent, pudding, jelly, frosted
- Per-preset legend colors (dark legends on light caps, light on dark)
- Live color pickers: keycap, accent, case, legend
- Opacity slider

### Demo / Editor Controls
- Board preset switcher
- Keycap profile switcher
- Legend preset switcher + live style overrides
- View toggle (2D / 3D / Both)
- Programmatic key trigger ("Demo HELLO")
- Live typing on/off
- Individual key trigger buttons (Space, Enter, Esc, Backspace)

---

## 4. File Structure (30 files)

```
KeyboardLab/
├── schema/
│   ├── SCHEMA_SPEC.md                 ← Canonical V1 spec (TS types, JSON Schema, Zod, migration)
│   ├── KEYCAP_ARCHITECTURE.md         ← Multi-schema design rationale + product reasoning
│   ├── boardLayout.js                 ← createPreset(), validatePreset(), migrateFromDraft()
│   ├── shellProfile.js               ← DEFAULT_SHELL, CYBERBOARD_SHELL
│   ├── derive.js                      ← computeBounds, buildKeyIndex, extractKeys, buildCodeMap
│   ├── index.js                       ← Barrel export for all schema concerns
│   ├── types/
│   │   ├── layout.js                  ← Layout type constants + JSDoc typedefs
│   │   ├── keycap.js                  ← Keycap type constants + JSDoc typedefs
│   │   ├── visual.js                  ← Visual type constants + JSDoc typedefs
│   │   ├── legend.js                  ← Legend type constants + JSDoc typedefs
│   │   └── normalized.js             ← Normalized render model typedefs
│   ├── validation/
│   │   └── validate.js                ← Runtime validators for layout, keycap, visual
│   ├── normalize/
│   │   └── normalize.js               ← normalizeKeyboard() + extractRenderData()
│   └── examples/
│       ├── layout-75-ansi.json        ← Example layout document
│       ├── keycap-cherry.json         ← Procedural keycap preset
│       ├── keycap-mesh-artisan.json   ← Mesh-backed artisan caps
│       └── visual-botanical.json      ← GMK Botanical-inspired colorway
├── presets/
│   ├── index.js                       ← getPreset(), listPresets(), registerPreset()
│   ├── generic75.js                   ← Generic 75% ANSI (84 keys)
│   ├── cyberboard75.js               ← Cyberboard R2 (85 keys, different nav)
│   ├── keycaps.js                     ← Cherry, SA, DSA, XDA profile presets
│   └── legends.js                     ← GMK, Minimal, Retro, Top Print, Cyber, Blank
├── KeyboardLab.jsx                    ← Public API: Canvas + OrbitControls + lighting + env map
├── KeyboardModel.jsx                  ← InstancedMesh + spring animation + imperative triggerKey()
├── KeycapGeometry.js                  ← Procedural tapered/dished keycap shape generator
├── KeycapLabels.jsx                   ← 3D legend rendering (follows press animation)
├── KeyboardLayout2D.jsx              ← 2D DOM renderer + key inspector + JSON export
├── KeyboardLabDemo.jsx               ← Full integration demo with all controls
├── keyboardLayout.js                  ← Backwards compat shim (deprecated)
└── KEYBOARD_LAB.md                    ← This document
```

---

## 5. Performance Architecture

| Concern | Approach | Cost |
|---------|----------|------|
| Keycap rendering | Single InstancedMesh, 1 draw call | ~84 instances |
| Idle state | `frameloop="demand"` | Zero GPU frames |
| Key press animation | Float32Array refs, no React state | Zero re-renders |
| `triggerKey()` | O(1) Map lookup, ref mutation, invalidate() | ~0.01ms |
| Profile switch | New geometry + rebuild instances | One-time, ~5ms |
| Color change | instanceColor update + invalidate() | ~1ms |
| Legend rendering | drei `<Html transform>` per key | 84 DOM elements |
| Legend animation | useFrame reads offsets ref | Per-frame Y update |

---

## 6. Schema Interaction Model

```
User creates/edits layout        → eletypes-kbd/1 JSON
User picks keycap profile        → eletypes-cap/1 JSON
User customizes legend style     → eletypes-legend/1 JSON
User picks color theme           → eletypes-visual/1 JSON
                                        ↓
                              normalizeKeyboard()
                                        ↓
                              NormalizedKeyboard
                              (ephemeral, per-render)
                                        ↓
                         ┌──────────────┼──────────────┐
                         │              │              │
                     2D Editor     3D Renderer     JSON Export
```

### What's persisted vs ephemeral

| Persisted (in JSON) | Ephemeral (app state) |
|---------------------|-----------------------|
| Key positions, sizes, identities | Selection state, active keys |
| Board metadata | Camera position, zoom |
| Profile family + row rules | Animation offsets, velocities |
| Legend font/size/color | UI panel state |
| Visual colors, material hints | Normalized render model |

---

## 7. Future Roadmap

### Next priorities
- [ ] 2D editor: drag keys to reposition, resize handles
- [ ] TypeBox integration: triggerKey() on each keystroke during typing test
- [ ] Theme-aware defaults: inherit colors from Eletypes theme system
- [ ] More profiles: OEM, MT3, KAT, low-profile
- [ ] More board presets: 60%, 65%, TKL

### Medium-term
- [ ] Mesh-backed keycap import (GLB upload → register as cap → assign via capRef)
- [ ] Key legends via canvas texture atlas (replace Html for better performance)
- [ ] Per-key color painting in 2D editor
- [ ] Undo/redo stack for layout edits
- [ ] JSON import from file or URL

### Long-term
- [ ] Case/shell schema (eletypes-case/1)
- [ ] LED underglow from shell features
- [ ] Keycap marketplace / community sharing
- [ ] Preset variant/override system (base + delta)
- [ ] Sound simulation (switch type → click profile)
- [ ] Collaborative editing
