/**
 * KeyboardLab — 3D keyboard visualization wrapper.
 *
 * Public API:
 *   <KeyboardLab ref={ref} keycapColor="#2a2a2e" ... />
 *   ref.triggerKey("KeyA") — animate a key press (no React re-render)
 *
 * Architecture:
 * - Zero keyboard/input event listeners inside the 3D layer
 * - triggerKey() is pure imperative: ref mutation → invalidate() → GPU frame
 * - No React state changes in the entire press→animate→settle path
 *
 * Performance:
 * - frameloop="demand": GPU idle when nothing moves
 * - DPR capped at [1, 1.5]: sharp enough, no 4x pixel waste
 * - Environment map loads once, cached by drei
 */

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import KeyboardModel from "./KeyboardModel";

const DEFAULT_CONFIG = {
  keycapColor: "#2a2a2e",
  accentKeyColor: "#3d3d42",
  caseColor: "#1a1a1e",
};

const KeyboardLab = forwardRef(({
  keycapColor = DEFAULT_CONFIG.keycapColor,
  accentKeyColor = DEFAULT_CONFIG.accentKeyColor,
  caseColor = DEFAULT_CONFIG.caseColor,
  style,
}, ref) => {
  const modelRef = useRef();

  useImperativeHandle(ref, () => ({
    triggerKey: (keyName) => {
      modelRef.current?.triggerKey(keyName);
    },
  }), []);

  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{
          // Slightly elevated angle — shows key travel and case reflection
          position: [0, 7, 9],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#111115");
        }}
      >
        {/*
          Lighting: designed for anodized metal + plastic keycaps.
          Key light (right) gives directional highlights on case.
          Fill light (left) softens shadows.
          Rim light (back) separates keys from case.
        */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 4]} intensity={0.9} />
        <directionalLight position={[-4, 6, -3]} intensity={0.25} />
        <directionalLight position={[0, 2, -8]} intensity={0.15} />

        {/* Environment map for metallic reflections — "apartment" is
            small and warm, good for close-up metallic objects */}
        <Environment preset="apartment" />

        <KeyboardModel
          ref={modelRef}
          keycapColor={keycapColor}
          accentKeyColor={accentKeyColor}
          caseColor={caseColor}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI * 0.05}  // Almost top-down allowed
          maxPolarAngle={Math.PI * 0.42}  // No lower than ~75° from vertical
          minDistance={5}
          maxDistance={18}
          enableDamping
          dampingFactor={0.06}
          // Target slightly above origin — orbits around the key surface, not the base
          target={[0, 0.15, 0]}
        />
      </Canvas>
    </div>
  );
});

KeyboardLab.displayName = "KeyboardLab";

export default KeyboardLab;
