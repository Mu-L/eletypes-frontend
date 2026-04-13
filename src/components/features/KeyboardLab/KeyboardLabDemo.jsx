/**
 * KeyboardLabDemo — standalone demo showing the KeyboardLab component API.
 *
 * Demonstrates:
 * 1. Color customization via props
 * 2. External triggerKey() calls (decoupled from the 3D layer)
 * 3. DOM keyboard event → triggerKey bridge (optional integration example)
 *
 * This component is the "App.tsx example" from the spec.
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import KeyboardLab from "./KeyboardLab";
import { CODE_TO_NAME } from "./keyboardLayout";

// Preset color themes
const PRESETS = {
  midnight: { keycapColor: "#2a2a2e", accentKeyColor: "#3d3d42", caseColor: "#1a1a1e" },
  ocean: { keycapColor: "#1e3a5f", accentKeyColor: "#2d6a9f", caseColor: "#0d1b2a" },
  sakura: { keycapColor: "#f5e6e0", accentKeyColor: "#d4918b", caseColor: "#3d2b2b" },
  forest: { keycapColor: "#2d4a2d", accentKeyColor: "#5a8a3c", caseColor: "#1a2e1a" },
  arctic: { keycapColor: "#e8edf2", accentKeyColor: "#94b3d4", caseColor: "#c0c8d0" },
};

const KeyboardLabDemo = ({ theme }) => {
  const keyboardRef = useRef();
  const [preset, setPreset] = useState("midnight");
  const [colors, setColors] = useState(PRESETS.midnight);
  const [liveTyping, setLiveTyping] = useState(true);

  // Apply preset
  const applyPreset = (name) => {
    setPreset(name);
    setColors(PRESETS[name]);
  };

  // Bridge: DOM keyboard events → triggerKey (optional, shows decoupled architecture)
  useEffect(() => {
    if (!liveTyping) return;

    const handleKeyDown = (e) => {
      const keyName = CODE_TO_NAME.get(e.code);
      if (keyName) {
        keyboardRef.current?.triggerKey(keyName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [liveTyping]);

  // Demo: programmatic trigger
  const triggerDemo = useCallback(() => {
    const demoKeys = ["KeyH", "KeyE", "KeyL", "KeyL", "KeyO"];
    demoKeys.forEach((key, i) => {
      setTimeout(() => keyboardRef.current?.triggerKey(key), i * 120);
    });
  }, []);

  const textColor = theme?.text || "#e0e0e0";
  const bgColor = theme?.background || "#111115";
  const statsColor = theme?.stats || "#6ec6ff";

  const btnStyle = {
    background: "transparent",
    border: `1px solid ${statsColor}55`,
    borderRadius: "4px",
    color: textColor,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  };

  const activeBtnStyle = {
    ...btnStyle,
    borderColor: statsColor,
    color: statsColor,
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: bgColor }}>
      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: `1px solid ${textColor}15`,
        }}
      >
        {/* Preset buttons */}
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            style={preset === name ? activeBtnStyle : btnStyle}
          >
            {name}
          </button>
        ))}

        <span style={{ color: textColor, opacity: 0.3, margin: "0 4px" }}>|</span>

        {/* Demo trigger */}
        <button onClick={triggerDemo} style={btnStyle}>
          Demo "HELLO"
        </button>

        {/* Live typing toggle */}
        <button
          onClick={() => setLiveTyping(!liveTyping)}
          style={liveTyping ? activeBtnStyle : btnStyle}
        >
          {liveTyping ? "Live Typing: ON" : "Live Typing: OFF"}
        </button>

        {/* Individual key triggers */}
        <span style={{ color: textColor, opacity: 0.3, margin: "0 4px" }}>|</span>
        {["Space", "Enter", "Escape", "Backspace"].map((key) => (
          <button
            key={key}
            onClick={() => keyboardRef.current?.triggerKey(key)}
            style={btnStyle}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Color pickers */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 16px",
          alignItems: "center",
          borderBottom: `1px solid ${textColor}15`,
        }}
      >
        {[
          { label: "Keycap", key: "keycapColor" },
          { label: "Accent", key: "accentKeyColor" },
          { label: "Case", key: "caseColor" },
        ].map(({ label, key }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "6px", color: textColor, fontSize: "12px" }}>
            {label}
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => setColors((c) => ({ ...c, [key]: e.target.value }))}
              style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", background: "transparent" }}
            />
          </label>
        ))}
      </div>

      {/* 3D Keyboard — takes remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <KeyboardLab
          ref={keyboardRef}
          keycapColor={colors.keycapColor}
          accentKeyColor={colors.accentKeyColor}
          caseColor={colors.caseColor}
        />
      </div>
    </div>
  );
};

export default KeyboardLabDemo;
