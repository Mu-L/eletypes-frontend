# Keyboard Lab — Data-Driven Keyboard Layout Platform

## Status: V1 Architecture (data model + preset system + 2D/3D renderers)

## Architecture

```
schema/
  boardLayout.js       → Schema definition + validation ("eletypes-board/1")
  shellProfile.js      → Shell identity layer + validation ("eletypes-shell/1")
  derive.js            → Pure runtime derivation (computeBounds, buildKeyIndex, etc.)

presets/
  generic75.js         → Generic 75% ANSI preset (84 keys)
  cyberboard75.js      → Cyberboard-inspired 75% (same keys, different shell)
  index.js             → Registry: getPreset(), listPresets(), registerPreset()

KeyboardLayout2D.jsx   → 2D DOM renderer (positioned divs, click-to-select, JSON export)
KeyboardModel.jsx      → 3D InstancedMesh renderer (spring animation, imperative API)
KeyboardLab.jsx         → 3D Canvas wrapper (lighting, controls, environment)
KeyboardLabDemo.jsx     → Integration demo (preset switcher, 2D+3D views, live typing)
keyboardLayout.js       → DEPRECATED backwards compat shim
```

## JSON Schema: "eletypes-board/1"

```json
{
  "schema": "eletypes-board/1",
  "id": "generic-75-ansi",
  "meta": {
    "name": "Generic 75% ANSI",
    "author": "eletypes",
    "layoutType": "75%",
    "standard": "ANSI"
  },
  "keys": [
    {
      "id": "KeyA",
      "label": "A",
      "x": 1.75,
      "y": 3.25,
      "w": 1,
      "h": 1,
      "kind": "alpha",
      "cluster": "alpha",
      "rotation": 0,
      "code": null
    }
  ]
}
```

### Shell Profile: "eletypes-shell/1"

```json
{
  "schema": "eletypes-shell/1",
  "id": "cyberboard-r3",
  "name": "Cyberboard R3",
  "compatibleLayouts": ["75%"],
  "case": {
    "paddingTop": 0.35,
    "paddingBottom": 1.0,
    "paddingLeft": 0.45,
    "paddingRight": 0.45,
    "cornerRadius": 0.12,
    "height": 0.3,
    "tilt": 0
  },
  "features": [
    { "type": "led-bar", "position": "bottom", "height": 0.15 }
  ]
}
```

## How the same data drives 2D and 3D

Both renderers consume the same `BoardLayout.keys` array:

- **2D renderer**: maps each key to a positioned `<div>` via `left: key.x * scale`, `top: key.y * scale`
- **3D renderer**: maps each key to an InstancedMesh instance via `position.set(key.x - center, height, key.y - center)`

The shell profile is only consumed by the 3D renderer (for case dimensions). The 2D renderer ignores it.

The `derive.js` functions are shared: both renderers can call `computeBounds()`, `buildKeyIndex()`, etc.

## What should come next

### Editing
- [ ] Drag keys to reposition (update x/y in layout state)
- [ ] Resize handles on keys (update w/h)
- [ ] Property editor panel for selected key (edit label, kind, cluster)
- [ ] Add/remove keys
- [ ] Undo/redo stack

### Sharing
- [ ] Import layout from JSON file or pasted text
- [ ] Shareable URL encoding (compact base64 of layout JSON)
- [ ] Community preset gallery (Supabase table)

### More presets
- [ ] 60% ANSI
- [ ] 65% ANSI
- [ ] TKL ANSI
- [ ] ISO variants
- [ ] Split keyboards (Ergodox-style)

### 3D enhancements
- [ ] Key legends (texture atlas or SDF text)
- [ ] Per-row keycap profile sculpting
- [ ] Keycap dish (concave top surface)
- [ ] LED underglow from shell features
- [ ] Switch type visualization
