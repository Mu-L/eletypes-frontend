/**
 * KeycapLabels — renders key legends as 3D Text on keycap surfaces.
 *
 * Reads positions from KeyboardModel so labels always match keycap placement.
 */

import React, { useMemo, useRef, useEffect } from "react";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { extractKeys } from "./schema/derive";

const KeycapLabels = ({ layout, keycapPreset, legendPreset, modelRef, positionDeps }) => {
  const keys = useMemo(() => extractKeys(layout), [layout]);
  const { invalidate } = useThree();

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

  // Sync label positions whenever model updates
  const syncPositions = () => {
    const positions = modelRef?.current?.getRestPositions?.();
    const offsets = modelRef?.current?.getOffsets?.();
    if (!positions) return;

    for (let i = 0; i < keys.length; i++) {
      const ref = groupRefs.current[i];
      const rest = positions[i];
      if (ref && rest) {
        ref.position.x = rest.x;
        ref.position.y = rest.y + rest.sy / 2 + 0.005 + (offsets?.[i] || 0);
        ref.position.z = rest.z;
        ref.rotation.x = rest.tiltX || 0;
      }
    }
  };

  // Re-sync when anything affecting positions changes
  useEffect(() => {
    const timer = setTimeout(() => {
      syncPositions();
      invalidate();
    }, 30);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, keycapPreset, legendPreset, positionDeps, keys.length]);

  // Per-frame sync for press animation
  useFrame(syncPositions);

  if (style.fontSize === 0 || style.color === "transparent") return null;

  const worldFontSize = (style.fontSize / 28) * 0.22;

  return (
    <group>
      {keys.map((key, i) => {
        const override = keyOverrides[key.id];
        const displayLabel = override?.label ?? key.label;
        if (!displayLabel) return null;

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
            position={[0, 0, 0]}
          >
            <Text
              fontSize={fontSize}
              color={color}
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
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
