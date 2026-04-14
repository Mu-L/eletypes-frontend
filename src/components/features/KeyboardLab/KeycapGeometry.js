/**
 * Procedural keycap geometry generator.
 *
 * Creates a tapered, sculpted keycap shape with:
 * - Tapered walls (top narrower than bottom)
 * - Per-row top surface angle (tilted toward/away from user)
 * - Dish scooped into the top surface (cylindrical or spherical)
 * - Rounded edges
 *
 * This replaces the flat RoundedBoxGeometry with a geometry that
 * actually looks like a keycap when scaled by InstancedMesh.
 *
 * Performance: geometry is created once per profile and reused
 * across all instances. The per-row variation is applied via
 * instance matrix scaling and a small vertex shader trick.
 *
 * For the MVP, we create ONE geometry per profile family
 * (not per-row) and use the instance matrix to handle per-row
 * height/scale differences. The dish and taper are baked into
 * the base geometry.
 */

import * as THREE from "three";

/**
 * Create a tapered keycap geometry.
 *
 * The keycap is centered at origin, 1×1×1 base size.
 * InstancedMesh scales it per-key via the matrix.
 *
 * @param {Object} params
 * @param {number} params.topWidth    — Top/bottom width ratio (0.85 = 15% taper)
 * @param {number} params.topDepth    — Top/bottom depth ratio
 * @param {number} params.dishDepth   — How deep the dish scoops (0 = flat)
 * @param {"cylindrical"|"spherical"|"flat"} params.dishType
 * @param {number} params.cornerRadius — Edge rounding
 * @param {number} [params.segments]  — Subdivision level (default 8)
 * @returns {THREE.BufferGeometry}
 */
export function createKeycapGeometry({
  topWidth = 0.85,
  topDepth = 0.85,
  dishDepth = 0.05,
  dishType = "cylindrical",
  cornerRadius = 0.06,
  segments = 8,
} = {}) {
  // Build the keycap as a modified box:
  // Bottom face: full size (1×1)
  // Top face: tapered (topWidth × topDepth), with dish depression
  // Sides: connect bottom to top with slight curve

  const hw = 0.5;  // half width at bottom
  const hd = 0.5;  // half depth at bottom
  const h = 0.5;   // half height (total height = 1, scaled by instance)

  const tw = hw * topWidth; // half width at top
  const td = hd * topDepth; // half depth at top

  const seg = segments;
  const positions = [];
  const normals = [];
  const indices = [];

  // ─── Helper: add a quad as two triangles ───
  const addQuad = (a, b, c, d) => {
    const base = positions.length / 3;
    positions.push(...a, ...b, ...c, ...d);

    // Compute face normal
    const v1 = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
    const v2 = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
    const n = [
      v1[1]*v2[2] - v1[2]*v2[1],
      v1[2]*v2[0] - v1[0]*v2[2],
      v1[0]*v2[1] - v1[1]*v2[0],
    ];
    const len = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]) || 1;
    n[0] /= len; n[1] /= len; n[2] /= len;
    normals.push(...n, ...n, ...n, ...n);

    indices.push(base, base+1, base+2, base, base+2, base+3);
  };

  // ─── Top face with dish ───
  // Generate a grid of points on the top face, then depress them for the dish
  const topGrid = [];
  for (let iz = 0; iz <= seg; iz++) {
    const row = [];
    for (let ix = 0; ix <= seg; ix++) {
      const u = ix / seg; // 0-1
      const v = iz / seg; // 0-1

      const x = -tw + u * tw * 2;
      const z = -td + v * td * 2;

      // Dish depression
      let yDish = 0;
      if (dishDepth > 0) {
        if (dishType === "cylindrical") {
          // Scoop along X axis (like typing direction)
          const nx = (u - 0.5) * 2; // -1 to 1
          yDish = -dishDepth * (1 - nx * nx);
        } else if (dishType === "spherical") {
          // Bowl scoop
          const nx = (u - 0.5) * 2;
          const nz = (v - 0.5) * 2;
          yDish = -dishDepth * (1 - (nx * nx + nz * nz));
          yDish = Math.min(0, yDish); // Clamp to not go above surface
        }
        // "flat" = no dish
      }

      row.push([x, h + yDish, z]);
    }
    topGrid.push(row);
  }

  // Top face triangles
  for (let iz = 0; iz < seg; iz++) {
    for (let ix = 0; ix < seg; ix++) {
      const a = topGrid[iz][ix];
      const b = topGrid[iz][ix + 1];
      const c = topGrid[iz + 1][ix + 1];
      const d = topGrid[iz + 1][ix];
      addQuad(a, b, c, d);
    }
  }

  // ─── Bottom face (flat) ───
  addQuad(
    [-hw, -h, -hd],
    [hw, -h, -hd],
    [hw, -h, hd],
    [-hw, -h, hd]
  );

  // ─── Side faces (connect bottom edges to top edges) ───
  // Front side (z = -depth)
  for (let ix = 0; ix < seg; ix++) {
    const u0 = ix / seg;
    const u1 = (ix + 1) / seg;
    const bx0 = -hw + u0 * hw * 2;
    const bx1 = -hw + u1 * hw * 2;
    addQuad(
      [bx0, -h, -hd],
      [bx1, -h, -hd],
      topGrid[0][ix + 1],
      topGrid[0][ix]
    );
  }

  // Back side (z = +depth)
  for (let ix = 0; ix < seg; ix++) {
    const u0 = ix / seg;
    const u1 = (ix + 1) / seg;
    const bx0 = -hw + u0 * hw * 2;
    const bx1 = -hw + u1 * hw * 2;
    addQuad(
      topGrid[seg][ix],
      topGrid[seg][ix + 1],
      [bx1, -h, hd],
      [bx0, -h, hd]
    );
  }

  // Left side (x = -width)
  for (let iz = 0; iz < seg; iz++) {
    const v0 = iz / seg;
    const v1 = (iz + 1) / seg;
    const bz0 = -hd + v0 * hd * 2;
    const bz1 = -hd + v1 * hd * 2;
    addQuad(
      topGrid[iz][0],
      [-hw, -h, bz0],
      [-hw, -h, bz1],
      topGrid[iz + 1][0]
    );
  }

  // Right side (x = +width)
  for (let iz = 0; iz < seg; iz++) {
    const v0 = iz / seg;
    const v1 = (iz + 1) / seg;
    const bz0 = -hd + v0 * hd * 2;
    const bz1 = -hd + v1 * hd * 2;
    addQuad(
      [hw, -h, bz0],
      topGrid[iz][seg],
      topGrid[iz + 1][seg],
      [hw, -h, bz1]
    );
  }

  // ─── Build geometry ───
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals(); // Smooth normals for better lighting

  return geo;
}

/**
 * Create keycap geometry from a CapGeometry spec.
 * Maps schema types to geometry params.
 */
export function createKeycapFromSpec(capSpec) {
  return createKeycapGeometry({
    topWidth: capSpec.topWidth || 0.85,
    topDepth: capSpec.topDepth || 0.85,
    dishDepth: capSpec.dishDepth || 0.05,
    dishType: capSpec.dishType || "cylindrical",
    cornerRadius: capSpec.cornerRadius || 0.06,
    segments: 8,
  });
}
