/**
 * CaseProfileEditor — 2D parametric case cross-section editor.
 *
 * The user drags control points to shape the keyboard case side profile.
 * The profile is an array of {x, y} points defining the cross-section polygon.
 * The system extrudes this into 3D geometry.
 *
 * Built-in presets: flat box, wedge (Cyberboard), ergonomic curve.
 * Mount surface: the edge between two marked points where keys sit.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";

// ─── Default profiles ───

const PROFILE_PRESETS = {
  flat: {
    name: "Flat Box",
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 15 },
      { x: 0, y: 15 },
    ],
    mountEdge: [3, 2],
  },
  wedge: {
    name: "Cyberboard Wedge",
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 12 },
    ],
    mountEdge: [3, 2],
  },
  chamferedWedge: {
    name: "Chamfered Wedge",
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 45 },
      { x: 90, y: 50, d: 3 },  // back chamfer ramp (d = depth offset)
      { x: 10, y: 16, d: 3 },  // front chamfer ramp
      { x: 0, y: 12 },
    ],
    mountEdge: [5, 2],
  },
  ergo: {
    name: "Ergonomic",
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 35 },
      { x: 70, y: 28 },
      { x: 0, y: 18 },
    ],
    mountEdge: [4, 2],
  },
};

const CaseProfileEditor = ({ theme, onChange, initialProfile }) => {
  const svgRef = useRef(null);
  const [presetKey, setPresetKey] = useState("wedge");
  const [points, setPoints] = useState(initialProfile?.points || PROFILE_PRESETS.wedge.points);
  const [mountEdge, setMountEdge] = useState(initialProfile?.mountEdge || PROFILE_PRESETS.wedge.mountEdge);
  const [dragging, setDragging] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const text = theme?.text || "#e0e0e0";
  const accent = theme?.stats || "#6ec6ff";
  const bg = theme?.background || "#111115";

  // SVG coordinate system: x=0 left (front), x=100 right (back), y=0 bottom, y grows up
  // SVG renders y-flipped (y=0 at top), so we flip in rendering
  // SVG fills container width, height proportional
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(400);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((e) => setContainerW(e[0].contentRect.width));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  const svgW = Math.max(200, containerW - 16);
  const svgH = Math.round(svgW * 0.55);
  const padX = 30;
  const padY = 20;
  const scaleX = (svgW - padX * 2) / 100;
  const scaleY = (svgH - padY * 2) / 60; // max Y = 60

  const toSvg = (pt) => ({
    sx: padX + pt.x * scaleX,
    sy: svgH - padY - pt.y * scaleY, // flip Y
  });

  const fromSvg = (sx, sy) => ({
    x: Math.round(Math.max(0, Math.min(100, (sx - padX) / scaleX))),
    y: Math.round(Math.max(0, Math.min(60, (svgH - padY - sy) / scaleY))),
  });

  // Emit profile changes
  useEffect(() => {
    if (onChange) {
      onChange({ points, mountEdge });
    }
  }, [points, mountEdge, onChange]);

  const applyPreset = (key) => {
    setPresetKey(key);
    setPoints([...PROFILE_PRESETS[key].points]);
    setMountEdge([...PROFILE_PRESETS[key].mountEdge]);
  };

  // ─── Drag handling ───
  const handleMouseDown = (idx, e) => {
    e.preventDefault();
    setDragging(idx);
    setSelectedPoint(idx);
  };

  const handleMouseMove = useCallback((e) => {
    if (dragging === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const pt = fromSvg(sx, sy);
    setPoints((prev) => {
      const next = [...prev];
      next[dragging] = pt;
      return next;
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Add point: click the "+" button or double-click near an edge
  const addPointOnEdge = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const click = fromSvg(e.clientX - rect.left, e.clientY - rect.top);

    // Find the closest edge (segment between consecutive points)
    let minDist = Infinity, bestEdge = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const a = points[i], b = points[j];
      // Distance from click to line segment a→b
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      let t = len2 > 0 ? ((click.x - a.x) * dx + (click.y - a.y) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + t * dx, py = a.y + t * dy;
      const d = Math.hypot(click.x - px, click.y - py);
      if (d < minDist) { minDist = d; bestEdge = i; }
    }

    // Insert the new point after bestEdge
    const a = points[bestEdge];
    const b = points[(bestEdge + 1) % points.length];
    const newPt = { x: Math.round((a.x + b.x) / 2), y: Math.round((a.y + b.y) / 2) };
    const next = [...points];
    next.splice(bestEdge + 1, 0, newPt);
    setPoints(next);
  }, [points]);

  // Remove point on right-click (keep min 3)
  const handleRightClick = (idx, e) => {
    e.preventDefault();
    if (points.length <= 3) return;
    setPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  // Build SVG polygon path
  const pathD = points.map((pt, i) => {
    const { sx, sy } = toSvg(pt);
    return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
  }).join(" ") + " Z";

  // Mount surface line
  const mountFrom = toSvg(points[mountEdge[0]]);
  const mountTo = toSvg(points[mountEdge[1]]);

  const sel = { background: "#1a1a1e", color: text, border: `1px solid ${text}33`, borderRadius: "3px", padding: "2px 6px", fontSize: "11px" };
  const btn = { background: "transparent", border: `1px solid ${accent}44`, borderRadius: "4px", color: text, padding: "3px 8px", cursor: "pointer", fontSize: "10px" };

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Preset selector */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: text, opacity: 0.4, textTransform: "uppercase", letterSpacing: "1px" }}>Profile</span>
        {Object.entries(PROFILE_PRESETS).map(([key, preset]) => (
          <button key={key} onClick={() => applyPreset(key)}
            style={{ ...btn, borderColor: presetKey === key ? accent : `${accent}44`, color: presetKey === key ? accent : text }}>
            {preset.name}
          </button>
        ))}
      </div>

      {/* SVG Editor */}
      <svg
        ref={svgRef}
        width={svgW}
        height={svgH}
        style={{ background: `${text}05`, borderRadius: "6px", border: `1px solid ${text}10`, cursor: dragging !== null ? "grabbing" : "default" }}
        onDoubleClick={addPointOnEdge}
      >
        {/* Grid lines */}
        {[0, 20, 40, 60, 80, 100].map((x) => {
          const { sx } = toSvg({ x, y: 0 });
          return <line key={`gx${x}`} x1={sx} y1={padY} x2={sx} y2={svgH - padY} stroke={`${text}08`} />;
        })}
        {[0, 15, 30, 45, 60].map((y) => {
          const { sy } = toSvg({ x: 0, y });
          return <line key={`gy${y}`} x1={padX} y1={sy} x2={svgW - padX} y2={sy} stroke={`${text}08`} />;
        })}

        {/* Case profile fill */}
        <path d={pathD} fill={`${accent}15`} stroke={`${accent}55`} strokeWidth={1.5} />

        {/* Mount surface highlight */}
        <line x1={mountFrom.sx} y1={mountFrom.sy} x2={mountTo.sx} y2={mountTo.sy}
          stroke={accent} strokeWidth={2.5} strokeDasharray="4,3" />
        <text x={(mountFrom.sx + mountTo.sx) / 2} y={(mountFrom.sy + mountTo.sy) / 2 - 6}
          fontSize="8" fill={accent} textAnchor="middle" opacity={0.7}>mount surface</text>

        {/* Control points */}
        {points.map((pt, i) => {
          const { sx, sy } = toSvg(pt);
          const isHovered = hoveredPoint === i;
          const isSelected = selectedPoint === i;
          const isDrag = dragging === i;
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={isDrag ? 7 : isSelected ? 7 : isHovered ? 6 : 5}
                fill={isDrag ? accent : isSelected ? accent : isHovered ? `${accent}88` : `${accent}44`}
                stroke={accent} strokeWidth={1.5}
                style={{ cursor: "grab" }}
                onMouseDown={(e) => handleMouseDown(i, e)}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                onContextMenu={(e) => handleRightClick(i, e)}
              />
              <text x={sx} y={sy - 10} fontSize="8" fill={text} textAnchor="middle" opacity={0.5}>
                {pt.x},{pt.y}
              </text>
            </g>
          );
        })}

        {/* Labels */}
        <text x={padX} y={svgH - 4} fontSize="8" fill={text} opacity={0.3}>Front</text>
        <text x={svgW - padX - 20} y={svgH - 4} fontSize="8" fill={text} opacity={0.3}>Back</text>
      </svg>

      {/* Selected point controls */}
      {selectedPoint !== null && selectedPoint < points.length && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "2px 0" }}>
          <span style={{ fontSize: "9px", color: accent, opacity: 0.8 }}>
            Point {selectedPoint} ({points[selectedPoint].x}, {points[selectedPoint].y})
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "9px", color: text }}>
            Depth
            <input type="range" min="0" max="15" step="1"
              value={points[selectedPoint]?.d || 0}
              onChange={(e) => {
                const d = parseInt(e.target.value);
                setPoints(prev => {
                  const next = [...prev];
                  next[selectedPoint] = { ...next[selectedPoint], d: d > 0 ? d : undefined };
                  return next;
                });
              }}
              style={{ width: "60px", accentColor: accent }}
            />
            <span style={{ minWidth: "14px" }}>{points[selectedPoint]?.d || 0}</span>
          </label>
          <button onClick={() => {
            if (points.length <= 3) return;
            setPoints(prev => prev.filter((_, i) => i !== selectedPoint));
            setSelectedPoint(null);
          }} style={{ ...btn, color: "#ff6666", borderColor: "#ff666644", fontSize: "9px", padding: "1px 6px" }}>
            Remove
          </button>
        </div>
      )}
      {/* Mirror + transform operations */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: text, opacity: 0.4 }}>Transform:</span>
        <button onClick={() => {
          // Mirror horizontally (flip front/back)
          const maxX = Math.max(...points.map(p => p.x));
          setPoints(points.map(p => ({ ...p, x: maxX - p.x })).reverse());
        }} style={btn}>Mirror H</button>
        <button onClick={() => {
          // Mirror vertically (flip top/bottom)
          const maxY = Math.max(...points.map(p => p.y));
          setPoints(points.map(p => ({ ...p, y: maxY - p.y })));
        }} style={btn}>Mirror V</button>
        <button onClick={() => {
          // Scale up Y by 10%
          setPoints(points.map(p => ({ ...p, y: Math.round(p.y * 1.1) })));
        }} style={btn}>↑ Taller</button>
        <button onClick={() => {
          // Scale down Y by 10%
          setPoints(points.map(p => ({ ...p, y: Math.max(0, Math.round(p.y * 0.9)) })));
        }} style={btn}>↓ Shorter</button>
      </div>

      <div style={{ fontSize: "9px", color: text, opacity: 0.3 }}>
        Click point to select · Drag to move · Double-click edge to add
      </div>
    </div>
  );
};

export default CaseProfileEditor;
export { PROFILE_PRESETS };
