/**
 * Extrude a 2D profile into 3D case geometry.
 *
 * Profile coordinate system:
 *   profile x → 3D Z (front=0 to back=max)
 *   profile y → 3D Y (height)
 *   extrusion → 3D X (left/right width)
 *
 * Each point can have an optional `d` (depth offset) for creating
 * ramps, chamfers, and bevels — the point gets extruded at a different
 * width than the main body.
 */

import * as THREE from "three";

/**
 * @param {Array<{x: number, y: number, d?: number}>} profilePoints
 * @param {number} width — total case width in world units
 * @param {number} depth — total case depth in world units
 * @param {number} maxHeight — maps max profile Y to this world height
 * @returns {THREE.BufferGeometry}
 */
export function extrudeCaseProfile(profilePoints, width, depth, maxHeight) {
  if (profilePoints.length < 3) return new THREE.BufferGeometry();

  const hw = width / 2;

  // Normalize profile to world coordinates
  const maxPX = Math.max(...profilePoints.map((p) => p.x)) || 1;
  const maxPY = Math.max(...profilePoints.map((p) => p.y)) || 1;
  const scaleZ = depth / maxPX;
  const scaleY = maxHeight / maxPY;

  const wp = profilePoints.map((p) => ({
    z: (p.x * scaleZ) - depth / 2,
    y: p.y * scaleY,
    // Per-vertex width offset: d=0 means full width, d>0 means narrower at this vertex
    hwLocal: hw - (p.d || 0) * (width / 100),
  }));

  const n = wp.length;
  const verts = [];
  const idx = [];

  // ─── Side faces: connect consecutive profile points as quads ───
  // Each edge of the profile becomes a quad (4 verts: left-i, right-i, right-j, left-j)
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const base = verts.length / 3;
    const pi = wp[i], pj = wp[j];

    // Quad: left-i, right-i, right-j, left-j
    verts.push(-pi.hwLocal, pi.y, pi.z);  // 0
    verts.push( pi.hwLocal, pi.y, pi.z);  // 1
    verts.push( pj.hwLocal, pj.y, pj.z);  // 2
    verts.push(-pj.hwLocal, pj.y, pj.z);  // 3

    // Two triangles — outward-facing (determine by cross product)
    // We want the normal to face outward from the polygon
    idx.push(base, base + 1, base + 2);
    idx.push(base, base + 2, base + 3);
  }

  // ─── Left cap face (x = -hw side) ───
  // Collect all left-side vertices and triangulate with fan from centroid
  const leftBase = verts.length / 3;
  let cy = 0, cz = 0;
  for (const p of wp) { cy += p.y; cz += p.z; }
  cy /= n; cz /= n;
  verts.push(-hw, cy, cz); // centroid
  for (const p of wp) verts.push(-p.hwLocal, p.y, p.z);
  for (let i = 0; i < n; i++) {
    const a = leftBase;
    const b = leftBase + 1 + i;
    const c = leftBase + 1 + ((i + 1) % n);
    // CCW when viewed from -X (outside)
    idx.push(a, c, b);
  }

  // ─── Right cap face (x = +hw side) ───
  const rightBase = verts.length / 3;
  verts.push(hw, cy, cz); // centroid
  for (const p of wp) verts.push(p.hwLocal, p.y, p.z);
  for (let i = 0; i < n; i++) {
    const a = rightBase;
    const b = rightBase + 1 + i;
    const c = rightBase + 1 + ((i + 1) % n);
    // CCW when viewed from +X (outside)
    idx.push(a, b, c);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  // Double-sided to avoid any winding issues
  return geo;
}

/**
 * Compute the mount surface: a line segment on the top of the case
 * where keys should be placed.
 *
 * Returns { startY, startZ, endY, endZ, angle } in world coordinates,
 * representing where the key field mounts.
 *
 * @param {Array<{x: number, y: number}>} profilePoints
 * @param {number[]} mountEdge — [fromIndex, toIndex]
 * @param {number} depth
 * @param {number} maxHeight
 * @returns {{ startY, startZ, endY, endZ, angle }}
 */
export function computeMountSurface(profilePoints, mountEdge, depth, maxHeight) {
  const maxPX = Math.max(...profilePoints.map((p) => p.x)) || 1;
  const maxPY = Math.max(...profilePoints.map((p) => p.y)) || 1;
  const scaleZ = depth / maxPX;
  const scaleY = maxHeight / maxPY;

  const from = profilePoints[mountEdge[0]];
  const to = profilePoints[mountEdge[1]];

  const startZ = (from.x * scaleZ) - depth / 2;
  const startY = from.y * scaleY;
  const endZ = (to.x * scaleZ) - depth / 2;
  const endY = to.y * scaleY;

  const dz = endZ - startZ;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dz);

  return { startY, startZ, endY, endZ, angle };
}

/**
 * Convert profile to shell schema JSON.
 */
export function profileToShellSchema({ name, profilePoints, mountEdge }) {
  return {
    schema: "eletypes-shell/1",
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    meta: { name },
    profile: {
      points: profilePoints,
      mountEdge,
    },
  };
}
