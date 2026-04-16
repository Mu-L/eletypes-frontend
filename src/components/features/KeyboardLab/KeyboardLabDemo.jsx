/**
 * KeyboardLabDemo — workspace layout for the keyboard design editor.
 *
 * Layout: toolbar (compact) | 3D viewport (left) + sidebar (right)
 * Sidebar: asset selectors, 2D layout, controls, tabbed JSON editors.
 * 3D viewport legends use world-space 3D Text — stable on resize.
 * Drag handle between viewport and sidebar for resizing.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import KeyboardLab from "./KeyboardLab";
import KeyboardLayout2D from "./KeyboardLayout2D";
import CaseProfileEditor, { PROFILE_PRESETS } from "./CaseEditor/CaseProfileEditor";
import { bundledResolver, listBundledByType } from "./schema/resolve/assetResolver";
import { designFromSelections } from "./schema/normalize/resolveDesign";
import { buildCodeMap, extractKeys } from "./schema/derive";
import { saveDesign, loadDesign, listDesigns, exportDesignJSON, importDesignJSON } from "./services/designStorage";
import { getKeycapPreset } from "./presets/keycaps";
import { getLegendPreset } from "./presets/legends";
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

const LAYOUT_REFS = listBundledByType("layout");
const KEYCAP_REFS = listBundledByType("keycap");
const LEGEND_REFS = listBundledByType("legend");
const SHELL_REFS = listBundledByType("shell");

const KEYCAP_ID_TO_REF = {
  "cherry-profile": "keycap/cherry-classic@1", "sa-profile": "keycap/sa-classic@1",
  "dsa-profile": "keycap/dsa-uniform@1", "xda-profile": "keycap/xda-uniform@1",
};
const LEGEND_ID_TO_REF = {
  "gmk-classic": "legend/gmk-center@1", "minimalist": "legend/minimalist@1",
  "retro": "legend/retro@1", "top-print": "legend/top-print@1",
  "cyber": "legend/cyber@1", "blank": "legend/blank@1",
};

const COLOR_PRESETS = {
  midnight:    { keycapColor: "#2a2a2e", accentKeyColor: "#3d3d42", caseColor: "#1a1a1e", opacity: 1.0 },
  ocean:       { keycapColor: "#1e3a5f", accentKeyColor: "#2d6a9f", caseColor: "#0d1b2a", opacity: 1.0 },
  sakura:      { keycapColor: "#f5e6e0", accentKeyColor: "#d4918b", caseColor: "#3d2b2b", opacity: 1.0 },
  forest:      { keycapColor: "#2d4a2d", accentKeyColor: "#5a8a3c", caseColor: "#1a2e1a", opacity: 1.0 },
  arctic:      { keycapColor: "#e8edf2", accentKeyColor: "#94b3d4", caseColor: "#c0c8d0", opacity: 1.0 },
  translucent: { keycapColor: "#8899aa", accentKeyColor: "#aabbcc", caseColor: "#1a1a1e", opacity: 0.55 },
  pudding:     { keycapColor: "#f0e8d8", accentKeyColor: "#1a1a1e", caseColor: "#1a1a1e", opacity: 0.75 },
  jelly:       { keycapColor: "#6a4c93", accentKeyColor: "#c75d9b", caseColor: "#0d0d12", opacity: 0.45 },
  frosted:     { keycapColor: "#d0dce8", accentKeyColor: "#7eb0d5", caseColor: "#2a2a30", opacity: 0.65 },
};

const JSON_TABS = ["Design", "Layout", "Keycap", "Legend", "Shell"];

const KeyboardLabDemo = ({ theme }) => {
  const keyboardRef = useRef();
  const sidebarRef = useRef(null);

  const [layoutRef, setLayoutRef] = useState("layout/generic-75-ansi@1");
  const [keycapRef, setKeycapRef] = useState("keycap/cherry-classic@1");
  const [legendRef, setLegendRef] = useState("legend/gmk-center@1");
  const [shellRef, setShellRef] = useState("shell/generic-75@1");
  const [colorPreset, setColorPreset] = useState("midnight");
  const [colors, setColors] = useState(COLOR_PRESETS.midnight);
  const [opacity, setOpacity] = useState(1.0);
  const [legendOverrides, setLegendOverrides] = useState({});
  const [liveTyping, setLiveTyping] = useState(true);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [designId] = useState(() => "design-" + Date.now().toString(36));
  const [designName, setDesignName] = useState("Untitled Design");
  const [savedDesigns, setSavedDesigns] = useState(() => listDesigns());
  const [saveMsg, setSaveMsg] = useState("");
  const [splitPercent, setSplitPercent] = useState(45);
  const [jsonTab, setJsonTab] = useState("Design");
  const [caseProfile, setCaseProfile] = useState(PROFILE_PRESETS.wedge);
  const isDragging = useRef(false);

  // Resolve assets
  const [layout, setLayout] = useState(null);
  const [shell, setShell] = useState(null);
  const [resolvedKeycap, setResolvedKeycap] = useState(null);
  const [resolvedLegend, setResolvedLegend] = useState(null);

  useEffect(() => { bundledResolver(layoutRef).then(setLayout).catch(() => {}); }, [layoutRef]);
  useEffect(() => { bundledResolver(shellRef).then(setShell).catch(() => {}); }, [shellRef]);
  useEffect(() => { bundledResolver(keycapRef).then(setResolvedKeycap).catch(() => {}); }, [keycapRef]);
  useEffect(() => { bundledResolver(legendRef).then(setResolvedLegend).catch(() => {}); }, [legendRef]);

  const legendPresetId = Object.entries(LEGEND_ID_TO_REF).find(([, r]) => r === legendRef)?.[0] || "gmk-classic";
  // Use resolved keycap (supports hot-swap from JSON editor)
  const keycapPreset = resolvedKeycap;
  const legendPreset = useMemo(() => {
    const base = getLegendPreset(legendPresetId);
    return Object.keys(legendOverrides).length === 0 ? base : { ...base, style: { ...base.style, ...legendOverrides } };
  }, [legendPresetId, legendOverrides]);
  const codeMap = useMemo(() => layout ? buildCodeMap(extractKeys(layout)) : new Map(), [layout]);

  // Live typing
  useEffect(() => {
    if (!liveTyping) return;
    const down = (e) => { const k = codeMap.get(e.code); if (k) { keyboardRef.current?.triggerKey(k); setActiveKeys(p => new Set(p).add(k)); } };
    const up = (e) => { const k = codeMap.get(e.code); if (k) setActiveKeys(p => { const n = new Set(p); n.delete(k); return n; }); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [liveTyping, codeMap]);

  // Stable design document — only regenerates when design inputs change
  const currentDesign = useMemo(() => {
    const d = designFromSelections({ name: designName, layoutRef, keycapRef, legendRef, shellRef, colorOverrides: colors, legendOverrides });
    d.id = designId;
    delete d.meta.created;
    return d;
  }, [designId, designName, layoutRef, keycapRef, legendRef, shellRef, colors, legendOverrides]);

  // Save / Load
  const handleSave = useCallback(() => {
    saveDesign(currentDesign); setSavedDesigns(listDesigns()); setSaveMsg("Saved!"); setTimeout(() => setSaveMsg(""), 2000);
  }, [currentDesign]);

  const handleLoad = useCallback((id) => {
    const d = loadDesign(id); if (!d) return;
    setDesignName(d.meta?.name || "Untitled"); setLayoutRef(d.assets.layout);
    setKeycapRef(d.assets.keycap || "keycap/cherry-classic@1"); setLegendRef(d.assets.legend || "legend/gmk-center@1");
    setShellRef(d.assets.shell || "shell/generic-75@1");
    setColors(d.overrides?.visual || COLOR_PRESETS.midnight); setOpacity(d.overrides?.visual?.opacity ?? 1.0);
    setLegendOverrides(d.overrides?.legend || {}); setColorPreset("");
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([exportDesignJSON(currentDesign)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `${designName.replace(/\s+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url);
  }, [currentDesign, designName]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = (ev) => { try { const d = importDesignJSON(ev.target.result); setDesignName(d.meta?.name || "Imported"); setLayoutRef(d.assets.layout);
        if (d.assets.keycap) setKeycapRef(d.assets.keycap); if (d.assets.legend) setLegendRef(d.assets.legend); if (d.assets.shell) setShellRef(d.assets.shell);
        if (d.overrides?.visual) setColors(d.overrides.visual); if (d.overrides?.legend) setLegendOverrides(d.overrides.legend);
      } catch (err) { alert("Import failed: " + err.message); } }; r.readAsText(f); }; input.click();
  }, []);

  const triggerDemo = useCallback(() => { ["KeyH","KeyE","KeyL","KeyL","KeyO"].forEach((k,i) => setTimeout(() => keyboardRef.current?.triggerKey(k), i*120)); }, []);
  const applyColorPreset = (name) => { setColorPreset(name); setColors(COLOR_PRESETS[name]); setOpacity(COLOR_PRESETS[name].opacity ?? 1.0); };

  // Drag handle
  const handleMouseDown = useCallback((e) => {
    e.preventDefault(); isDragging.current = true; const startX = e.clientX; const startPct = splitPercent;
    const container = e.currentTarget.parentElement;
    const onMove = (e) => { if (!isDragging.current) return;
      const rect = container.getBoundingClientRect(); const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(25, Math.min(65, pct))); };
    const onUp = () => { isDragging.current = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
  }, [splitPercent]);

  // JSON tab content
  const getTabJson = useCallback(() => {
    switch (jsonTab) {
      case "Design": return JSON.stringify(currentDesign, null, 2);
      case "Layout": return layout ? JSON.stringify(layout, null, 2) : "{}";
      case "Keycap": return resolvedKeycap ? JSON.stringify(resolvedKeycap, null, 2) : "{}";
      case "Legend": return legendPreset ? JSON.stringify(legendPreset, null, 2) : "{}";
      case "Shell": return shell ? JSON.stringify(shell, null, 2) : "{}";
      default: return "{}";
    }
  }, [jsonTab, currentDesign, layout, resolvedKeycap, legendPreset, shell]);

  const handleJsonChange = useCallback((value) => {
    try {
      const parsed = JSON.parse(value);
      if (jsonTab === "Design") {
        if (parsed.meta?.name) setDesignName(parsed.meta.name);
        if (parsed.assets?.layout) setLayoutRef(parsed.assets.layout);
        if (parsed.assets?.keycap) setKeycapRef(parsed.assets.keycap);
        if (parsed.assets?.legend) { setLegendRef(parsed.assets.legend); setLegendOverrides({}); }
        if (parsed.assets?.shell) setShellRef(parsed.assets.shell);
        if (parsed.overrides?.visual) setColors(parsed.overrides.visual);
        if (parsed.overrides?.legend) setLegendOverrides(parsed.overrides.legend);
      } else if (jsonTab === "Layout") {
        // Hot-swap: accept full preset or just {layout:{keys:[]}}
        if (parsed.layout?.keys) {
          setLayout({ ...parsed });
        } else if (Array.isArray(parsed.keys)) {
          setLayout(prev => ({ ...prev, layout: { keys: parsed.keys } }));
        }
      } else if (jsonTab === "Keycap") {
        if (parsed.profile) setResolvedKeycap(parsed);
      } else if (jsonTab === "Legend") {
        if (parsed.style) setLegendOverrides(parsed.style);
      } else if (jsonTab === "Shell") {
        if (parsed.case) setShell(parsed);
      }
    } catch { /* invalid JSON, ignore until valid */ }
  }, [jsonTab]);

  // 2D scale from sidebar width — use callback ref for reliable observer attachment
  const [sidebarPx, setSidebarPx] = useState(600);
  const sidebarObserver = useRef(null);
  const sidebarRefCallback = useCallback((node) => {
    // Cleanup previous observer
    if (sidebarObserver.current) sidebarObserver.current.disconnect();
    if (node) {
      sidebarObserver.current = new ResizeObserver((entries) => {
        setSidebarPx(entries[0].contentRect.width);
      });
      sidebarObserver.current.observe(node);
      setSidebarPx(node.getBoundingClientRect().width); // Initial measurement
    }
    sidebarRef.current = node;
  }, []);
  const scale2D = Math.max(12, Math.floor((sidebarPx - 40) / 17));

  // Styling
  const bg = theme?.background || "#111115";
  const text = theme?.text || "#e0e0e0";
  const accent = theme?.stats || "#6ec6ff";
  const sel = { background: "#1a1a1e", color: text, border: `1px solid ${text}33`, borderRadius: "3px", padding: "2px 4px", fontSize: "11px" };
  const btn = (active) => ({ background: "transparent", border: `1px solid ${active ? accent : accent+"44"}`, borderRadius: "4px", color: active ? accent : text, padding: "3px 8px", cursor: "pointer", fontSize: "10px", fontFamily: "inherit" });
  const lbl = { display: "flex", alignItems: "center", gap: "3px", color: text, fontSize: "10px" };
  const sectionTitle = { fontSize: "9px", color: text, opacity: 0.35, textTransform: "uppercase", letterSpacing: "1.2px", padding: "6px 8px 3px" };

  if (!layout) return null;

  return (
    <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateRows: "auto 1fr", background: bg, overflow: "hidden" }}>

      {/* ═══ Toolbar (compact) ═══ */}
      <div style={{ display: "flex", gap: "5px", padding: "5px 10px", alignItems: "center", borderBottom: `1px solid ${text}10`, flexWrap: "wrap" }}>
        <input value={designName} onChange={(e) => setDesignName(e.target.value)} style={{ ...sel, width: "130px", fontWeight: 600 }} />
        <button onClick={handleSave} style={btn(false)}>{saveMsg || "Save"}</button>
        <button onClick={handleExport} style={btn(false)}>Export</button>
        <button onClick={handleImport} style={btn(false)}>Import</button>
        {savedDesigns.length > 0 && (
          <select onChange={(e) => { if (e.target.value) handleLoad(e.target.value); e.target.value=""; }} style={sel} defaultValue="">
            <option value="" disabled>Load…</option>
            {savedDesigns.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <span style={{ color: text, opacity: 0.1 }}>|</span>
        <button onClick={triggerDemo} style={btn(false)}>Demo</button>
        <button onClick={() => setLiveTyping(!liveTyping)} style={btn(liveTyping)}>Live: {liveTyping ? "ON" : "OFF"}</button>
      </div>

      {/* ═══ Workspace ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: `${splitPercent}% 6px 1fr`, overflow: "hidden" }}>

        {/* 3D Viewport */}
        <div style={{ minHeight: 0, minWidth: 0 }}>
          <KeyboardLab ref={keyboardRef} layout={layout} shell={shell} keycapPreset={keycapPreset}
            keycapColor={colors.keycapColor} accentKeyColor={colors.accentKeyColor} caseColor={colors.caseColor}
            keycapOpacity={opacity} legendPreset={legendPreset} caseProfile={caseProfile} />
        </div>

        {/* Drag handle */}
        <div onMouseDown={handleMouseDown} style={{
          cursor: "col-resize", background: `${text}08`, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }} onMouseEnter={(e) => e.currentTarget.style.background = accent+"33"} onMouseLeave={(e) => e.currentTarget.style.background = `${text}08`}>
          <div style={{ width: "2px", height: "32px", borderRadius: "1px", background: `${text}25` }} />
        </div>

        {/* Sidebar */}
        <div ref={sidebarRefCallback} style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Asset selectors */}
          <div style={sectionTitle}>Assets</div>
          <div style={{ display: "flex", gap: "4px", padding: "0 8px 6px", flexWrap: "wrap" }}>
            <select value={layoutRef} onChange={(e) => setLayoutRef(e.target.value)} style={sel}>
              {LAYOUT_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select>
            <select value={shellRef} onChange={(e) => setShellRef(e.target.value)} style={sel}>
              {SHELL_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select>
            <select value={keycapRef} onChange={(e) => setKeycapRef(e.target.value)} style={sel}>
              {KEYCAP_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select>
            <select value={legendRef} onChange={(e) => { setLegendRef(e.target.value); setLegendOverrides({}); }} style={sel}>
              {LEGEND_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select>
            <select value={colorPreset} onChange={(e) => applyColorPreset(e.target.value)} style={sel}>
              {Object.keys(COLOR_PRESETS).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* 2D Layout — scales to fill sidebar width, height proportional */}
          <div style={sectionTitle}>Layout</div>
          <div style={{ overflow: "auto", padding: "0 8px 6px" }}>
            <KeyboardLayout2D layout={layout} activeKeys={activeKeys} theme={theme} scale={scale2D} />
          </div>

          {/* Case Profile Editor */}
          <div style={{ padding: "0 8px 4px", borderTop: `1px solid ${text}08` }}>
            <div style={sectionTitle}>Case Profile</div>
            <CaseProfileEditor
              theme={theme}
              initialProfile={caseProfile}
              onChange={setCaseProfile}
            />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "6px", padding: "4px 8px", flexWrap: "wrap", alignItems: "center", borderTop: `1px solid ${text}08` }}>
            <label style={lbl}>Size<input type="range" min="8" max="40" step="1" value={legendPreset.style.fontSize}
              onChange={(e) => setLegendOverrides(o => ({...o, fontSize: parseInt(e.target.value)}))} style={{ width: "40px", accentColor: accent }} />{legendPreset.style.fontSize}</label>
            <select value={legendPreset.style.fontWeight} onChange={(e) => setLegendOverrides(o => ({...o, fontWeight: parseInt(e.target.value)}))} style={sel}>
              <option value="400">Light</option><option value="600">Semi</option><option value="700">Bold</option></select>
            <select value={legendPreset.style.fontFamily.split(",")[0].trim()} onChange={(e) => setLegendOverrides(o => ({...o, fontFamily: e.target.value}))} style={sel}>
              <option value="Arial, sans-serif">Arial</option><option value="Courier New, monospace">Courier</option><option value="Tomorrow, monospace">Tomorrow</option></select>
            <input type="color" value={legendPreset.style.color} onChange={(e) => setLegendOverrides(o => ({...o, color: e.target.value}))}
              style={{ width: "16px", height: "16px", border: "none", cursor: "pointer", background: "transparent" }} />
            <button onClick={() => setLegendOverrides(o => ({...o, uppercase: !legendPreset.style.uppercase}))} style={btn(legendPreset.style.uppercase)}>ABC</button>
            <span style={{ color: text, opacity: 0.08 }}>|</span>
            <label style={lbl}>Op<input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ width: "36px", accentColor: accent }} />{Math.round(opacity*100)}%</label>
            {[{l:"Cap",k:"keycapColor"},{l:"Acc",k:"accentKeyColor"},{l:"Case",k:"caseColor"}].map(({l,k}) => (
              <label key={k} style={lbl}>{l}<input type="color" value={colors[k]} onChange={(e) => setColors(c => ({...c,[k]:e.target.value}))}
                style={{ width: "16px", height: "16px", border: "none", cursor: "pointer", background: "transparent" }} /></label>
            ))}
          </div>

          {/* Tabbed JSON Editor */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", borderTop: `1px solid ${text}08` }}>
            <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${text}08` }}>
              {JSON_TABS.map(tab => (
                <button key={tab} onClick={() => setJsonTab(tab)} style={{
                  background: "transparent", border: "none", borderBottom: jsonTab === tab ? `2px solid ${accent}` : "2px solid transparent",
                  color: jsonTab === tab ? accent : `${text}66`, padding: "5px 10px", cursor: "pointer", fontSize: "10px", fontFamily: "inherit",
                }}>{tab}</button>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Suspense fallback={<div style={{ padding: "8px", color: text, opacity: 0.3, fontSize: "11px" }}>Loading…</div>}>
                <MonacoEditor
                  key={jsonTab}
                  height="100%"
                  language="json"
                  theme="vs-dark"
                  value={getTabJson()}
                  onChange={handleJsonChange}
                  options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: "off", scrollBeyondLastLine: false,
                    wordWrap: "on", tabSize: 2, renderLineHighlight: "none", overviewRulerBorder: false,
                    padding: { top: 4, bottom: 4 } }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardLabDemo;
