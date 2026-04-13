/**
 * KeyboardModel — 3D keyboard with instanced keycaps and spring animation.
 *
 * Consumes the explicit layout from keyboardLayout.js.
 * Each key has absolute (x, y, w, h) — no implicit positioning.
 *
 * Performance: see previous revision notes (unchanged architecture).
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
import {
  KEYBOARD_LAYOUT,
  LAYOUT_BOUNDS,
  KEY_INDEX_MAP,
  isAccentKey,
} from "./keyboardLayout";

extend({ RoundedBoxGeometry });

// ─── Animation tuning ───
const STIFFNESS = 600;
const DAMPING = 50;
const PRESS_DEPTH = 0.18;
const SETTLE_THRESHOLD = 0.0005;
const MAX_DELTA = 0.04;

// ─── Geometry tuning ───
const KEY_GAP = 0.08;       // Gap between keys (subtracted from key size)
const KEY_HEIGHT = 0.38;    // Keycap thickness (Y axis)
const KEY_BEVEL = 0.06;     // Corner radius
const KEY_SEGMENTS = 2;     // Bevel segments
const CASE_PADDING = 0.4;   // Case extends beyond key area
const CASE_HEIGHT = 0.25;   // Case body thickness
const CASE_BEVEL = 0.08;    // Case corner radius
const PLATE_Y = 0.02;       // Mounting plate height

const KeyboardModel = forwardRef(({ keycapColor, accentKeyColor, caseColor }, ref) => {
  const meshRef = useRef();
  const { invalidate } = useThree();

  const keyCount = KEYBOARD_LAYOUT.length;

  // ─── Center offset: computed from actual layout bounds ───
  const centerX = LAYOUT_BOUNDS.width / 2;
  const centerZ = LAYOUT_BOUNDS.height / 2;

  // ─── Animation state: typed arrays for hot-path performance ───
  const offsets = useRef(new Float32Array(keyCount));
  const velocities = useRef(new Float32Array(keyCount));
  const activeSet = useRef(new Set());

  // ─── Pre-allocated objects for matrix composition (zero GC in hot path) ───
  const _mat4 = useMemo(() => new THREE.Matrix4(), []);
  const _pos = useMemo(() => new THREE.Vector3(), []);
  const _quat = useMemo(() => new THREE.Quaternion(), []);
  const _scale = useMemo(() => new THREE.Vector3(), []);

  // ─── Pre-compute rest positions from explicit layout data ───
  const restPositions = useMemo(() => {
    return KEYBOARD_LAYOUT.map((key) => ({
      // Center of key = key.x + half width, shifted to center at origin
      x: (key.x + key.w / 2) - centerX,
      y: KEY_HEIGHT / 2 + PLATE_Y,
      // key.y is the explicit row position (includes gaps)
      z: (key.y + key.h / 2) - centerZ,
      // Scale: key dimensions minus gap
      sx: key.w - KEY_GAP,
      sz: key.h - KEY_GAP,
    }));
  }, [centerX, centerZ]);

  // ─── Geometry and material ───
  const geometry = useMemo(
    () => new RoundedBoxGeometry(1, 1, 1, KEY_SEGMENTS, KEY_BEVEL),
    []
  );

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.05,
      envMapIntensity: 0.4,
    }),
    []
  );

  // ─── Set one instance's matrix ───
  const setKeyMatrix = (index, yOffset) => {
    const rest = restPositions[index];
    _pos.set(rest.x, rest.y + yOffset, rest.z);
    _scale.set(rest.sx, KEY_HEIGHT, rest.sz);
    _mat4.compose(_pos, _quat, _scale);
    meshRef.current.setMatrixAt(index, _mat4);
  };

  // ─── Build instances on mount and color change ───
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const regularColor = new THREE.Color(keycapColor);
    const accentColor = new THREE.Color(accentKeyColor);

    for (let i = 0; i < keyCount; i++) {
      setKeyMatrix(i, 0);
      mesh.setColorAt(i, isAccentKey(KEYBOARD_LAYOUT[i]) ? accentColor : regularColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycapColor, accentKeyColor, keyCount, invalidate]);

  // ─── Animation loop ───
  useFrame((_, delta) => {
    const active = activeSet.current;
    if (active.size === 0) return;

    const dt = Math.min(delta, MAX_DELTA);
    const offs = offsets.current;
    const vels = velocities.current;
    const toRemove = [];

    for (const i of active) {
      const springForce = -STIFFNESS * offs[i];
      const dampForce = -DAMPING * vels[i];
      vels[i] += (springForce + dampForce) * dt;
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
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (active.size > 0) invalidate();
  });

  // ─── Imperative API ───
  useImperativeHandle(ref, () => ({
    triggerKey: (keyName) => {
      const index = KEY_INDEX_MAP.get(keyName);
      if (index === undefined) return;
      offsets.current[index] = -PRESS_DEPTH;
      velocities.current[index] = 0;
      activeSet.current.add(index);
      invalidate();
    },
  }), [invalidate]);

  // ─── Case dimensions from actual layout bounds ───
  const caseW = LAYOUT_BOUNDS.width + CASE_PADDING * 2;
  const caseD = LAYOUT_BOUNDS.height + CASE_PADDING * 2;

  const caseMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: caseColor,
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 1.0,
    }),
    [caseColor]
  );

  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: caseColor,
      roughness: 0.35,
      metalness: 0.85,
    }),
    [caseColor]
  );

  return (
    <group>
      {/* Case body */}
      <mesh position={[0, -CASE_HEIGHT / 2, 0]}>
        <roundedBoxGeometry args={[caseW, CASE_HEIGHT, caseD, 2, CASE_BEVEL]} />
        <primitive object={caseMat} attach="material" />
      </mesh>

      {/* Dark mounting plate recess */}
      <mesh position={[0, PLATE_Y / 2, 0]}>
        <boxGeometry args={[caseW - 0.3, PLATE_Y, caseD - 0.3]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Case top rim */}
      <mesh position={[0, PLATE_Y, 0]}>
        <roundedBoxGeometry args={[caseW - 0.08, 0.015, caseD - 0.08, 1, 0.005]} />
        <primitive object={plateMat} attach="material" />
      </mesh>

      {/* Instanced keycaps */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, keyCount]}
        frustumCulled={false}
      />
    </group>
  );
});

KeyboardModel.displayName = "KeyboardModel";

export default KeyboardModel;
