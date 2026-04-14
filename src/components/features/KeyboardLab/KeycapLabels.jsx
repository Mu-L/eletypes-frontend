/**
 * KeycapLabels — renders key legends as 2D HTML overlays positioned in 3D space.
 *
 * Uses drei's <Html> for each key label, positioned at the top of each keycap.
 * This is simpler than a texture atlas and looks crisp at any zoom level.
 *
 * Performance: <Html> creates DOM elements outside the WebGL canvas.
 * For ~84 keys this is acceptable. If it becomes a bottleneck,
 * migrate to a canvas texture atlas with per-instance UV offsets.
 *
 * Labels are occludable (hidden when behind the keyboard) and
 * pointer-events: none so they don't interfere with OrbitControls.
 */

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import { extractKeys, computeBounds } from "./schema/derive";

const KeycapLabels = ({ layout, keycapPreset, legendColor = "#cccccc" }) => {
  const keys = useMemo(() => extractKeys(layout), [layout]);
  const bounds = useMemo(() => computeBounds(keys), [keys]);
  const centerX = bounds.width / 2;
  const centerZ = bounds.height / 2;

  const profile = keycapPreset?.profile;
  const baseH = profile?.defaultCap?.height || 0.38;
  const rows = (!profile?.uniform && profile?.rows) ? profile.rows : null;

  // Row detection
  const yToRow = (y) => {
    if (y < 1.0) return 0;
    if (y < 2.0) return 1;
    if (y < 3.0) return 2;
    if (y < 4.0) return 3;
    if (y < 5.0) return 4;
    return 5;
  };

  return (
    <group>
      {keys.map((key) => {
        if (!key.label) return null; // Skip blank keys (Space)

        const row = yToRow(key.y);
        const sculpt = rows?.[row];
        const capH = sculpt ? baseH * sculpt.height : baseH;

        // Position: center of key, on top of the keycap
        const x = (key.x + key.w / 2) - centerX;
        const y = capH + 0.02 + 0.01; // Top of cap + plate + small offset
        const z = (key.y + (key.h || 1) / 2) - centerZ;

        // Font size based on key width and label length
        const isSmall = key.w < 1.2 && key.label.length > 2;
        const fontSize = isSmall ? "7px" : key.label.length > 3 ? "7px" : "9px";

        return (
          <Html
            key={key.id}
            position={[x, y, z]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: "none",
              userSelect: "none",
              color: legendColor,
              fontSize,
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
              textTransform: key.label.length === 1 ? "uppercase" : "none",
              whiteSpace: "nowrap",
              textShadow: "0 0 2px rgba(0,0,0,0.5)",
            }}
          >
            {key.label}
          </Html>
        );
      })}
    </group>
  );
};

export default KeycapLabels;
