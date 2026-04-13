# Keyboard Lab — 3D Keyboard Visualization (V0)

## Status: Prototype (V0)

Interactive 3D keyboard visualization for Eletypes, built with @react-three/fiber + @react-three/drei.

## Architecture

```
KeyboardLab.jsx          → Public API, Canvas wrapper, controls, lighting
  └─ KeyboardModel.jsx   → InstancedMesh rendering, spring animation, imperative API
keyboardLayout.js        → Pure data: 75% ANSI layout, explicit per-key coordinates
KeyboardLabDemo.jsx      → Integration demo: color presets, live typing bridge, trigger buttons
```

### Key design decisions

- **Decoupled from typing logic**: the 3D layer has zero keyboard/input event listeners. The parent calls `triggerKey(keyName)` imperatively.
- **Zero React re-renders on keypress**: `triggerKey()` mutates Float32Array refs + calls `invalidate()`. No `setState` in the press→animate→settle path.
- **Single InstancedMesh**: ~84 keycaps in 1 draw call. Per-instance color for accent vs regular keys.
- **frameloop="demand"**: GPU idle when nothing animates. Only wakes for key presses and orbit control interaction.

### Component API

```jsx
const ref = useRef();

<KeyboardLab
  ref={ref}
  keycapColor="#2a2a2e"
  accentKeyColor="#3d3d42"
  caseColor="#1a1a1e"
/>

// Trigger from any input source:
ref.current.triggerKey("KeyA");    // KeyboardEvent.code
ref.current.triggerKey("Space");   // Named key
ref.current.triggerKey("A");       // Label shorthand
```

### Key name mapping

Accepts `KeyboardEvent.code` (e.g., `KeyA`, `ShiftLeft`, `ArrowUp`), layout names (`Space`, `Enter`, `Backspace`), or label shorthands (`A`, `1`, `Esc`).

## Layout: 75% ANSI (84 keys)

Based on Keychron Q1 / GMMK Pro form factor.

- Main block: 15u wide (standard ANSI row widths)
- Right column: Del, PgUp, PgDn, Home, End at x=15.5
- Arrow cluster: ↑ at row 4, ←↓→ at row 5 (↓ aligned under ↑)
- F-row: grouped F1-F4, F5-F8, F9-F12 with gaps, separated from number row by 0.25u
- Row stagger: standard ANSI (from modifier key widths)

Key kinds: `alpha`, `mod`, `accent`, `fn`, `nav`, `arrow`

## Animation

- Two-phase spring: instant snap to press depth (0.18u), then critically damped spring return
- STIFFNESS=600, DAMPING=50 (~80ms settle, no overshoot)
- State: two Float32Arrays (offsets, velocities) + Set of active indices
- Hot path: only iterates active keys, pre-allocated matrix objects, zero GC

## Dependencies

- `three@0.160.0`
- `@react-three/fiber@8.15.19` (React 18 compatible)
- `@react-three/drei@9.88.17` (React 18 compatible)
- `three-stdlib` (for RoundedBoxGeometry, bundled with drei)

## What's next (V1 priorities)

### Must-have
- [ ] Key legends (2D text on keycap surfaces via texture atlas or SDF)
- [ ] Integration with TypeBox (triggerKey on each keystroke during typing test)
- [ ] Theme-aware colors (inherit from Eletypes theme system)

### Should-have
- [ ] Key profile sculpt (per-row height variation — Cherry/SA profile simulation)
- [ ] Keycap top dish (concave surface, not flat)
- [ ] Subtle pressed-key color flash (brief highlight on press)
- [ ] Sound integration (map typing sounds to 3D key position for spatial feel)

### Nice-to-have
- [ ] Custom keycap colorway presets (GMK-inspired themes)
- [ ] Switch type visualization (different spring constants per switch type)
- [ ] Keyboard tilt angle control
- [ ] Export keyboard config as shareable image
- [ ] LED underglow effect

### Known limitations (V0)
- F-row gap sizing is approximate (varies between real manufacturers)
- Key legends not rendered — structure-first approach
- All keys flat-topped (no per-row profile sculpting)
- Right column key labels match Keychron Q1 but vary on other boards
- No key labels in 3D — would need texture atlas or SDF text rendering
