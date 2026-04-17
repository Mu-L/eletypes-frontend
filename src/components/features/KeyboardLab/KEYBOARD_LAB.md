# Keyboard Lab — Data-Driven 3D Keyboard Design Platform

## Status: Feature Branch (`feat/keyboard-lab`)

---

## 1. Schemas (7 Layers)

### Persisted Asset Schemas
| Schema | Version | Purpose |
|--------|---------|---------|
| `eletypes-kbd/1` | Stable | Layout: board metadata, key placement, identity |
| `eletypes-cap/1` | Stable | Keycap: profile families, row sculpting, procedural + mesh caps |
| `eletypes-legend/1` | Stable | Legend: font, size, weight, color, position, per-key overrides |
| `eletypes-visual/1` | Stable | Visual: colors, materials, per-key color overrides |
| `eletypes-shell/1` | Stable | Shell: case geometry, profile points, mount surface |
| `eletypes-caseProfile/1` | Stable | Case profile: 2D cross-section, mount settings, colored edges |
| `eletypes-design/1` | Stable | Composition: asset refs + overrides (orchestrator doc) |

### Persistence Layer
| Format | Purpose |
|--------|---------|
| `eletypes-design-bundle/1` | Local save/import-export bundle (design doc + embedded assets) |

### Runtime Layer
| Model | Purpose |
|-------|---------|
| `NormalizedKeyboard` | Ephemeral render model, never persisted |

---

## 2. Architecture

### Design Bundle (Local Persistence)
```
eletypes-design-bundle/1
  ├─ schema: "eletypes-design-bundle/1"
  ├─ savedAt
  ├─ design (orchestrator)
  │   ├─ refs.layout       → "layout/cyberboard-75-ansi@1"
  │   ├─ refs.keycap       → "keycap/cherry-classic@1"
  │   ├─ refs.legend       → "legend/gmk-center@1"
  │   ├─ refs.shell        → "shell/generic-75@1"
  │   ├─ refs.caseProfile  → "caseProfile/cyberboard-wedge@1"
  │   └─ overrides         → visual, opacity, legend, per-key
  └─ embeddedAssets (full resolved docs)
      ├─ layout, keycap, legend, shell, caseProfile
```

### Composition Pipeline
```
Design Document (eletypes-design/1)
  ├─ refs.layout       → "layout/cyberboard-75-ansi@1"
  ├─ refs.keycap       → "keycap/cherry-classic@1"
  ├─ refs.legend       → "legend/gmk-center@1"
  ├─ refs.shell        → "shell/generic-75@1"
  ├─ refs.caseProfile  → "caseProfile/cyberboard-wedge@1"
  └─ overrides         → visual, opacity, legend tweaks
         ↓
  Asset Resolver (bundled → local/embedded → remote)
         ↓
  Normalization Pipeline
         ↓
  NormalizedKeyboard → 2D Editor / 3D Renderer / JSON Export
```

### Asset Reference Convention
```
{schema-type}/{asset-id}@{version}
e.g., "layout/cyberboard-75-ansi@1", "caseProfile/cyberboard-wedge@1"
```

### Key Design Decisions
- **`design.refs`** — asset references are strings, not objects; "refs" not "assets"
- **`overrides.opacity`** — sibling of `overrides.visual`, not nested inside it
- **`caseProfile`** — not "profile" (avoids collision with keycap profile concept)
- **Flat key objects** — easy to edit, diff, undo/redo
- **capRef as abstract bridge** — layout never contains mesh paths or geometry
- **Design bundle is the save format** — wraps design doc + embedded assets for offline/portable use
- **Design doc is the share format** — refs only, no embedded blobs (future publish/share)
- **3D Text legends inside KeyboardModel** — direct access to `restPositions`, no sync issues
- **frameloop="demand"** — zero GPU cost at idle
- **Split InstancedMesh** — regular + accent keycaps as separate meshes for independent opacity

---

## 3. Features

### 3D Keyboard Visualization
- 75% ANSI layouts: Generic 75%, Cyberboard R2 75%
- OrbitControls with zoom range 4–35
- Spring animation on key press (critically damped, ~80ms settle)
- Live typing bridge (DOM keydown → triggerKey → 3D animation)

### Per-Group Opacity
- 4 independent opacity controls: keycap, accent, case, legend
- Split InstancedMesh (regular + accent) for independent transparency
- Transparency only enabled when opacity < 1.0 (prevents z-fighting flicker)

### Parametric Case Editor
- **2D profile editor**: SVG cross-section with draggable control points
- **4 presets** (via asset refs): Cyberboard Wedge, Flat Box, Chamfered Wedge, Ergonomic
- **Profile → 3D extrusion**: 2D profile extruded symmetrically into 3D case geometry
- **Mount surface**: click any edge to set mount; keys auto-place with correct tilt angle
- **Colored edge accents**: per-edge color with emissive glow (LED strip effect)
- **Per-vertex inset**: narrow case width at specific vertices for chamfers/bevels
- **Mount controls**: 3-axis offset, fit ratio, case scale
- **Extrusion width**: text input with 1% precision, labeled "symmetric ←→"
- **Points table**: always-visible inline list with inset values per point
- **Edge accents table**: always-visible color pickers per edge

### Sculpted Keycap Profiles
- 4 profiles: Cherry (sculpted cylindrical), SA (tall spherical), DSA (uniform), XDA (wide)
- Procedural geometry: tapered walls, per-profile dish shape/depth
- Per-row height variation from profile sculpting data

### Key Legends (3D Text)
- Troika SDF text rendered inside KeyboardModel
- Labels positioned on keycap top surface, tilted with mount surface angle
- Follow key press animation with fillOpacity for legend transparency
- 6 legend presets: GMK, Minimal, Retro, Top Print, Cyber, Blank
- Live editing: font size, weight, family, color

### 2D Layout Editor
- Positioned DOM divs from same JSON as 3D
- Click-to-select key inspector
- Color-coded by key kind
- JSON export/copy
- Responsive scale from container width

### Workspace Layout
- **3D viewport** (left, resizable) + **sidebar** (right, resizable via drag handle)
- **Toolbar**: New, Save, Saved dropdown, Reload, Delete, Export, Import, Demo, Live typing
- **Assets row**: labeled dropdowns — Layout, Shell, Keycap, Legend, Profile, Theme
- **Legend row**: labeled — Size, Weight, Font, Color
- **Colors row**: labeled — Keycap/Accent/Case (color + opacity), Label (opacity)
- **Tabbed editor panel**: Case Profile / 2D Layout
- **Tabbed Monaco JSON editor**: Design | Layout | Keycap | Legend | Shell | Case Profile
- **Bidirectional sync**: Monaco imperatively synced with all UI state changes
- **Viewport constrained**: fits within viewport height, no page scroll

### Design Persistence
- **Bundle format**: `eletypes-design-bundle/1` wraps design doc + all embedded assets
- **Save/Load**: full bundles to/from localStorage
- **Reload**: restore last saved state, discard unsaved changes
- **Export/Import**: JSON files in bundle format
- **Read-time migration**: auto-upgrades legacy formats (v0a raw doc, v0b intermediate)
- **Default theme**: "le smoking" (dark keycaps, purple case, green legends)

### Color Themes
9 presets: le smoking, midnight, ocean, sakura, forest, arctic, translucent, pudding, jelly, frosted

---

## 4. File Structure

```
KeyboardLab/
├── schema/
│   ├── SCHEMA_SPEC.md                 ← Canonical V1 spec
│   ├── KEYCAP_ARCHITECTURE.md         ← Multi-schema design rationale
│   ├── boardLayout.js                 ← createPreset(), validatePreset()
│   ├── shellProfile.js               ← DEFAULT_SHELL (eletypes-shell/1)
│   ├── derive.js                      ← computeBounds, buildKeyIndex, extractKeys
│   ├── index.js                       ← Barrel export
│   ├── types/
│   │   ├── layout.js                  ← eletypes-kbd/1
│   │   ├── keycap.js                  ← eletypes-cap/1
│   │   ├── visual.js                  ← eletypes-visual/1
│   │   ├── legend.js                  ← eletypes-legend/1
│   │   ├── shell.js                   ← eletypes-shell/1
│   │   ├── design.js                  ← eletypes-design/1 + eletypes-design-bundle/1
│   │   ├── profile.js                 ← eletypes-caseProfile/1
│   │   └── normalized.js
│   ├── validation/
│   │   └── validate.js
│   ├── normalize/
│   │   ├── normalize.js               ← normalizeKeyboard()
│   │   └── resolveDesign.js           ← resolveDesign(), designFromSelections()
│   ├── resolve/
│   │   └── assetResolver.js           ← bundledResolver, listBundledAssets, parseAssetRef
│   └── examples/
│       ├── layout-75-ansi.json, keycap-cherry.json, etc.
├── presets/
│   ├── index.js, generic75.js, cyberboard75.js
│   ├── keycaps.js                     ← Cherry, SA, DSA, XDA profiles
│   ├── legends.js                     ← GMK, Minimal, Retro, Top Print, Cyber, Blank
│   └── profiles.js                    ← Cyberboard Wedge, Flat Box, Chamfered Wedge, Ergonomic
├── CaseEditor/
│   ├── CaseProfileEditor.jsx          ← SVG 2D profile editor + edge accents
│   └── extrudeProfile.js             ← 2D→3D extrusion + mount surface + edge strips
├── services/
│   └── designStorage.js              ← eletypes-design-bundle/1 persistence + migration
├── KeyboardLab.jsx                    ← Canvas wrapper, controls, lighting
├── KeyboardModel.jsx                  ← Split InstancedMesh + animation + legends + edge strips
├── KeycapGeometry.js                  ← Procedural tapered/dished keycap generator
├── KeyboardLayout2D.jsx              ← 2D DOM renderer + key inspector
├── KeyboardLabDemo.jsx               ← Full workspace: toolbar + 3D + sidebar + editors
├── KEYBOARD_LAB.md                    ← This document
└── PLATFORM_SPEC.md                   ← Open-source platform architecture spec
```

---

## 5. Roadmap

### Completed (this branch)
- [x] 3D keyboard visualization with InstancedMesh
- [x] Layout schema (eletypes-kbd/1), 2 layouts (Generic 75%, Cyberboard R2 75%)
- [x] Keycap schema (eletypes-cap/1) with 4 profiles
- [x] Legend schema (eletypes-legend/1) with 6 presets
- [x] Visual schema (eletypes-visual/1)
- [x] Shell schema (eletypes-shell/1)
- [x] Case profile schema (eletypes-caseProfile/1) with 4 presets + colored edges
- [x] Design composition schema (eletypes-design/1) with refs + overrides
- [x] Design bundle schema (eletypes-design-bundle/1) for local persistence
- [x] Asset resolver with bundled registry
- [x] Parametric case editor with 2D profile → 3D extrusion
- [x] Mount surface with key auto-placement and tilt
- [x] Colored edge accent strips (emissive LED-style)
- [x] Sculpted keycap profiles (Cherry, SA, DSA, XDA)
- [x] 3D Text legends following keycap positions and tilt
- [x] Per-group opacity (keycap, accent, case, legend)
- [x] Workspace layout with labeled UI, resizable sidebar
- [x] Tabbed Monaco JSON editor (6 tabs, bidirectional, imperatively synced)
- [x] Local persistence with bundle format + read-time migration
- [x] Toolbar: New, Save, Saved, Reload, Delete, Export, Import
- [x] Spring key press animation
- [x] "Le smoking" default theme

### Next priorities
- [ ] 2D editor: drag keys to reposition
- [ ] TypeBox integration: triggerKey on each keystroke
- [ ] Online storage: upload/download designs (platform)
- [ ] More profiles: OEM, MT3, KAT, low-profile
- [ ] More layouts: 60%, 65%, TKL, ISO variants
- [ ] Package extraction: @eletypes/keyboard-schema, @eletypes/keyboard-assets

### Long-term
- [ ] Mesh-backed keycap import (GLB)
- [ ] Community asset registry
- [ ] KLE import converter
- [ ] Design sharing (shareable URLs, OG preview images)
- [ ] Collaborative editing
- [ ] LED underglow visualization
