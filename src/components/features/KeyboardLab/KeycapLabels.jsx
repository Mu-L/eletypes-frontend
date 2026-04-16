/**
 * KeycapLabels — renders key legends as 3D text on keycap surfaces.
 *
 * Uses drei's <Text> (troika-three-text SDF renderer) instead of <Html>.
 * Text exists in world space — position is stable regardless of Canvas size.
 * No screen-space projection, no resize dependency.
 *
 * Labels follow key press animation by reading Y offsets from KeyboardModel.
 */

import React, { useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { extractKeys, computeBounds } from "./schema/derive";

const PLATE_Y = 0.02;

const yToRow = (y) => {
  if (y < 1.0) return 0;
  if (y < 2.0) return 1;
  if (y < 3.0) return 2;
  if (y < 4.0) return 3;
  if (y < 5.0) return 4;
  return 5;
};

const KeycapLabels = ({ layout, keycapPreset, legendPreset, modelRef }) => {
  const keys = useMemo(() => extractKeys(layout), [layout]);
  const bounds = useMemo(() => computeBounds(keys), [keys]);
  const centerX = bounds.width / 2;
  const centerZ = bounds.height / 2;

  const profile = keycapPreset?.profile;
  const baseH = profile?.defaultCap?.height || 0.38;
  const rows = (!profile?.uniform && profile?.rows) ? profile.rows : null;

  const style = legendPreset?.style || {
    fontFamily: "Arial, sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: "#cccccc",
    position: "center",
    uppercase: true,
  };
  const keyOverrides = legendPreset?.keyOverrides || {};

  const groupRefs = useRef([]);

  // Pre-compute rest Y positions for each key
  const restYs = useMemo(() => {
    return keys.map((key) => {
      const row = yToRow(key.y);
      const sculpt = rows?.[row];
      const capH = sculpt ? baseH * sculpt.height : baseH;
      return capH + PLATE_Y + 0.005; // Slightly above cap surface
    });
  }, [keys, rows, baseH]);

  // Follow key press animation
  useFrame(() => {
    const offsets = modelRef?.current?.getOffsets?.();
    if (!offsets) return;
    for (let i = 0; i < keys.length; i++) {
      const ref = groupRefs.current[i];
      if (ref) {
        ref.position.y = restYs[i] + (offsets[i] || 0);
      }
    }
  });

  if (style.fontSize === 0 || style.color === "transparent") return null;

  // Convert pixel fontSize to world-space size
  // At distanceFactor=3, fontSize 28px was readable. In world space, ~0.22 units.
  const worldFontSize = (style.fontSize / 28) * 0.22;

  // Font URL — use system fonts via troika's default font, or a Google Font
  // troika-three-text supports any font URL. For system fonts, pass undefined.
  const fontUrl = undefined; // Uses troika default (Roboto-like)

  return (
    <group>
      {keys.map((key, i) => {
        const override = keyOverrides[key.id];
        const displayLabel = override?.label ?? key.label;
        if (!displayLabel) return null;

        const x = (key.x + key.w / 2) - centerX;
        const z = (key.y + (key.h || 1) / 2) - centerZ;

        // Scale font down for long labels or narrow keys
        let fontSize = worldFontSize;
        if (displayLabel.length > 4) fontSize *= 0.6;
        else if (displayLabel.length > 2 && key.w < 1.5) fontSize *= 0.7;

        const color = override?.color || style.color;
        const text = style.uppercase && displayLabel.length === 1
          ? displayLabel.toUpperCase()
          : displayLabel;

        return (
          <group
            key={key.id}
            ref={(el) => { groupRefs.current[i] = el; }}
            position={[x, restYs[i], z]}
          >
            <Text
              fontSize={fontSize}
              color={color}
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
              font={fontUrl}
              fontWeight={style.fontWeight || 700}
              maxWidth={key.w * 0.8}
              textAlign="center"
            >
              {text}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export default KeycapLabels;
