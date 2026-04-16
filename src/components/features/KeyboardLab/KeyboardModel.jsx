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
import { computeBounds, buildKeyIndex, isAccentKey, extractKeys } from "./schema/derive";
import { DEFAULT_SHELL } from "./schema/shellProfile";
import { createKeycapFromSpec } from "./KeycapGeometry";

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

// Row detection from Y position (matches normalization layer)
const yToRow = (y) => {
  if (y < 1.0) return 0;
  if (y < 2.0) return 1;
  if (y < 3.0) return 2;
  if (y < 4.0) return 3;
  if (y < 5.0) return 4;
  return 5;
};

const KeyboardModel = forwardRef(({
  layout,          // BoardLayout object (or just the keys array for backwards compat)
  shell,           // Optional ShellProfile
  keycapPreset,    // Optional KeycapPreset — drives per-row sculpting
  keycapColor,
  accentKeyColor,
  caseColor,
  keycapOpacity = 1.0,
}, ref) => {
  const meshRef = useRef();
  const { invalidate } = useThree();

  // ─── Normalize inputs (handles full preset, { keys }, or raw array) ───
  const keys = useMemo(() => extractKeys(layout), [layout]);
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

  // ─── Case dimensions (needed before rest positions for slope calc) ───
  const caseW = bounds.width + shellConfig.paddingLeft + shellConfig.paddingRight;
  const caseD = bounds.height + shellConfig.paddingTop + shellConfig.paddingBottom;
  const caseCenterZ = (shellConfig.paddingTop - shellConfig.paddingBottom) / 2;

  // ─── Rest positions (with per-row sculpting + slope following) ───
  const restPositions = useMemo(() => {
    const profile = keycapPreset?.profile;
    const rowsData = (!profile?.uniform && profile?.rows) ? profile.rows : null;
    const baseH = profile?.defaultCap?.height || KEY_HEIGHT;

    // For wedge cases: compute the top surface Y at each Z position
    // Top surface slopes from backTopY at -hd to frontTopY at +hd
    const tiltAngle = (shellConfig.tilt || 0) * Math.PI / 180;
    const hasSlope = tiltAngle > 0;
    const hd = caseD / 2;
    const backTopY = hasSlope ? shellConfig.height + Math.tan(tiltAngle) * caseD : 0;
    const frontTopY = hasSlope ? shellConfig.height * 0.25 : 0;

    return keys.map((key) => {
      const row = yToRow(key.y);
      const sculpt = rowsData?.[row];
      const capH = sculpt ? baseH * sculpt.height : baseH;

      const x = (key.x + key.w / 2) - centerX;
      const z = (key.y + (key.h || 1) / 2) - centerZ;

      // Interpolate the surface Y at this key's Z position
      let surfaceY = PLATE_Y;
      if (hasSlope) {
        const t = (z + hd) / caseD; // 0 = back (-hd), 1 = front (+hd)
        surfaceY = backTopY + t * (frontTopY - backTopY) + PLATE_Y;
      }

      return {
        x,
        y: surfaceY + capH / 2,
        z,
        sx: key.w - KEY_GAP,
        sy: capH,
        sz: (key.h || 1) - KEY_GAP,
      };
    });
  }, [keys, centerX, centerZ, keycapPreset, shellConfig, caseD]);

  // ─── Keycap geometry: sculpted from profile data ───
  // Creates tapered shape with dish based on the active profile's defaultCap.
  // One geometry shared across all instances (per-row variation via matrix scale).
  const geometry = useMemo(() => {
    const capSpec = keycapPreset?.profile?.defaultCap;
    if (capSpec) {
      return createKeycapFromSpec(capSpec);
    }
    // Fallback: basic rounded box if no keycap preset
    return new RoundedBoxGeometry(1, 1, 1, KEY_SEGMENTS, KEY_BEVEL);
  }, [keycapPreset]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.05,
      envMapIntensity: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
    }),
    []
  );

  const setKeyMatrix = (index, yOffset) => {
    const rest = restPositions[index];
    if (!rest) return;
    _pos.set(rest.x, rest.y + yOffset, rest.z);
    _scale.set(rest.sx, rest.sy, rest.sz);
    _mat4.compose(_pos, _quat, _scale);
    meshRef.current.setMatrixAt(index, _mat4);
  };

  // ─── Update opacity ───
  useEffect(() => {
    material.opacity = keycapOpacity;
    material.needsUpdate = true;
    invalidate();
  }, [keycapOpacity, material, invalidate]);

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
  }, [keycapColor, accentKeyColor, keys, keyCount, keycapPreset, invalidate]);

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
    // Expose animation offsets so labels can follow key press movement
    getOffsets: () => offsets.current,
  }), [keyIndex, invalidate]);


  const caseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.2, metalness: 0.9, envMapIntensity: 1.0 }),
    [caseColor]
  );
  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.35, metalness: 0.85 }),
    [caseColor]
  );

  const tilt = shellConfig.tilt || 0;
  const tiltRad = (tilt * Math.PI) / 180;

  /*
   * Cyberboard wedge: right-trapezoid cross-section
   *
   * Side view:
   *       back ─────── sloped top ──── front
   *        │                            │
   *        │         (keys here)        │ thin
   *  tall  │                            │
   *        │                            │
   *        └──── flat bottom ───────────┘
   *
   * - Bottom is flat (sits on desk)
   * - Back wall is tall and vertical
   * - Top surface slopes from back (high) to front (low)
   * - Front wall is short and vertical
   */
  const wedgeGeo = useMemo(() => {
    if (tilt <= 0) return null;
    const hw = caseW / 2;
    const hd = caseD / 2;
    // Back top = high, front top = low. Bottom is flat at y=0.
    const backTopY = shellConfig.height + Math.tan(tiltRad) * caseD;
    const frontTopY = shellConfig.height * 0.25; // Thin front lip

    const verts = new Float32Array([
      // Front face (short vertical, +Z)
      -hw,  0,          hd,   // 0 bottom-left-front
       hw,  0,          hd,   // 1 bottom-right-front
       hw,  frontTopY,  hd,   // 2 top-right-front
      -hw,  frontTopY,  hd,   // 3 top-left-front
      // Back face (tall vertical, -Z)
      -hw,  0,          -hd,  // 4 bottom-left-back
       hw,  0,          -hd,  // 5 bottom-right-back
       hw,  backTopY,   -hd,  // 6 top-right-back
      -hw,  backTopY,   -hd,  // 7 top-left-back
    ]);
    const idx = [
      // Front (short wall)
      0, 1, 2,  0, 2, 3,
      // Back (tall wall)
      5, 4, 7,  5, 7, 6,
      // Top (sloped surface — keys sit here)
      3, 2, 6,  3, 6, 7,
      // Bottom (flat, on the desk)
      4, 5, 1,  4, 1, 0,
      // Left side
      4, 0, 3,  4, 3, 7,
      // Right side
      1, 5, 6,  1, 6, 2,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, [tilt, tiltRad, shellConfig.height, caseW, caseD]);

  if (keyCount === 0) return null;

  /*
   * For wedge/tilted shells (Cyberboard):
   * The entire group (case + plate + keys + labels) tilts together.
   * The case is a wedge shape underneath, and everything on top
   * sits on the sloped surface — like a Cybertruck hood.
   *
   * Tilt pivot: front edge of the case (positive Z).
   * This keeps the front lip at desk level while the back rises.
   */
  const pivotZ = caseD / 2 + caseCenterZ; // front edge Z

  return (
    <group>
      {/* Case body */}
      {tilt > 0 && wedgeGeo ? (
        <mesh position={[0, 0, caseCenterZ]}>
          <primitive object={wedgeGeo} attach="geometry" />
          <primitive object={caseMat} attach="material" />
        </mesh>
      ) : (
        <mesh position={[0, -shellConfig.height / 2, caseCenterZ]}>
          <roundedBoxGeometry args={[caseW, shellConfig.height, caseD, 2, shellConfig.cornerRadius]} />
          <primitive object={caseMat} attach="material" />
        </mesh>
      )}

      {/* Instanced keycaps — positioned on the sloped surface */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, keyCount]}
        key={keyCount}
        frustumCulled={false}
      />
    </group>
  );
});

KeyboardModel.displayName = "KeyboardModel";

export default KeyboardModel;
