/**
 * KeyboardLabDemo — integration demo for the data-driven keyboard lab.
 *
 * Shows:
 * - Preset selector (generic 75%, Cyberboard 75%)
 * - 2D layout view (from same JSON as 3D)
 * - 3D rendering with live typing bridge
 * - Color customization
 * - Export/copy JSON
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import KeyboardLab from "./KeyboardLab";
import KeyboardLayout2D from "./KeyboardLayout2D";
import { listPresets, getPreset } from "./presets";
import { listKeycapPresets, getKeycapPreset } from "./presets/keycaps";
import { buildCodeMap, extractKeys } from "./schema/derive";

const COLOR_PRESETS = {
  midnight:    { keycapColor: "#2a2a2e", accentKeyColor: "#3d3d42", caseColor: "#1a1a1e", opacity: 1.0 },
  ocean:       { keycapColor: "#1e3a5f", accentKeyColor: "#2d6a9f", caseColor: "#0d1b2a", opacity: 1.0 },
  sakura:      { keycapColor: "#f5e6e0", accentKeyColor: "#d4918b", caseColor: "#3d2b2b", opacity: 1.0 },
  forest:      { keycapColor: "#2d4a2d", accentKeyColor: "#5a8a3c", caseColor: "#1a2e1a", opacity: 1.0 },
  arctic:      { keycapColor: "#e8edf2", accentKeyColor: "#94b3d4", caseColor: "#c0c8d0", opacity: 1.0 },
  translucent: { keycapColor: "#8899aa", accentKeyColor: "#aabbcc", caseColor: "#1a1a1e", opacity: 0.55 },
  pudding:     { keycapColor: "#f0e8d8", accentKeyColor: "#1a1a1e", caseColor: "#1a1a1e", opacity: 0.75 },
  jelly:       { keycapColor: "#6a4c93", accentKeyColor: "#c75d9b", caseColor: "#0d0d12", opacity: 0.45 },
  frosted:     { keycapColor: "#d0dce8", accentKeyColor: "#7eb0d5", caseColor: "#2a2a30", opacity: 0.65 },
};

const KeyboardLabDemo = ({ theme }) => {
  const keyboardRef = useRef();
  const presets = useMemo(() => listPresets(), []);
  const capPresets = useMemo(() => listKeycapPresets(), []);
  const [presetId, setPresetId] = useState(presets[0]?.id);
  const [capPresetId, setCapPresetId] = useState("cherry-profile");
  const [colorPreset, setColorPreset] = useState("midnight");
  const [colors, setColors] = useState(COLOR_PRESETS.midnight);
  const [opacity, setOpacity] = useState(1.0);
  const [liveTyping, setLiveTyping] = useState(true);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [view, setView] = useState("both"); // "2d" | "3d" | "both"

  const { layout, shell } = useMemo(() => getPreset(presetId), [presetId]);
  const keycapPreset = useMemo(() => getKeycapPreset(capPresetId), [capPresetId]);
  const codeMap = useMemo(() => buildCodeMap(extractKeys(layout)), [layout]);

  // Bridge: DOM keyboard events → triggerKey + 2D active state
  useEffect(() => {
    if (!liveTyping) return;

    const handleKeyDown = (e) => {
      const keyName = codeMap.get(e.code);
      if (keyName) {
        keyboardRef.current?.triggerKey(keyName);
        setActiveKeys((prev) => new Set(prev).add(keyName));
      }
    };

    const handleKeyUp = (e) => {
      const keyName = codeMap.get(e.code);
      if (keyName) {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyName);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [liveTyping, codeMap]);

  const triggerDemo = useCallback(() => {
    const keys = ["KeyH", "KeyE", "KeyL", "KeyL", "KeyO"];
    keys.forEach((k, i) => {
      setTimeout(() => keyboardRef.current?.triggerKey(k), i * 120);
    });
  }, []);

  const applyColorPreset = (name) => {
    setColorPreset(name);
    setColors(COLOR_PRESETS[name]);
    setOpacity(COLOR_PRESETS[name].opacity ?? 1.0);
  };

  const textColor = theme?.text || "#e0e0e0";
  const statsColor = theme?.stats || "#6ec6ff";

  const btnStyle = (active) => ({
    background: "transparent",
    border: `1px solid ${active ? statsColor : statsColor + "44"}`,
    borderRadius: "4px",
    color: active ? statsColor : textColor,
    padding: "5px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: theme?.background || "#111115" }}>
      {/* Top bar: preset + view + actions */}
      <div style={{ display: "flex", gap: "8px", padding: "10px 16px", flexWrap: "wrap", alignItems: "center", borderBottom: `1px solid ${textColor}15` }}>
        {/* Preset selector */}
        <span style={{ fontSize: "11px", color: textColor, opacity: 0.5 }}>PRESET</span>
        {presets.map((p) => (
          <button key={p.id} onClick={() => setPresetId(p.id)} style={btnStyle(presetId === p.id)}>
            {p.name}
          </button>
        ))}

        <span style={{ color: textColor, opacity: 0.15, margin: "0 4px" }}>|</span>

        {/* Keycap profile selector */}
        <span style={{ fontSize: "11px", color: textColor, opacity: 0.5 }}>PROFILE</span>
        {capPresets.map((p) => (
          <button key={p.id} onClick={() => setCapPresetId(p.id)} style={btnStyle(capPresetId === p.id)}>
            {p.name}
          </button>
        ))}

        <span style={{ color: textColor, opacity: 0.15, margin: "0 4px" }}>|</span>

        {/* View toggle */}
        <span style={{ fontSize: "11px", color: textColor, opacity: 0.5 }}>VIEW</span>
        {["2d", "3d", "both"].map((v) => (
          <button key={v} onClick={() => setView(v)} style={btnStyle(view === v)}>
            {v.toUpperCase()}
          </button>
        ))}

        <span style={{ color: textColor, opacity: 0.15, margin: "0 4px" }}>|</span>

        <button onClick={triggerDemo} style={btnStyle(false)}>Demo "HELLO"</button>
        <button onClick={() => setLiveTyping(!liveTyping)} style={btnStyle(liveTyping)}>
          Live: {liveTyping ? "ON" : "OFF"}
        </button>
      </div>

      {/* Color bar */}
      <div style={{ display: "flex", gap: "8px", padding: "8px 16px", alignItems: "center", borderBottom: `1px solid ${textColor}15` }}>
        {Object.keys(COLOR_PRESETS).map((name) => (
          <button key={name} onClick={() => applyColorPreset(name)} style={btnStyle(colorPreset === name)}>
            {name}
          </button>
        ))}
        <span style={{ color: textColor, opacity: 0.15, margin: "0 4px" }}>|</span>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", color: textColor, fontSize: "11px" }}>
          Opacity
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ width: "60px", accentColor: statsColor }}
          />
          <span style={{ minWidth: "28px" }}>{Math.round(opacity * 100)}%</span>
        </label>
        <span style={{ color: textColor, opacity: 0.15, margin: "0 4px" }}>|</span>
        {[
          { label: "Keycap", key: "keycapColor" },
          { label: "Accent", key: "accentKeyColor" },
          { label: "Case", key: "caseColor" },
        ].map(({ label, key }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "4px", color: textColor, fontSize: "11px" }}>
            {label}
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => setColors((c) => ({ ...c, [key]: e.target.value }))}
              style={{ width: "24px", height: "24px", border: "none", cursor: "pointer", background: "transparent" }}
            />
          </label>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* 2D view */}
        {(view === "2d" || view === "both") && (
          <div style={{ padding: "16px", overflow: "auto" }}>
            <KeyboardLayout2D
              layout={layout}
              activeKeys={activeKeys}
              theme={theme}
            />
          </div>
        )}

        {/* 3D view */}
        {(view === "3d" || view === "both") && (
          <div style={{ flex: 1, minHeight: view === "both" ? "300px" : 0 }}>
            <KeyboardLab
              ref={keyboardRef}
              layout={layout}
              shell={shell}
              keycapPreset={keycapPreset}
              keycapColor={colors.keycapColor}
              accentKeyColor={colors.accentKeyColor}
              caseColor={colors.caseColor}
              keycapOpacity={opacity}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyboardLabDemo;
