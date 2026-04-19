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
import { computeBounds, buildKeyIndex, isAccentKey, extractKeys, parseLegendPosition } from "./schema/derive";
import { DEFAULT_SHELL } from "./schema/shellProfile";
import { createKeycapFromSpec } from "./KeycapGeometry";
import { extrudeCaseProfile, computeMountSurface, extrudeEdgeStrip } from "./CaseEditor/extrudeProfile";
import { Text } from "@react-three/drei";

extend({ RoundedBoxGeometry });

// Map the CSS font-family values stored in legendPreset.style.fontFamily to
// actual TTF URLs that troika-three-text can load. The default troika font
// (Roboto subset) lacks arrows (↑↓←→) and Apple glyphs (⌘ ⌥ ⇧ ⌫), so layouts
// like HHKB and any keyboard with arrow keys rendered as .notdef squares.
// DejaVu covers Latin, arrows, box drawing, and the Apple command symbols.
const FONT_URL_MAP = {
  "Arial, sans-serif":          "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf",
  "Courier New, monospace":     "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSansMono.ttf",
  "Tomorrow, monospace":        "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSerif.ttf",
  "Helvetica Neue, Arial, sans-serif": "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf",
  "Courier New, Courier, monospace":   "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSansMono.ttf",
  "Tomorrow, Consolas, monospace":     "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSerif.ttf",
};
const DEFAULT_FONT_URL = "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf";
const resolveFontUrl = (family) => FONT_URL_MAP[family] || DEFAULT_FONT_URL;

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

const DEFAULT_OPACITY = { keycap: 1.0, accent: 1.0, case: 1.0, legend: 1.0 };

const KeyboardModel = forwardRef(({
  layout,          // BoardLayout object (or just the keys array for backwards compat)
  shell,           // Optional ShellProfile
  keycapPreset,    // Optional KeycapPreset — drives per-row sculpting
  keycapColor,
  accentKeyColor,
  caseColor,
  opacity: opacityProp,
  legendPreset,
  caseProfile,
  caseScale = 1.0,
  mountOffset = { x: 0, y: 0, z: 0 },
  mountFit = 0.85,
  extrudeWidth = 1.0,
}, ref) => {
  const opacity = { ...DEFAULT_OPACITY, ...opacityProp };
  const regularMeshRef = useRef();
  const accentMeshRef = useRef();
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

  // ─── Split keys into regular / accent groups ───
  const { regularIndices, accentIndices, meshMap } = useMemo(() => {
    const reg = [];
    const acc = [];
    const map = new Array(keyCount); // map[globalIndex] → { ref: 'regular'|'accent', instanceIndex }
    for (let i = 0; i < keyCount; i++) {
      if (isAccentKey(keys[i])) {
        map[i] = { group: "accent", idx: acc.length };
        acc.push(i);
      } else {
        map[i] = { group: "regular", idx: reg.length };
        reg.push(i);
      }
    }
    return { regularIndices: reg, accentIndices: acc, meshMap: map };
  }, [keys, keyCount]);

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
  // Case dimensions — scaled by caseScale for user adjustment
  const caseW = (bounds.width + shellConfig.paddingLeft + shellConfig.paddingRight) * caseScale;
  const caseD = (bounds.height + shellConfig.paddingTop + shellConfig.paddingBottom) * caseScale;
  const caseCenterZ = (shellConfig.paddingTop - shellConfig.paddingBottom) / 2 * caseScale;

  // ─── Shared profile scaling (used by BOTH case geo and mount surface) ───
  const profileScale = useMemo(() => {
    if (!caseProfile?.points || caseProfile.points.length < 3) return null;
    const maxPY = Math.max(...caseProfile.points.map(p => p.y)) || 1;
    return {
      maxHeight: (maxPY / 60) * 2.0,
      points: caseProfile.points,
      mountEdge: caseProfile.mountEdge,
    };
  }, [caseProfile]);

  // ─── Profile-based case geometry ───
  const profileCaseGeo = useMemo(() => {
    if (!profileScale) return null;
    return extrudeCaseProfile(profileScale.points, caseW * extrudeWidth, caseD, profileScale.maxHeight);
  }, [profileScale, caseW, caseD, extrudeWidth]);

  // ─── Colored edge strip geometries ───
  const edgeStrips = useMemo(() => {
    if (!profileScale || !caseProfile?.coloredEdges?.length) return [];
    return caseProfile.coloredEdges.map((edge) => ({
      geo: extrudeEdgeStrip(profileScale.points, edge.from, edge.to, caseW * extrudeWidth, caseD, profileScale.maxHeight),
      color: edge.color,
      emissive: edge.emissive ?? 0.5,
    }));
  }, [profileScale, caseProfile?.coloredEdges, caseW, caseD, extrudeWidth]);

  // ─── Mount surface from profile (same scaling as case geometry) ───
  const mountSurface = useMemo(() => {
    if (!profileScale || !profileScale.mountEdge) return null;
    const ms = computeMountSurface(profileScale.points, profileScale.mountEdge, caseD, profileScale.maxHeight);

    // mountFit: what proportion of the mount edge the key field occupies
    // 1.0 = keys span the full mount edge
    // 0.8 = keys occupy 80% of the edge, centered
    // >1.0 = keys extend beyond the edge (overflow)
    const margin = (1 - mountFit) / 2; // margin on each side

    return {
      ...ms,
      getY: (keyZ) => {
        // Map key Z range: +centerZ (front, low) → t=0, -centerZ (back, high) → t=1
        const keyRange = centerZ * 2;
        const rawT = keyRange !== 0 ? (centerZ - keyZ) / keyRange : 0.5;
        const t = margin + rawT * mountFit;
        const clampedT = Math.max(0, Math.min(1, t));
        return ms.startY + clampedT * (ms.endY - ms.startY) + (mountOffset.y || 0);
      },
    };
  }, [profileScale, caseD, centerZ, mountFit, mountOffset]);

  // ─── Rest positions (keys mount on the case surface) ───
  const restPositions = useMemo(() => {
    const profile = keycapPreset?.profile;
    const rowsData = (!profile?.uniform && profile?.rows) ? profile.rows : null;
    const baseH = profile?.defaultCap?.height || KEY_HEIGHT;

    const hd = caseD / 2;

    return keys.map((key) => {
      const row = yToRow(key.y);
      const sculpt = rowsData?.[row];
      const capH = sculpt ? baseH * sculpt.height : baseH;

      const x = (key.x + key.w / 2) - centerX + (mountOffset.x || 0);
      const z = (key.y + (key.h || 1) / 2) - centerZ + (mountOffset.z || 0);

      // Compute surface Y at this key's Z position (before X/Z offset for slope calc)
      const zForSlope = (key.y + (key.h || 1) / 2) - centerZ;
      let surfaceY = PLATE_Y;

      if (mountSurface) {
        surfaceY = mountSurface.getY(zForSlope) + PLATE_Y;
      } else if (shellConfig.tilt > 0) {
        // Shell tilt-based fallback
        const tiltAngle = shellConfig.tilt * Math.PI / 180;
        const backTopY = shellConfig.height + Math.tan(tiltAngle) * caseD;
        const frontTopY = shellConfig.height * 0.25;
        const t = (z + hd) / caseD;
        surfaceY = backTopY + t * (frontTopY - backTopY) + PLATE_Y;
      }

      // Compute tilt angle for the key to sit flush on the surface
      let tiltAngleX = 0;
      if (mountSurface) {
        tiltAngleX = mountSurface.angle; // Positive tilts key tops toward +Z (front/user)
      } else if (shellConfig.tilt > 0) {
        tiltAngleX = shellConfig.tilt * Math.PI / 180;
      }

      return {
        x,
        y: surfaceY + capH / 2 * Math.cos(tiltAngleX),
        z,
        sx: key.w - KEY_GAP,
        sy: capH,
        sz: (key.h || 1) - KEY_GAP,
        tiltX: tiltAngleX,
      };
    });
  }, [keys, centerX, centerZ, keycapPreset, mountSurface, shellConfig, caseD, mountOffset]);

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

  const regularMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      roughness: 0.4, metalness: 0.05, envMapIntensity: 0.4,
      side: THREE.DoubleSide,
    }),
    []
  );
  const accentMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      roughness: 0.4, metalness: 0.05, envMapIntensity: 0.4,
      side: THREE.DoubleSide,
    }),
    []
  );

  // Pre-allocated quaternion for key tilt
  const _tiltQuat = useMemo(() => new THREE.Quaternion(), []);

  const setKeyMatrix = (index, yOffset) => {
    const rest = restPositions[index];
    const entry = meshMap[index];
    if (!rest || !entry) return;
    _pos.set(rest.x, rest.y + yOffset, rest.z);
    _scale.set(rest.sx, rest.sy, rest.sz);
    if (rest.tiltX) {
      _tiltQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rest.tiltX);
      _mat4.compose(_pos, _tiltQuat, _scale);
    } else {
      _mat4.compose(_pos, _quat, _scale);
    }
    const mesh = entry.group === "accent" ? accentMeshRef.current : regularMeshRef.current;
    if (mesh) mesh.setMatrixAt(entry.idx, _mat4);
  };

  // ─── Update per-group opacity ───
  useEffect(() => {
    regularMaterial.opacity = opacity.keycap;
    regularMaterial.transparent = opacity.keycap < 1.0;
    regularMaterial.depthWrite = opacity.keycap >= 0.99;
    regularMaterial.needsUpdate = true;
    accentMaterial.opacity = opacity.accent;
    accentMaterial.transparent = opacity.accent < 1.0;
    accentMaterial.depthWrite = opacity.accent >= 0.99;
    accentMaterial.needsUpdate = true;
    invalidate();
  }, [opacity.keycap, opacity.accent, regularMaterial, accentMaterial, invalidate]);

  // ─── Build instances (split into regular + accent meshes) ───
  useEffect(() => {
    const regMesh = regularMeshRef.current;
    const accMesh = accentMeshRef.current;
    if (keyCount === 0) return;

    const regularColor = new THREE.Color(keycapColor);
    const accentColor = new THREE.Color(accentKeyColor);

    for (const gi of regularIndices) {
      setKeyMatrix(gi, 0);
      const entry = meshMap[gi];
      if (regMesh) regMesh.setColorAt(entry.idx, regularColor);
    }
    for (const gi of accentIndices) {
      setKeyMatrix(gi, 0);
      const entry = meshMap[gi];
      if (accMesh) accMesh.setColorAt(entry.idx, accentColor);
    }

    if (regMesh) {
      regMesh.instanceMatrix.needsUpdate = true;
      if (regMesh.instanceColor) regMesh.instanceColor.needsUpdate = true;
    }
    if (accMesh) {
      accMesh.instanceMatrix.needsUpdate = true;
      if (accMesh.instanceColor) accMesh.instanceColor.needsUpdate = true;
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycapColor, accentKeyColor, keys, keyCount, keycapPreset, mountSurface, restPositions, caseScale, mountOffset, mountFit, regularIndices, accentIndices, invalidate]);

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
    if (regularMeshRef.current) regularMeshRef.current.instanceMatrix.needsUpdate = true;
    if (accentMeshRef.current) accentMeshRef.current.instanceMatrix.needsUpdate = true;
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
    // Expose rest positions so labels can match key positions (mount surface, offsets, tilt)
    getRestPositions: () => restPositions,
    // Direct access for parent to read and pass as prop
    restPositions,
  }), [keyIndex, invalidate]);


  const caseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.2, metalness: 0.9, envMapIntensity: 1.0, side: THREE.DoubleSide }),
    [caseColor]
  );
  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caseColor, roughness: 0.35, metalness: 0.85 }),
    [caseColor]
  );

  // Update case opacity
  useEffect(() => {
    caseMat.opacity = opacity.case;
    caseMat.transparent = opacity.case < 1.0;
    caseMat.depthWrite = opacity.case >= 0.99;
    caseMat.needsUpdate = true;
    plateMat.opacity = opacity.case;
    plateMat.transparent = opacity.case < 1.0;
    plateMat.depthWrite = opacity.case >= 0.99;
    plateMat.needsUpdate = true;
    invalidate();
  }, [opacity.case, caseMat, plateMat, invalidate]);

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
      {/* Case body — profile-extruded, wedge, or flat box */}
      {profileCaseGeo ? (
        <mesh position={[0, 0, caseCenterZ]}>
          <primitive object={profileCaseGeo} attach="geometry" />
          <primitive object={caseMat} attach="material" />
        </mesh>
      ) : tilt > 0 && wedgeGeo ? (
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

      {/* Colored edge accent strips */}
      {edgeStrips.map((strip, i) => (
        <mesh key={`edge-${i}`} position={[0, 0, caseCenterZ]}>
          <primitive object={strip.geo} attach="geometry" />
          <meshStandardMaterial
            color={strip.color}
            emissive={strip.color}
            emissiveIntensity={strip.emissive}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Instanced keycaps — split into regular + accent for per-group opacity */}
      {regularIndices.length > 0 && (
        <instancedMesh
          ref={regularMeshRef}
          args={[geometry, regularMaterial, regularIndices.length]}
          key={`reg-${keyCount}`}
          frustumCulled={false}
        />
      )}
      {accentIndices.length > 0 && (
        <instancedMesh
          ref={accentMeshRef}
          args={[geometry, accentMaterial, accentIndices.length]}
          key={`acc-${keyCount}`}
          frustumCulled={false}
        />
      )}

      {/* Key legends — rendered here so they have direct access to restPositions.
          Legend position ("center", "top-left", "top-right", "bottom-left",
          "bottom-right", "top-center", "bottom-center") offsets the label anchor
          toward the matching corner/edge of the keycap top surface. Convention
          (see KeyboardModel above): world -Z is "top" (away from user), +Z is
          "bottom", -X is "left", +X is "right". Text is rotated -π/2 around X so
          its local +Y axis maps to world -Z — which means anchorY="top" anchors
          the text at the "top" (world -Z) edge, lining up with the offset. */}
      {legendPreset?.style?.fontSize > 0 && legendPreset?.style?.color !== "transparent" && (() => {
        const { anchorX, anchorY, offXFrac, offZFrac } = parseLegendPosition(legendPreset?.style?.position);
        const textAlign = anchorX === "left" ? "left" : anchorX === "right" ? "right" : "center";
        const fontUrl = resolveFontUrl(legendPreset?.style?.fontFamily);
        return (
          <group>
            {keys.map((key, i) => {
              const rest = restPositions[i];
              if (!rest) return null;
              const override = legendPreset?.keyOverrides?.[key.id];
              const displayLabel = override?.label ?? key.label;
              if (!displayLabel) return null;

              const baseSize = ((legendPreset?.style?.fontSize || 28) / 28) * 0.22;
              let fontSize = baseSize;
              if (displayLabel.length > 4) fontSize *= 0.6;
              else if (displayLabel.length > 2 && key.w < 1.5) fontSize *= 0.7;

              const color = override?.color || legendPreset?.style?.color || "#cccccc";
              const text = legendPreset?.style?.uppercase && displayLabel.length === 1
                ? displayLabel.toUpperCase() : displayLabel;

              const offX = offXFrac * rest.sx;
              const offZ = offZFrac * rest.sz;

              return (
                <group
                  key={key.id}
                  position={[rest.x + offX, rest.y + rest.sy / 2 + 0.005, rest.z + offZ]}
                  rotation={[rest.tiltX || 0, 0, 0]}
                >
                  <Text
                    font={fontUrl}
                    fontSize={fontSize}
                    color={color}
                    fillOpacity={opacity.legend}
                    anchorX={anchorX}
                    anchorY={anchorY}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontWeight={legendPreset?.style?.fontWeight || 700}
                    maxWidth={key.w * 0.8}
                    textAlign={textAlign}
                  >
                    {text}
                  </Text>
                </group>
              );
            })}
          </group>
        );
      })()}
    </group>
  );
});

KeyboardModel.displayName = "KeyboardModel";

export default KeyboardModel;
