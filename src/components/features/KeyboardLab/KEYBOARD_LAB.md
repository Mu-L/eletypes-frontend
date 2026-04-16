# Keyboard Lab — Data-Driven 3D Keyboard Design Platform

## Status: Feature Branch (`feat/keyboard-lab`) — 19 commits

---

## 1. Schemas (6 Layers)

### Persisted Asset Schemas
| Schema | Version | Purpose |
|--------|---------|---------|
| `eletypes-kbd/1` | Stable | Layout: board metadata, key placement, identity |
| `eletypes-cap/1` | Stable | Keycap: profile families, row sculpting, procedural + mesh caps |
| `eletypes-legend/1` | Stable | Legend: font, size, weight, color, position, per-key overrides |
| `eletypes-visual/1` | Stable | Visual: colors, materials, per-key color overrides |
| `eletypes-shell/1` | Stable | Shell: case geometry, profile points, mount surface |
| `eletypes-design/1` | Stable | Composition: asset refs + overrides (primary user artifact) |

### Runtime Layer
| Model | Purpose |
|-------|---------|
| `NormalizedKeyboard` | Ephemeral render model, never persisted |

---

## 2. Architecture

### Multi-Schema Composition
```
Design Document (eletypes-design/1)
  ├─ assets.layout  → "layout/generic-75-ansi@1"
  ├─ assets.keycap  → "keycap/cherry-classic@1"
  ├─ assets.legend  → "legend/gmk-center@1"
  ├─ assets.visual  → "visual/botanical-dark@1"
  ├─ assets.shell   → "shell/cyberboard-r3@1"
  └─ overrides      → per-key, visual, legend tweaks
         ↓
  Asset Resolver (bundled/local/remote)
         ↓
  Normalization Pipeline
         ↓
  NormalizedKeyboard → 2D Editor / 3D Renderer / JSON Export
```

### Asset Reference Convention
```
{schema-type}/{asset-id}@{version}
e.g., "layout/generic-75-ansi@1", "keycap/artisan-dragon@1"
```

### Key Design Decisions
- **Flat key objects** — easy to edit, diff, undo/redo
- **capRef as abstract bridge** — layout never contains mesh paths or geometry
- **Design doc is the product** — users save/share/remix designs, not individual schemas
- **3D Text legends inside KeyboardModel** — direct access to `restPositions`, no sync issues
- **frameloop="demand"** — zero GPU cost at idle
- **InstancedMesh** — 1 draw call for ~84 keycaps

---

## 3. Features

### 3D Keyboard Visualization
- 75% ANSI layout with realistic row stagger, right nav column, arrow cluster
- 2 board presets: Generic 75% ANSI, Cyberboard R2 Layout
- OrbitControls with zoom range 4–35
- Spring animation on key press (critically damped, ~80ms settle)
- Live typing bridge (DOM keydown → triggerKey → 3D animation)

### Parametric Case Editor
- **2D profile editor**: SVG cross-section editor with draggable control points
- **4 presets**: Flat Box, Cyberboard Wedge, Chamfered Wedge, Ergonomic
- **Profile → 3D extrusion**: 2D profile extruded into 3D case geometry
- **Mount surface**: keys auto-mount on the defined slope with correct tilt angle
- **Per-vertex depth offset**: create chamfers/ramps via depth slider
- **Transform operations**: Mirror H/V, Scale Taller/Shorter
- **3-axis mount offset**: X (red), Y (green), Z (blue) sliders to position key field
- **Fit ratio**: controls how much of the mount edge keys occupy
- **Case scale**: overall case size multiplier
- **Extrusion width**: case width multiplier
- **Responsive SVG**: scales to container width
- **Click-to-select**: select a point, edit depth, remove — no hover dependency

### Sculpted Keycap Profiles
- 4 profiles: Cherry (sculpted cylindrical), SA (tall spherical), DSA (uniform), XDA (wide)
- Procedural geometry: tapered walls, per-profile dish shape/depth
- Per-row height variation from profile sculpting data
- Opacity/transparency support (9 color presets including translucent, pudding, jelly, frosted)

### Key Legends (3D Text)
- Troika SDF text rendered inside KeyboardModel (direct access to rest positions)
- Labels positioned on keycap top surface, tilted with mount surface angle
- Follow key press animation
- 6 legend presets: GMK, Minimal, Retro, Top Print, Cyber, Blank
- Live editing: font size, weight, family, color, uppercase toggle

### 2D Layout Editor
- Positioned DOM divs from same JSON as 3D
- Click-to-select key inspector
- Color-coded by key kind
- JSON export/copy
- Responsive scale from container width

### Workspace Layout
- **3D viewport** (left, resizable) + **sidebar** (right, resizable via drag handle)
- **Tabbed editor panel**: Case Profile / 2D Layout (share the same space)
- **Asset selectors**: layout, shell, keycap, legend, color (all as dropdowns)
- **Controls row**: legend (size/weight/font/color/uppercase) + material (opacity, colors)
- **Tabbed Monaco JSON editor**: Design | Layout | Keycap | Legend | Shell tabs
- **Bidirectional JSON editing**: change JSON → UI updates, change UI → JSON updates
- **Toolbar**: design name, save/load/export/import, demo trigger, live typing toggle
- **Viewport constrained**: fits within viewport height, no page scroll

### Design Persistence
- Save/load designs to localStorage
- Export as JSON file
- Import from JSON file
- Stable design ID (no mutation during live typing)

---

## 4. File Structure (35 files)

```
KeyboardLab/
├── schema/
│   ├── SCHEMA_SPEC.md                 ← Canonical V1 spec
│   ├── KEYCAP_ARCHITECTURE.md         ← Multi-schema design rationale
│   ├── boardLayout.js                 ← createPreset(), validatePreset(), migrateFromDraft()
│   ├── shellProfile.js               ← DEFAULT_SHELL, CYBERBOARD_SHELL (eletypes-shell/1)
│   ├── derive.js                      ← computeBounds, buildKeyIndex, extractKeys, etc.
│   ├── index.js                       ← Barrel export
│   ├── types/
│   │   ├── layout.js, keycap.js, visual.js, legend.js, shell.js, design.js, normalized.js
│   ├── validation/
│   │   └── validate.js                ← validateLayout, validateKeycap, validateVisual,
│   │                                     validateShell, validateDesign
│   ├── normalize/
│   │   ├── normalize.js               ← normalizeKeyboard()
│   │   └── resolveDesign.js           ← resolveDesign(), designFromSelections()
│   ├── resolve/
│   │   └── assetResolver.js           ← bundledResolver, listBundledAssets, parseAssetRef
│   └── examples/
│       ├── layout-75-ansi.json, keycap-cherry.json, keycap-mesh-artisan.json, visual-botanical.json
├── presets/
│   ├── index.js, generic75.js, cyberboard75.js, keycaps.js, legends.js
├── CaseEditor/
│   ├── CaseProfileEditor.jsx          ← SVG 2D profile editor
│   └── extrudeProfile.js             ← 2D→3D extrusion + mount surface computation
├── services/
│   └── designStorage.js              ← save/load/list/delete/export/import
├── KeyboardLab.jsx                    ← Canvas wrapper, controls, lighting
├── KeyboardModel.jsx                  ← InstancedMesh + spring animation + legends (3D Text)
├── KeycapGeometry.js                  ← Procedural tapered/dished keycap generator
├── KeycapLabels.jsx                   ← Standalone label component (unused, kept for reference)
├── KeyboardLayout2D.jsx              ← 2D DOM renderer + key inspector + JSON export
├── KeyboardLabDemo.jsx               ← Full workspace: toolbar + 3D + sidebar + editors
├── keyboardLayout.js                  ← Backwards compat shim (deprecated)
├── KEYBOARD_LAB.md                    ← This document
└── PLATFORM_SPEC.md                   ← Open-source platform architecture spec
```

---

## 5. Roadmap

### Completed (this branch)
- [x] 3D keyboard visualization with InstancedMesh
- [x] Layout schema (eletypes-kbd/1)
- [x] Keycap schema (eletypes-cap/1) with 4 profiles
- [x] Legend schema (eletypes-legend/1) with 6 presets
- [x] Visual schema (eletypes-visual/1)
- [x] Shell schema (eletypes-shell/1)
- [x] Design composition schema (eletypes-design/1)
- [x] Asset resolver with bundled registry
- [x] Parametric case editor with 2D profile → 3D extrusion
- [x] Mount surface with key auto-placement and tilt
- [x] 3-axis mount offset + fit ratio + case scale + extrude width
- [x] Sculpted keycap profiles (Cherry, SA, DSA, XDA)
- [x] 3D Text legends following keycap positions and tilt
- [x] Workspace layout with resizable sidebar
- [x] Tabbed Monaco JSON editor (5 tabs, bidirectional)
- [x] Local persistence (save/load/export/import designs)
- [x] Spring key press animation
- [x] Keycap opacity/transparency

### Next priorities
- [ ] 2D editor: drag keys to reposition
- [ ] TypeBox integration: triggerKey on each keystroke
- [ ] Theme-aware defaults from Eletypes theme system
- [ ] More profiles: OEM, MT3, KAT, low-profile
- [ ] More layouts: 60%, 65%, TKL, ISO variants
- [ ] Package extraction: @eletypes/keyboard-schema, @eletypes/keyboard-assets

### Long-term
- [ ] Mesh-backed keycap import (GLB)
- [ ] Community asset registry
- [ ] KLE import converter
- [ ] Collaborative editing
- [ ] LED underglow visualization
