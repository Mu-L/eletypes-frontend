/**
 * 75% ANSI keyboard layout — explicit per-key positioning.
 *
 * Reference: Keychron Q1 / GMMK Pro style 75% layout.
 *
 * Coordinate system:
 *   x: horizontal position in key-units (1u = standard key width)
 *   y: vertical position in key-units (rows flow top→bottom, 0 = top)
 *   w: key width in key-units (default 1)
 *   h: key height in key-units (default 1)
 *
 * Layout structure:
 *   - Main typing block: 15u wide (rows 1–5, standard ANSI widths)
 *   - Function row: 13u of F-keys with grouped gaps, aligned left with main block
 *   - Right column: 1u nav keys at x=15.5 (0.5u gap from main block)
 *   - Arrow cluster: integrated into rows 4–5, aligned with right column
 *   - F-row to number row: 0.25u extra vertical gap
 *
 * Row stagger (built into modifier widths, matching real ANSI):
 *   Row 1 (numbers): reference — leftmost key at x=0
 *   Row 2 (QWERTY):  Tab=1.5u  → Q starts at x=1.5  (0.25u stagger)
 *   Row 3 (home):    Caps=1.75u → A starts at x=1.75 (0.5u total stagger)
 *   Row 4 (shift):   LShift=2.25u → Z starts at x=2.25 (0.75u total stagger)
 *
 * Key kinds:
 *   "alpha"    — standard letter/number/symbol keys
 *   "mod"      — modifiers (shift, ctrl, alt, etc.)
 *   "accent"   — large/special keys (enter, space, backspace, esc)
 *   "fn"       — function row keys
 *   "nav"      — right column navigation keys
 *   "arrow"    — arrow cluster keys
 */

// ─── Right column x position ───
// 0.5u gap from main block end (15u) to right column
const RC = 15.5;

// ─── Row Y positions ───
// 0.25u extra gap between F-row and number row
const R0 = 0;       // Function row
const R1 = 1.25;    // Number row (0.25u gap after F-row)
const R2 = 2.25;    // QWERTY row
const R3 = 3.25;    // Home row
const R4 = 4.25;    // Shift row
const R5 = 5.25;    // Bottom row

// ─── Layout definition ───
// Every key is explicit: { name, label, x, y, w, h, kind }
// No implicit positioning — what you see is what renders.

export const KEYBOARD_LAYOUT = [

  // ═══════════════════════════════════════════════
  // Row 0: Function row
  // Esc + grouped F-keys with 0.5u/0.25u gaps
  // ═══════════════════════════════════════════════

  { name: "Escape",  label: "Esc",  x: 0,     y: R0, w: 1,  kind: "accent" },

  // F1–F4 group (0.5u gap after Esc)
  { name: "F1",      label: "F1",   x: 1.5,   y: R0, w: 1,  kind: "fn" },
  { name: "F2",      label: "F2",   x: 2.5,   y: R0, w: 1,  kind: "fn" },
  { name: "F3",      label: "F3",   x: 3.5,   y: R0, w: 1,  kind: "fn" },
  { name: "F4",      label: "F4",   x: 4.5,   y: R0, w: 1,  kind: "fn" },

  // F5–F8 group (0.25u gap)
  { name: "F5",      label: "F5",   x: 5.75,  y: R0, w: 1,  kind: "fn" },
  { name: "F6",      label: "F6",   x: 6.75,  y: R0, w: 1,  kind: "fn" },
  { name: "F7",      label: "F7",   x: 7.75,  y: R0, w: 1,  kind: "fn" },
  { name: "F8",      label: "F8",   x: 8.75,  y: R0, w: 1,  kind: "fn" },

  // F9–F12 group (0.25u gap)
  { name: "F9",      label: "F9",   x: 10,    y: R0, w: 1,  kind: "fn" },
  { name: "F10",     label: "F10",  x: 11,    y: R0, w: 1,  kind: "fn" },
  { name: "F11",     label: "F11",  x: 12,    y: R0, w: 1,  kind: "fn" },
  { name: "F12",     label: "F12",  x: 13,    y: R0, w: 1,  kind: "fn" },

  // Right column
  { name: "Delete",  label: "Del",  x: RC,    y: R0, w: 1,  kind: "nav" },

  // ═══════════════════════════════════════════════
  // Row 1: Number row (15u)
  // ` 1 2 3 4 5 6 7 8 9 0 - = Backspace(2u) | PgUp
  // ═══════════════════════════════════════════════

  { name: "Backquote",  label: "`",    x: 0,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit1",     label: "1",    x: 1,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit2",     label: "2",    x: 2,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit3",     label: "3",    x: 3,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit4",     label: "4",    x: 4,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit5",     label: "5",    x: 5,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit6",     label: "6",    x: 6,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit7",     label: "7",    x: 7,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit8",     label: "8",    x: 8,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit9",     label: "9",    x: 9,    y: R1, w: 1,    kind: "alpha" },
  { name: "Digit0",     label: "0",    x: 10,   y: R1, w: 1,    kind: "alpha" },
  { name: "Minus",      label: "-",    x: 11,   y: R1, w: 1,    kind: "alpha" },
  { name: "Equal",      label: "=",    x: 12,   y: R1, w: 1,    kind: "alpha" },
  { name: "Backspace",  label: "Bksp", x: 13,   y: R1, w: 2,    kind: "accent" },

  // Right column
  { name: "PageUp",     label: "PgUp", x: RC,   y: R1, w: 1,    kind: "nav" },

  // ═══════════════════════════════════════════════
  // Row 2: QWERTY row (15u)
  // Tab(1.5) Q W E R T Y U I O P [ ] \(1.5) | PgDn
  // Stagger: Q at x=1.5 (0.25u right of "1")
  // ═══════════════════════════════════════════════

  { name: "Tab",           label: "Tab",  x: 0,     y: R2, w: 1.5,  kind: "accent" },
  { name: "KeyQ",          label: "Q",    x: 1.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyW",          label: "W",    x: 2.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyE",          label: "E",    x: 3.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyR",          label: "R",    x: 4.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyT",          label: "T",    x: 5.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyY",          label: "Y",    x: 6.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyU",          label: "U",    x: 7.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyI",          label: "I",    x: 8.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyO",          label: "O",    x: 9.5,   y: R2, w: 1,    kind: "alpha" },
  { name: "KeyP",          label: "P",    x: 10.5,  y: R2, w: 1,    kind: "alpha" },
  { name: "BracketLeft",   label: "[",    x: 11.5,  y: R2, w: 1,    kind: "alpha" },
  { name: "BracketRight",  label: "]",    x: 12.5,  y: R2, w: 1,    kind: "alpha" },
  { name: "Backslash",     label: "\\",   x: 13.5,  y: R2, w: 1.5,  kind: "alpha" },

  // Right column
  { name: "PageDown",      label: "PgDn", x: RC,    y: R2, w: 1,    kind: "nav" },

  // ═══════════════════════════════════════════════
  // Row 3: Home row (15u)
  // Caps(1.75) A S D F G H J K L ; ' Enter(2.25) | Home
  // Stagger: A at x=1.75 (0.5u right of "1")
  // ═══════════════════════════════════════════════

  { name: "CapsLock",   label: "Caps",   x: 0,      y: R3, w: 1.75,  kind: "accent" },
  { name: "KeyA",       label: "A",      x: 1.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyS",       label: "S",      x: 2.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyD",       label: "D",      x: 3.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyF",       label: "F",      x: 4.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyG",       label: "G",      x: 5.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyH",       label: "H",      x: 6.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyJ",       label: "J",      x: 7.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyK",       label: "K",      x: 8.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "KeyL",       label: "L",      x: 9.75,   y: R3, w: 1,     kind: "alpha" },
  { name: "Semicolon",  label: ";",      x: 10.75,  y: R3, w: 1,     kind: "alpha" },
  { name: "Quote",      label: "'",      x: 11.75,  y: R3, w: 1,     kind: "alpha" },
  { name: "Enter",      label: "Enter",  x: 12.75,  y: R3, w: 2.25,  kind: "accent" },

  // Right column
  { name: "Home",       label: "Home",   x: RC,     y: R3, w: 1,     kind: "nav" },

  // ═══════════════════════════════════════════════
  // Row 4: Shift row
  // LShift(2.25) Z-/(10×1) RShift(1.75) | ↑ | End
  // Stagger: Z at x=2.25 (0.75u right of "1")
  // RShift compressed from 2.75→1.75 to fit arrow up
  // ═══════════════════════════════════════════════

  { name: "ShiftLeft",   label: "Shift",  x: 0,      y: R4, w: 2.25,  kind: "accent" },
  { name: "KeyZ",        label: "Z",      x: 2.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyX",        label: "X",      x: 3.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyC",        label: "C",      x: 4.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyV",        label: "V",      x: 5.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyB",        label: "B",      x: 6.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyN",        label: "N",      x: 7.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "KeyM",        label: "M",      x: 8.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "Comma",       label: ",",      x: 9.25,   y: R4, w: 1,     kind: "alpha" },
  { name: "Period",      label: ".",      x: 10.25,  y: R4, w: 1,     kind: "alpha" },
  { name: "Slash",       label: "/",      x: 11.25,  y: R4, w: 1,     kind: "alpha" },
  { name: "ShiftRight",  label: "Shift",  x: 12.25,  y: R4, w: 1.75,  kind: "accent" },

  // Arrow up — aligned so ↓ below is centered
  { name: "ArrowUp",     label: "↑",      x: 14.25,  y: R4, w: 1,     kind: "arrow" },

  // Right column
  { name: "End",         label: "End",    x: RC,     y: R4, w: 1,     kind: "nav" },

  // ═══════════════════════════════════════════════
  // Row 5: Bottom row
  // LCtrl(1.25) Win(1.25) LAlt(1.25) Space(6.25)
  // RAlt(1) Fn(1) RCtrl(1) | ← ↓ →
  //
  // Arrow cluster: ← ↓ → aligned with ↑ above
  // ← at x=13.25, ↓ at x=14.25 (under ↑), → at x=15.25
  // ═══════════════════════════════════════════════

  { name: "ControlLeft",  label: "Ctrl",   x: 0,      y: R5, w: 1.25,  kind: "mod" },
  { name: "MetaLeft",     label: "Win",    x: 1.25,   y: R5, w: 1.25,  kind: "mod" },
  { name: "AltLeft",      label: "Alt",    x: 2.5,    y: R5, w: 1.25,  kind: "mod" },
  { name: "Space",        label: "",       x: 3.75,   y: R5, w: 6.25,  kind: "accent" },
  { name: "AltRight",     label: "Alt",    x: 10,     y: R5, w: 1,     kind: "mod" },
  { name: "Fn",           label: "Fn",     x: 11,     y: R5, w: 1,     kind: "mod" },
  { name: "ControlRight", label: "Ctrl",   x: 12,     y: R5, w: 1.25,  kind: "mod" },

  // Arrow cluster — ← ↓ → with ↓ directly under ↑
  { name: "ArrowLeft",    label: "←",      x: 13.25,  y: R5, w: 1,     kind: "arrow" },
  { name: "ArrowDown",    label: "↓",      x: 14.25,  y: R5, w: 1,     kind: "arrow" },
  { name: "ArrowRight",   label: "→",      x: 15.25,  y: R5, w: 1,     kind: "arrow" },
];

// Add default h=1 to all keys
KEYBOARD_LAYOUT.forEach((k) => { if (!k.h) k.h = 1; });

// ─── Derived constants (computed from layout, not hardcoded) ───

// Bounding box of the entire layout
export const LAYOUT_BOUNDS = (() => {
  let maxX = 0, maxY = 0;
  for (const k of KEYBOARD_LAYOUT) {
    maxX = Math.max(maxX, k.x + k.w);
    maxY = Math.max(maxY, k.y + k.h);
  }
  return { width: maxX, height: maxY };
})();

// Accent keys: large/special keys that get a distinct color
const ACCENT_KINDS = new Set(["accent"]);
export const isAccentKey = (key) => ACCENT_KINDS.has(key.kind);

// ─── Name → index lookup for O(1) triggerKey resolution ───
export const KEY_INDEX_MAP = new Map();
KEYBOARD_LAYOUT.forEach((key, i) => {
  KEY_INDEX_MAP.set(key.name, i);
  // Also map by label for convenience (e.g., "A" → index)
  if (key.label && key.label !== key.name && !KEY_INDEX_MAP.has(key.label)) {
    KEY_INDEX_MAP.set(key.label, i);
  }
});

// ─── KeyboardEvent.code → layout name mapping ───
export const CODE_TO_NAME = new Map();
KEYBOARD_LAYOUT.forEach((key) => {
  CODE_TO_NAME.set(key.name, key.name);
});
