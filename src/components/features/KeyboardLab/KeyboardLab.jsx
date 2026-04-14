/**
 * KeyboardLab — 3D keyboard visualization wrapper.
 *
 * Accepts a BoardLayout and optional ShellProfile.
 * Defaults to generic-75-ansi if no layout provided.
 */

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import KeyboardModel from "./KeyboardModel";
import KeycapLabels from "./KeycapLabels";
import { getPreset } from "./presets";

const DEFAULT_PRESET = getPreset("generic-75-ansi");

const KeyboardLab = forwardRef(({
  layout = DEFAULT_PRESET.layout,
  shell = DEFAULT_PRESET.shell,
  keycapPreset,
  keycapColor = "#2a2a2e",
  accentKeyColor = "#3d3d42",
  caseColor = "#1a1a1e",
  keycapOpacity = 1.0,
  legendPreset,
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
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 7, 9], fov: 40, near: 0.1, far: 100 }}
        onCreated={({ gl }) => { gl.setClearColor("#111115"); }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 4]} intensity={0.9} />
        <directionalLight position={[-4, 6, -3]} intensity={0.25} />
        <directionalLight position={[0, 2, -8]} intensity={0.15} />
        <Environment preset="apartment" />

        <KeyboardModel
          ref={modelRef}
          layout={layout}
          shell={shell}
          keycapPreset={keycapPreset}
          keycapColor={keycapColor}
          accentKeyColor={accentKeyColor}
          caseColor={caseColor}
          keycapOpacity={keycapOpacity}
        />
        <KeycapLabels
          layout={layout}
          keycapPreset={keycapPreset}
          legendPreset={legendPreset}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI * 0.05}
          maxPolarAngle={Math.PI * 0.42}
          minDistance={5}
          maxDistance={18}
          enableDamping
          dampingFactor={0.06}
          target={[0, 0.15, 0]}
        />
      </Canvas>
    </div>
  );
});

KeyboardLab.displayName = "KeyboardLab";

export default KeyboardLab;
