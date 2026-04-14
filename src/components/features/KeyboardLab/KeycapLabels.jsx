/**
 * KeycapLabels — renders key legends on keycap surfaces driven by legend preset.
 *
 * Consumes eletypes-legend/1 schema for font, size, color, position.
 * Per-key overrides supported via legendPreset.keyOverrides[key.id].
 */

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { extractKeys, computeBounds } from "./schema/derive";

const PLATE_Y = 0.02;

// Position offsets for label placement on keycap surface (in % of key size)
const POSITION_OFFSETS = {
  "center":        { tx: "0%",    ty: "0%",    align: "center" },
  "top-left":      { tx: "-30%",  ty: "-25%",  align: "left" },
  "top-center":    { tx: "0%",    ty: "-25%",  align: "center" },
  "bottom-left":   { tx: "-30%",  ty: "25%",   align: "left" },
  "bottom-center": { tx: "0%",    ty: "25%",   align: "center" },
};

const KeycapLabels = ({ layout, keycapPreset, legendPreset }) => {
  const keys = useMemo(() => extractKeys(layout), [layout]);
  const bounds = useMemo(() => computeBounds(keys), [keys]);
  const centerX = bounds.width / 2;
  const centerZ = bounds.height / 2;

  const profile = keycapPreset?.profile;
  const baseH = profile?.defaultCap?.height || 0.38;
  const rows = (!profile?.uniform && profile?.rows) ? profile.rows : null;

  const style = legendPreset?.style || {
    fontFamily: "sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: "#cccccc",
    position: "center",
    uppercase: true,
  };
  const keyOverrides = legendPreset?.keyOverrides || {};

  const yToRow = (y) => {
    if (y < 1.0) return 0;
    if (y < 2.0) return 1;
    if (y < 3.0) return 2;
    if (y < 4.0) return 3;
    if (y < 5.0) return 4;
    return 5;
  };

  // Skip rendering entirely for blank preset
  if (style.fontSize === 0 || style.color === "transparent") return null;

  const posOffset = POSITION_OFFSETS[style.position] || POSITION_OFFSETS["center"];

  return (
    <group>
      {keys.map((key) => {
        const override = keyOverrides[key.id];
        const displayLabel = override?.label ?? key.label;
        if (!displayLabel) return null;

        const row = yToRow(key.y);
        const sculpt = rows?.[row];
        const capH = sculpt ? baseH * sculpt.height : baseH;

        const x = (key.x + key.w / 2) - centerX;
        const y = capH + PLATE_Y + 0.001;
        const z = (key.y + (key.h || 1) / 2) - centerZ;

        // Per-key font size: base size, scaled down for long labels or narrow keys
        let fontSize = override?.fontSize || style.fontSize;
        if (displayLabel.length > 3) fontSize = Math.min(fontSize, 8);
        if (key.w < 1.2 && displayLabel.length > 2) fontSize = Math.min(fontSize, 7);

        const color = override?.color || style.color;
        const shouldUppercase = style.uppercase && displayLabel.length === 1;

        return (
          <group key={key.id} position={[x, y, z]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <Html
                transform
                occlude
                distanceFactor={1.8}
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                  color,
                  fontSize: `${fontSize}px`,
                  fontFamily: style.fontFamily,
                  fontWeight: style.fontWeight || 600,
                  letterSpacing: style.letterSpacing ? `${style.letterSpacing}em` : undefined,
                  textTransform: shouldUppercase ? "uppercase" : "none",
                  whiteSpace: "nowrap",
                  textAlign: posOffset.align,
                  lineHeight: 1,
                  transform: `translate(${posOffset.tx}, ${posOffset.ty})`,
                }}
              >
                {displayLabel}
                {override?.subLabel && (
                  <span style={{ display: "block", fontSize: `${Math.max(fontSize - 3, 5)}px`, opacity: 0.6, marginTop: "1px" }}>
                    {override.subLabel}
                  </span>
                )}
              </Html>
            </group>
          </group>
        );
      })}
    </group>
  );
};

export default KeycapLabels;
