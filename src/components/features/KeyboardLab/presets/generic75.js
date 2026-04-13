/**
 * Generic 75% ANSI preset.
 * Reference: Keychron Q1 / GMMK Pro style layout.
 * 84 keys, standard ANSI widths, right nav column, integrated arrow cluster.
 */

import { createBoardLayout } from "../schema/boardLayout";

// Row Y positions (0.25u gap between F-row and number row)
const R0 = 0, R1 = 1.25, R2 = 2.25, R3 = 3.25, R4 = 4.25, R5 = 5.25;
const RC = 15.5; // Right column x

export default createBoardLayout({
  id: "generic-75-ansi",
  name: "Generic 75% ANSI",
  layoutType: "75%",
  standard: "ANSI",
  keys: [
    // ══ Row 0: Function row ══
    { id: "Escape",  label: "Esc",  x: 0,     y: R0, w: 1,    kind: "accent",  cluster: "fn-row" },
    { id: "F1",      label: "F1",   x: 1.5,   y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F2",      label: "F2",   x: 2.5,   y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F3",      label: "F3",   x: 3.5,   y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F4",      label: "F4",   x: 4.5,   y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F5",      label: "F5",   x: 5.75,  y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F6",      label: "F6",   x: 6.75,  y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F7",      label: "F7",   x: 7.75,  y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F8",      label: "F8",   x: 8.75,  y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F9",      label: "F9",   x: 10,    y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F10",     label: "F10",  x: 11,    y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F11",     label: "F11",  x: 12,    y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "F12",     label: "F12",  x: 13,    y: R0, w: 1,    kind: "fn",      cluster: "fn-row" },
    { id: "Delete",  label: "Del",  x: RC,    y: R0, w: 1,    kind: "nav",     cluster: "nav-col" },

    // ══ Row 1: Number row (15u) ══
    { id: "Backquote",     label: "`",    x: 0,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit1",        label: "1",    x: 1,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit2",        label: "2",    x: 2,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit3",        label: "3",    x: 3,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit4",        label: "4",    x: 4,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit5",        label: "5",    x: 5,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit6",        label: "6",    x: 6,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit7",        label: "7",    x: 7,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit8",        label: "8",    x: 8,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit9",        label: "9",    x: 9,   y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Digit0",        label: "0",    x: 10,  y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Minus",         label: "-",    x: 11,  y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Equal",         label: "=",    x: 12,  y: R1, w: 1,    kind: "alpha",  cluster: "number-row" },
    { id: "Backspace",     label: "Bksp", x: 13,  y: R1, w: 2,    kind: "accent", cluster: "number-row" },
    { id: "PageUp",        label: "PgUp", x: RC,  y: R1, w: 1,    kind: "nav",    cluster: "nav-col" },

    // ══ Row 2: QWERTY row (15u) ══
    { id: "Tab",           label: "Tab",  x: 0,    y: R2, w: 1.5,  kind: "accent", cluster: "alpha" },
    { id: "KeyQ",          label: "Q",    x: 1.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyW",          label: "W",    x: 2.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyE",          label: "E",    x: 3.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyR",          label: "R",    x: 4.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyT",          label: "T",    x: 5.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyY",          label: "Y",    x: 6.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyU",          label: "U",    x: 7.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyI",          label: "I",    x: 8.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyO",          label: "O",    x: 9.5,  y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyP",          label: "P",    x: 10.5, y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "BracketLeft",   label: "[",    x: 11.5, y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "BracketRight",  label: "]",    x: 12.5, y: R2, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "Backslash",     label: "\\",   x: 13.5, y: R2, w: 1.5,  kind: "alpha",  cluster: "alpha" },
    { id: "PageDown",      label: "PgDn", x: RC,   y: R2, w: 1,    kind: "nav",    cluster: "nav-col" },

    // ══ Row 3: Home row (15u) ══
    { id: "CapsLock",      label: "Caps",  x: 0,     y: R3, w: 1.75, kind: "accent", cluster: "alpha" },
    { id: "KeyA",          label: "A",     x: 1.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyS",          label: "S",     x: 2.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyD",          label: "D",     x: 3.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyF",          label: "F",     x: 4.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyG",          label: "G",     x: 5.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyH",          label: "H",     x: 6.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyJ",          label: "J",     x: 7.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyK",          label: "K",     x: 8.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "KeyL",          label: "L",     x: 9.75,  y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "Semicolon",     label: ";",     x: 10.75, y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "Quote",         label: "'",     x: 11.75, y: R3, w: 1,    kind: "alpha",  cluster: "alpha" },
    { id: "Enter",         label: "Enter", x: 12.75, y: R3, w: 2.25, kind: "accent", cluster: "alpha" },
    { id: "Home",          label: "Home",  x: RC,    y: R3, w: 1,    kind: "nav",    cluster: "nav-col" },

    // ══ Row 4: Shift row ══
    { id: "ShiftLeft",     label: "Shift", x: 0,     y: R4, w: 2.25,  kind: "accent",  cluster: "alpha" },
    { id: "KeyZ",          label: "Z",     x: 2.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyX",          label: "X",     x: 3.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyC",          label: "C",     x: 4.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyV",          label: "V",     x: 5.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyB",          label: "B",     x: 6.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyN",          label: "N",     x: 7.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "KeyM",          label: "M",     x: 8.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "Comma",         label: ",",     x: 9.25,  y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "Period",        label: ".",     x: 10.25, y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "Slash",         label: "/",     x: 11.25, y: R4, w: 1,     kind: "alpha",   cluster: "alpha" },
    { id: "ShiftRight",    label: "Shift", x: 12.25, y: R4, w: 1.75,  kind: "accent",  cluster: "alpha" },
    { id: "ArrowUp",       label: "↑",     x: 14.25, y: R4, w: 1,     kind: "arrow",   cluster: "arrow-cluster" },
    { id: "End",           label: "End",   x: RC,    y: R4, w: 1,     kind: "nav",     cluster: "nav-col" },

    // ══ Row 5: Bottom row ══
    { id: "ControlLeft",   label: "Ctrl",  x: 0,     y: R5, w: 1.25,  kind: "mod",    cluster: "bottom-row" },
    { id: "MetaLeft",      label: "Win",   x: 1.25,  y: R5, w: 1.25,  kind: "mod",    cluster: "bottom-row" },
    { id: "AltLeft",       label: "Alt",   x: 2.5,   y: R5, w: 1.25,  kind: "mod",    cluster: "bottom-row" },
    { id: "Space",         label: "",      x: 3.75,  y: R5, w: 6.25,  kind: "accent", cluster: "bottom-row" },
    { id: "AltRight",      label: "Alt",   x: 10,    y: R5, w: 1,     kind: "mod",    cluster: "bottom-row" },
    { id: "Fn",            label: "Fn",    x: 11,    y: R5, w: 1,     kind: "mod",    cluster: "bottom-row" },
    { id: "ControlRight",  label: "Ctrl",  x: 12,    y: R5, w: 1.25,  kind: "mod",    cluster: "bottom-row" },
    { id: "ArrowLeft",     label: "←",     x: 13.25, y: R5, w: 1,     kind: "arrow",  cluster: "arrow-cluster" },
    { id: "ArrowDown",     label: "↓",     x: 14.25, y: R5, w: 1,     kind: "arrow",  cluster: "arrow-cluster" },
    { id: "ArrowRight",    label: "→",     x: 15.25, y: R5, w: 1,     kind: "arrow",  cluster: "arrow-cluster" },
  ],
});
