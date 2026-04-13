/**
 * KeyboardModel — 3D keyboard renderer driven by BoardLayout + ShellProfile data.
 *
 * Accepts any valid BoardLayout and optional ShellProfile as props.
 * The same JSON that drives the 2D editor also drives this 3D renderer.
 */

import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { computeBounds, buildKeyIndex, isAccentKey } from "./schema/derive";
import { DEFAULT_SHELL } from "./schema/shellProfile";

extend({ RoundedBoxGeometry });

// ─── Animation tuning ───
const STIFFNESS = 600;
const DAMPING = 50;
const PRESS_DEPTH = 0.18;
const SETTLE_THRESHOLD = 0.0005;
const MAX_DELTA = 0.04;

// ─── Geometry tuning ───
const KEY_GAP = 0.08;
const KEY_HEIGHT = 0.38;
const KEY_BEVEL = 0.06;
const KEY_SEGMENTS = 2;
const PLATE_Y = 0.02;

const KeyboardModel = forwardRef(({
  layout,          // BoardLayout object (or just the keys array for backwards compat)
  shell,           // Optional ShellProfile
  keycapColor,
  accentKeyColor,
  caseColor,
}, ref) => {
  const meshRef = useRef();
  const { invalidate } = useThree();

  // ─── Normalize inputs ───
  const keys = useMemo(
    () => (Array.isArray(layout) ? layout : layout?.keys || []),
    [layout]
  );
  const shellConfig = shell?.case || DEFAULT_SHELL.case;
  const plateConfig = shell?.plate || DEFAULT_SHELL.plate;

  const keyCount = keys.length;
  const bounds = useMemo(() => computeBounds(keys), [keys]);
  const keyIndex = useMemo(() => buildKeyIndex(keys), [keys]);

  const centerX = bounds.width / 2;
  const centerZ = bounds.height / 2;

  // ─── Animation state ───
  const offsets = useRef(new Float32Array(keyCount));
  const velocities = useRef(new Float32Array(keyCount));
  const activeSet = useRef(new Set());

  // Reset animation state when layout changes
  useEffect(() => {
    offsets.current = new Float32Array(keyCount);
    velocities.current = new Float32Array(keyCount);
    activeSet.current.clear();
  }, [keyCount]);

  // ─── Pre-allocated objects ───
  const _mat4 = useMemo(() => new THREE.Matrix4(), []);
  const _pos = useMemo(() => new THREE.Vector3(), []);
  const _quat = useMemo(() => new THREE.Quaternion(), []);
  const _scale = useMemo(() => new THREE.Vector3(), []);

  // ─── Rest positions ───
  const restPositions = useMemo(() => {
    return keys.map((key) => ({
      x: (key.x + key.w / 2) - centerX,
      y: KEY_HEIGHT / 2 + PLATE_Y,
      z: (key.y + (key.h || 1) / 2) - centerZ,
      sx: key.w - KEY_GAP,
      sz: (key.h || 1) - KEY_GAP,
    }));
  }, [keys, centerX, centerZ]);

  const geometry = useMemo(
    () => new RoundedBoxGeometry(1, 1, 1, KEY_SEGMENTS, KEY_BEVEL),
    []
  );
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, envMapIntensity: 0.4 }),
    []
  );

  const setKeyMatrix = (index, yOffset) => {
    const rest = restPositions[index];
    if (!rest) return;
    _pos.set(rest.x, rest.y + yOffset, rest.z);
    _scale.set(rest.sx, KEY_HEIGHT, rest.sz);
    _mat4.compose(_pos, _quat, _scale);
    meshRef.current.setMatrixAt(index, _mat4);
  };

  // ─── Build instances ───
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || keyCount === 0) return;

    const regularColor = new THREE.Color(keycapColor);
    const accentColor = new THREE.Color(accentKeyColor);

    for (let i = 0; i < keyCount; i++) {
      setKeyMatrix(i, 0);
      mesh.setColorAt(i, isAccentKey(keys[i]) ? accentColor : regularColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycapColor, accentKeyColor, keys, keyCount, invalidate]);

  // ─── Animation loop ───
  useFrame((_, delta) => {
    const active = activeSet.current;
    if (active.size === 0) return;

    const dt = Math.min(delta, MAX_DELTA);
    const offs = offsets.current;
    const vels = velocities.current;
    const toRemove = [];

    for (const i of active) {
      const sf = -STIFFNESS * offs[i];
      const df = -DAMPING * vels[i];
      vels[i] += (sf + df) * dt;
      offs[i] += vels[i] * dt;

      if (Math.abs(offs[i]) < SETTLE_THRESHOLD && Math.abs(vels[i]) < SETTLE_THRESHOLD) {
        offs[i] = 0;
        vels[i] = 0;
        setKeyMatrix(i, 0);
        toRemove.push(i);
      } else {
        setKeyMatrix(i, offs[i]);
      }
    }

    for (const i of toRemove) active.delete(i);
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
    if (active.size > 0) invalidate();
  });

  // ─── Imperative API ───
  useImperativeHandle(ref, () => ({
    triggerKey: (keyName) => {
      const index = keyIndex.get(keyName);
      if (index === undefined) return;
      offsets.current[index] = -PRESS_DEPTH;
      velocities.current[index] = 0;
      activeSet.current.add(index);
      invalidate();
    },
  }), [keyIndex, invalidate]);

  // ─── Case dimensions from shell profile ───
  const caseW = bounds.width + shellConfig.paddingLeft + shellConfig.paddingRight;
  const caseD = bounds.height + shellConfig.paddingTop + shellConfig.paddingBottom;
  // Offset case center if padding is asymmetric (e.g., Cyberboard thick bottom)
  const caseCenterZ = (shellConfig.paddingTop - shellConfig.paddingBottom) / 2;

  const caseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.2, metalness: 0.9, envMapIntensity: 1.0 }),
    [caseColor]
  );
  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.35, metalness: 0.85 }),
    [caseColor]
  );

  if (keyCount === 0) return null;

  return (
    <group>
      <mesh position={[0, -shellConfig.height / 2, caseCenterZ]}>
        <roundedBoxGeometry args={[caseW, shellConfig.height, caseD, 2, shellConfig.cornerRadius]} />
        <primitive object={caseMat} attach="material" />
      </mesh>
      <mesh position={[0, plateConfig.height / 2, caseCenterZ]}>
        <boxGeometry args={[caseW - plateConfig.inset * 2, plateConfig.height, caseD - plateConfig.inset * 2]} />
        <meshStandardMaterial color={plateConfig.color} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, PLATE_Y, caseCenterZ]}>
        <roundedBoxGeometry args={[caseW - 0.08, 0.015, caseD - 0.08, 1, 0.005]} />
        <primitive object={plateMat} attach="material" />
      </mesh>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, keyCount]}
        key={keyCount} // Force remount if key count changes between presets
        frustumCulled={false}
      />
    </group>
  );
});

KeyboardModel.displayName = "KeyboardModel";

export default KeyboardModel;
