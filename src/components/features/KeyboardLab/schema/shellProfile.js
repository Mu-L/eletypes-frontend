/**
 * ShellProfile — optional visual identity layer for keyboard cases.
 *
 * The shell is separate from the layout because:
 * - Same layout (e.g., 75% ANSI) can pair with different shells
 * - Shell metadata has no effect on key positioning
 * - 2D renderer doesn't need shell data; 3D renderer does
 *
 * Schema: "eletypes-shell/1"
 */

export const SHELL_SCHEMA_VERSION = "eletypes-shell/1";

/**
 * Default shell profile — generic 75% case.
 * Matches the current KeyboardModel.jsx constants.
 */
export const DEFAULT_SHELL = {
  schema: SHELL_SCHEMA_VERSION,
  id: "generic-75",
  name: "Generic 75%",
  compatibleLayouts: ["75%"],
  case: {
    paddingTop: 0.4,
    paddingBottom: 0.4,
    paddingLeft: 0.4,
    paddingRight: 0.4,
    cornerRadius: 0.08,
    height: 0.25,
    tilt: 0,
  },
  plate: {
    inset: 0.3,    // how much smaller than the case
    height: 0.02,
    color: "#0a0a0c",
  },
  features: [],
};

/**
 * Cyberboard-inspired shell — thicker bottom bezel, higher case.
 */
export const CYBERBOARD_SHELL = {
  schema: SHELL_SCHEMA_VERSION,
  id: "cyberboard-r3",
  name: "Cyberboard R3",
  compatibleLayouts: ["75%"],
  case: {
    paddingTop: 0.35,
    paddingBottom: 1.0,     // Cyberboard signature: thick bottom bezel
    paddingLeft: 0.45,
    paddingRight: 0.45,
    cornerRadius: 0.12,
    height: 0.3,
    tilt: 0,
  },
  plate: {
    inset: 0.35,
    height: 0.02,
    color: "#080810",
  },
  features: [
    // Future: LED bar, badge area, knob position
    { type: "led-bar", position: "bottom", height: 0.15 },
  ],
};

export const validateShellProfile = (shell) => {
  const errors = [];
  if (!shell) return { valid: false, errors: ["Shell is null"] };
  if (!shell.id) errors.push("Missing id");
  if (!shell.case) errors.push("Missing case object");
  return { valid: errors.length === 0, errors };
};
