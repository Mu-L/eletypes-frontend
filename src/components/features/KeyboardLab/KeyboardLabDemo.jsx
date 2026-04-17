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
import { saveDesign, loadDesign, listDesigns, deleteDesign, exportDesignJSON, importDesignJSON } from "./services/designStorage";
import { getKeycapPreset } from "./presets/keycaps";
import { getLegendPreset } from "./presets/legends";
import { useLabTranslation } from "./i18n/useLabTranslation";
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

const LAYOUT_REFS = listBundledByType("layout");
const KEYCAP_REFS = listBundledByType("keycap");
const LEGEND_REFS = listBundledByType("legend");
const SHELL_REFS = listBundledByType("shell");
const CASE_PROFILE_REFS = listBundledByType("caseProfile");

const KEYCAP_ID_TO_REF = {
  "cherry-profile": "keycap/cherry-classic@1", "oem-profile": "keycap/oem-classic@1",
  "sa-profile": "keycap/sa-classic@1", "mt3-profile": "keycap/mt3-sculpted@1",
  "kat-profile": "keycap/kat-sculpted@1",
  "dsa-profile": "keycap/dsa-uniform@1", "xda-profile": "keycap/xda-uniform@1",
  "low-profile": "keycap/low-profile@1",
};
const LEGEND_ID_TO_REF = {
  "gmk-classic": "legend/gmk-center@1", "minimalist": "legend/minimalist@1",
  "retro": "legend/retro@1", "top-print": "legend/top-print@1",
  "cyber": "legend/cyber@1", "blank": "legend/blank@1",
};

const DEFAULT_OPACITY = { keycap: 1.0, accent: 1.0, case: 1.0, legend: 1.0 };

const COLOR_PRESETS = {
  "le smoking": { keycapColor: "#070505", accentKeyColor: "#010305", caseColor: "#7d5db6", opacity: { keycap: 0.95, accent: 1, case: 0.9, legend: 0.75 } },
  midnight:    { keycapColor: "#2a2a2e", accentKeyColor: "#3d3d42", caseColor: "#1a1a1e", opacity: { ...DEFAULT_OPACITY } },
  ocean:       { keycapColor: "#1e3a5f", accentKeyColor: "#2d6a9f", caseColor: "#0d1b2a", opacity: { ...DEFAULT_OPACITY } },
  sakura:      { keycapColor: "#f5e6e0", accentKeyColor: "#d4918b", caseColor: "#3d2b2b", opacity: { ...DEFAULT_OPACITY } },
  forest:      { keycapColor: "#2d4a2d", accentKeyColor: "#5a8a3c", caseColor: "#1a2e1a", opacity: { ...DEFAULT_OPACITY } },
  arctic:      { keycapColor: "#e8edf2", accentKeyColor: "#94b3d4", caseColor: "#c0c8d0", opacity: { ...DEFAULT_OPACITY } },
  translucent: { keycapColor: "#8899aa", accentKeyColor: "#aabbcc", caseColor: "#1a1a1e", opacity: { keycap: 0.55, accent: 0.55, case: 1.0, legend: 1.0 } },
  pudding:     { keycapColor: "#f0e8d8", accentKeyColor: "#1a1a1e", caseColor: "#1a1a1e", opacity: { keycap: 0.75, accent: 0.75, case: 1.0, legend: 1.0 } },
  jelly:       { keycapColor: "#6a4c93", accentKeyColor: "#c75d9b", caseColor: "#0d0d12", opacity: { keycap: 0.45, accent: 0.45, case: 0.85, legend: 0.9 } },
  frosted:     { keycapColor: "#d0dce8", accentKeyColor: "#7eb0d5", caseColor: "#2a2a30", opacity: { keycap: 0.65, accent: 0.65, case: 1.0, legend: 1.0 } },
};

const JSON_TAB_KEYS = ["Design", "Layout", "Keycap", "Legend", "Shell", "Case Profile"];
const JSON_TAB_I18N = {
  "Design": "lab_tab_design", "Layout": "lab_tab_layout", "Keycap": "lab_tab_keycap",
  "Legend": "lab_tab_legend", "Shell": "lab_tab_shell", "Case Profile": "lab_tab_case_profile_json",
};

const DEFAULTS = {
  layoutRef: "layout/cyberboard-75-ansi@1",
  keycapRef: "keycap/cherry-classic@1",
  legendRef: "legend/gmk-center@1",
  shellRef: "shell/generic-75@1",
  caseProfileRef: "caseProfile/cyberboard-wedge@1",
  colorPreset: "le smoking",
  mountOffset: { x: 0.1, y: 0, z: 0.7 },
  mountFit: 0.85,
  caseScale: 1.15,
  extrudeWidth: 0.9,
};

const KeyboardLabDemo = ({ theme }) => {
  const tLab = useLabTranslation();
  const keyboardRef = useRef();
  const sidebarRef = useRef(null);

  const [layoutRef, setLayoutRef] = useState("layout/cyberboard-75-ansi@1");
  const [keycapRef, setKeycapRef] = useState("keycap/cherry-classic@1");
  const [legendRef, setLegendRef] = useState("legend/gmk-center@1");
  const [shellRef, setShellRef] = useState("shell/generic-75@1");
  const [colorPreset, setColorPreset] = useState("le smoking");
  const [colors, setColors] = useState(COLOR_PRESETS["le smoking"]);
  const [opacity, setOpacity] = useState({ ...COLOR_PRESETS["le smoking"].opacity });
  const [legendOverrides, setLegendOverrides] = useState({ color: "#06ea69" });
  const [liveTyping, setLiveTyping] = useState(true);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [designId] = useState(() => "design-" + Date.now().toString(36));
  const [designName, setDesignName] = useState("Untitled Design");
  const [savedDesigns, setSavedDesigns] = useState(() => listDesigns());
  const [saveMsg, setSaveMsg] = useState("");
  const [splitPercent, setSplitPercent] = useState(65);
  const [jsonTab, setJsonTab] = useState("Design");
  const [showDoc, setShowDoc] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [editorTab, setEditorTab] = useState("case"); // "case" | "layout"
  const [caseProfileRef, setCaseProfileRef] = useState("caseProfile/cyberboard-wedge@1");
  const [caseProfile, setCaseProfile] = useState(PROFILE_PRESETS.wedge);
  const [caseScale, setCaseScale] = useState(1.15);
  const [mountOffset, setMountOffset] = useState({ x: 0.1, y: 0, z: 0.7 });
  const [mountFit, setMountFit] = useState(0.85);
  const [extrudeWidth, setExtrudeWidth] = useState(0.9);
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
  useEffect(() => {
    bundledResolver(caseProfileRef).then((p) => {
      if (p.caseProfile) setCaseProfile(p.caseProfile);
      if (p.mount) {
        if (p.mount.offset) setMountOffset(p.mount.offset);
        if (p.mount.fit != null) setMountFit(p.mount.fit);
        if (p.mount.caseScale != null) setCaseScale(p.mount.caseScale);
        if (p.mount.extrudeWidth != null) setExtrudeWidth(p.mount.extrudeWidth);
      }
    }).catch(() => {});
  }, [caseProfileRef]);

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
    const d = designFromSelections({
      name: designName, layoutRef, keycapRef, legendRef, shellRef, caseProfileRef,
      colorOverrides: colors, opacityOverrides: opacity, legendOverrides,
    });
    d.id = designId;
    delete d.meta.createdAt;
    return d;
  }, [designId, designName, layoutRef, keycapRef, legendRef, shellRef, caseProfileRef, colors, opacity, legendOverrides]);

  const [loadedDesignId, setLoadedDesignId] = useState("");
  const [savedMenuOpen, setSavedMenuOpen] = useState(false);
  const savedMenuRef = useRef(null);

  // Close saved menu on outside click
  useEffect(() => {
    if (!savedMenuOpen) return;
    const handler = (e) => {
      if (savedMenuRef.current && !savedMenuRef.current.contains(e.target)) setSavedMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [savedMenuOpen]);

  // ─── Design actions ───

  // Apply a design bundle (eletypes-design-bundle/1)
  const applyBundle = useCallback((bundle) => {
    const d = bundle.design || bundle;
    const refs = d.refs || d.assets || {};
    const ea = bundle.embeddedAssets || bundle.assets || {};

    setDesignName(d.meta?.name || "Untitled");
    setLayoutRef(refs.layout || DEFAULTS.layoutRef);
    setKeycapRef(refs.keycap || DEFAULTS.keycapRef);
    setLegendRef(refs.legend || DEFAULTS.legendRef);
    setShellRef(refs.shell || DEFAULTS.shellRef);
    setCaseProfileRef(refs.caseProfile || refs.profile || DEFAULTS.caseProfileRef);

    // Visual + opacity (opacity is sibling of visual in new format, nested in old)
    setColors(d.overrides?.visual || COLOR_PRESETS.midnight);
    setOpacity({ ...DEFAULT_OPACITY, ...d.overrides?.opacity, ...d.overrides?.visual?.opacity });
    setLegendOverrides(d.overrides?.legend || {});
    setColorPreset("");

    // Restore embedded assets if present
    if (ea.layout) setLayout(ea.layout);
    if (ea.keycap) setResolvedKeycap(ea.keycap);
    if (ea.legend) setResolvedLegend(ea.legend);
    if (ea.shell) setShell(ea.shell);

    // Restore case profile from embedded assets or legacy locations
    const cpAsset = ea.caseProfile || bundle.profile;
    if (cpAsset?.caseProfile) setCaseProfile(cpAsset.caseProfile);
    else if (d.overrides?.caseProfile) setCaseProfile(d.overrides.caseProfile);

    const mt = cpAsset?.mount || bundle.profile?.mount || d.overrides?.mount || {};
    if (mt.offset) setMountOffset(mt.offset);
    if (mt.fit != null) setMountFit(mt.fit);
    if (mt.caseScale != null) setCaseScale(mt.caseScale);
    if (mt.extrudeWidth != null) setExtrudeWidth(mt.extrudeWidth);
  }, []);

  const handleNew = useCallback(() => {
    setDesignName(tLab("lab_untitled"));
    setLayoutRef(DEFAULTS.layoutRef);
    setKeycapRef(DEFAULTS.keycapRef);
    setLegendRef(DEFAULTS.legendRef);
    setShellRef(DEFAULTS.shellRef);
    setCaseProfileRef(DEFAULTS.caseProfileRef);
    setColorPreset(DEFAULTS.colorPreset);
    setColors(COLOR_PRESETS[DEFAULTS.colorPreset]);
    setOpacity({ ...COLOR_PRESETS[DEFAULTS.colorPreset].opacity });
    setLegendOverrides({ color: "#06ea69" });
    setMountOffset(DEFAULTS.mountOffset);
    setMountFit(DEFAULTS.mountFit);
    setCaseScale(DEFAULTS.caseScale);
    setExtrudeWidth(DEFAULTS.extrudeWidth);
    setLoadedDesignId("");
    // Force re-resolve all assets even if refs match current values
    bundledResolver(DEFAULTS.layoutRef).then(setLayout).catch(() => {});
    bundledResolver(DEFAULTS.keycapRef).then(setResolvedKeycap).catch(() => {});
    bundledResolver(DEFAULTS.legendRef).then(setResolvedLegend).catch(() => {});
    bundledResolver(DEFAULTS.shellRef).then(setShell).catch(() => {});
    bundledResolver(DEFAULTS.caseProfileRef).then((p) => {
      if (p.caseProfile) setCaseProfile(p.caseProfile);
      if (p.mount) {
        if (p.mount.offset) setMountOffset(p.mount.offset);
        if (p.mount.fit != null) setMountFit(p.mount.fit);
        if (p.mount.caseScale != null) setCaseScale(p.mount.caseScale);
        if (p.mount.extrudeWidth != null) setExtrudeWidth(p.mount.extrudeWidth);
      }
    }).catch(() => {});
  }, [tLab]);

  // Build an eletypes-design-bundle/1 from current state
  const buildBundle = useCallback(() => ({
    schema: "eletypes-design-bundle/1",
    savedAt: new Date().toISOString(),
    design: currentDesign,
    embeddedAssets: {
      layout: layout || null,
      keycap: resolvedKeycap || null,
      legend: legendPreset || null,
      shell: shell || null,
      caseProfile: {
        schema: "eletypes-caseProfile/1",
        id: caseProfileRef.split("/").pop()?.split("@")[0] || "custom",
        caseProfile,
        mount: { offset: mountOffset, fit: mountFit, caseScale, extrudeWidth },
      },
    },
  }), [currentDesign, layout, resolvedKeycap, legendPreset, shell, caseProfileRef, caseProfile, mountOffset, mountFit, caseScale, extrudeWidth]);

  const handleSave = useCallback(() => {
    saveDesign(buildBundle());
    setSavedDesigns(listDesigns());
    setSaveMsg(tLab("lab_saved_msg"));
    setTimeout(() => setSaveMsg(""), 2000);
  }, [buildBundle]);

  const handleLoad = useCallback((id) => {
    const bundle = loadDesign(id); if (!bundle) return;
    applyBundle(bundle);
  }, [applyBundle]);

  const handleReload = useCallback(() => {
    if (!loadedDesignId) return;
    const bundle = loadDesign(loadedDesignId);
    if (bundle) applyBundle(bundle);
  }, [loadedDesignId, applyBundle]);

  const handleDeleteSingle = useCallback((id) => {
    deleteDesign(id);
    setSavedDesigns(listDesigns());
    if (loadedDesignId === id) setLoadedDesignId("");
  }, [loadedDesignId]);

  const handleClearAll = useCallback(() => {
    savedDesigns.forEach(d => deleteDesign(d.id));
    setSavedDesigns([]);
    setLoadedDesignId("");
  }, [savedDesigns]);

  const handleExport = useCallback(() => {
    const blob = new Blob([exportDesignJSON(buildBundle())], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `${designName.replace(/\s+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url);
  }, [buildBundle, designName]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = (ev) => { try {
        const bundle = importDesignJSON(ev.target.result);
        applyBundle(bundle);
      } catch (err) { alert("Import failed: " + err.message); } }; r.readAsText(f); }; input.click();
  }, [applyBundle]);

  const triggerDemo = useCallback(() => { ["KeyH","KeyE","KeyL","KeyL","KeyO"].forEach((k,i) => setTimeout(() => keyboardRef.current?.triggerKey(k), i*120)); }, []);
  const applyColorPreset = (name) => { setColorPreset(name); setColors(COLOR_PRESETS[name]); setOpacity({ ...DEFAULT_OPACITY, ...COLOR_PRESETS[name].opacity }); };

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

  // JSON tab content — computed as a string, used as both editor value and sync trigger
  const tabJson = useMemo(() => {
    switch (jsonTab) {
      case "Design": return JSON.stringify(currentDesign, null, 2);
      case "Layout": return layout ? JSON.stringify(layout, null, 2) : "{}";
      case "Keycap": return resolvedKeycap ? JSON.stringify(resolvedKeycap, null, 2) : "{}";
      case "Legend": return legendPreset ? JSON.stringify(legendPreset, null, 2) : "{}";
      case "Shell": return shell ? JSON.stringify(shell, null, 2) : "{}";
      case "Case Profile": return JSON.stringify({ caseProfile, mount: { offset: mountOffset, fit: mountFit, caseScale, extrudeWidth } }, null, 2);
      default: return "{}";
    }
  }, [jsonTab, currentDesign, layout, resolvedKeycap, legendPreset, shell, caseProfile, mountOffset, mountFit, caseScale, extrudeWidth]);

  // ─── Monaco sync: imperatively push external state changes into editor ───
  const monacoRef = useRef(null);
  const isEditorEdit = useRef(false);

  useEffect(() => {
    if (isEditorEdit.current) {
      isEditorEdit.current = false;
      return;
    }
    const editor = monacoRef.current;
    if (!editor) return;
    if (editor.getValue() !== tabJson) {
      // Preserve cursor position
      const pos = editor.getPosition();
      editor.setValue(tabJson);
      if (pos) editor.setPosition(pos);
    }
  }, [tabJson]);

  const handleJsonChange = useCallback((value) => {
    isEditorEdit.current = true;
    try {
      const parsed = JSON.parse(value);
      if (jsonTab === "Design") {
        if (parsed.meta?.name) setDesignName(parsed.meta.name);
        const refs = parsed.refs || parsed.assets;
        if (refs?.layout) setLayoutRef(refs.layout);
        if (refs?.keycap) setKeycapRef(refs.keycap);
        if (refs?.legend) { setLegendRef(refs.legend); setLegendOverrides({}); }
        if (refs?.shell) setShellRef(refs.shell);
        if (refs?.caseProfile) setCaseProfileRef(refs.caseProfile);
        if (parsed.overrides?.visual) setColors(parsed.overrides.visual);
        if (parsed.overrides?.opacity) setOpacity(o => ({ ...o, ...parsed.overrides.opacity }));
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
      } else if (jsonTab === "Case Profile") {
        if (parsed.caseProfile) setCaseProfile(parsed.caseProfile);
        if (parsed.mount) {
          if (parsed.mount.offset) setMountOffset(parsed.mount.offset);
          if (parsed.mount.fit != null) setMountFit(parsed.mount.fit);
          if (parsed.mount.caseScale != null) setCaseScale(parsed.mount.caseScale);
          if (parsed.mount.extrudeWidth != null) setExtrudeWidth(parsed.mount.extrudeWidth);
        }
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
  const sel = { background: "#1a1a1e", color: text, border: `1px solid ${text}33`, borderRadius: "3px", padding: "2px 5px", fontSize: "12px" };
  const btn = (active) => ({ background: "transparent", border: `1px solid ${active ? accent : accent+"44"}`, borderRadius: "4px", color: active ? accent : text, padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" });
  const lbl = { display: "flex", alignItems: "center", gap: "4px", color: text, fontSize: "12px" };
  const sectionTitle = { fontSize: "13px", color: accent, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1.2px", padding: "6px 8px 3px", fontWeight: 600 };

  if (!layout) return null;

  return (
    <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateRows: "auto 1fr", background: bg, overflow: "hidden" }}>

      {/* ═══ Toolbar ═══ */}
      <div style={{ display: "flex", gap: "6px", padding: "6px 10px", alignItems: "center", borderBottom: `1px solid ${text}10`, flexWrap: "wrap" }}>
        <button onClick={handleNew} style={btn(false)}>{tLab("lab_new")}</button>
        <input value={designName} onChange={(e) => setDesignName(e.target.value)} style={{ ...sel, width: "140px", fontWeight: 600 }} />
        <button onClick={handleSave} style={btn(false)}>{saveMsg || tLab("lab_save")}</button>
        {savedDesigns.length > 0 && (
          <div ref={savedMenuRef} style={{ position: "relative" }}>
            <button onClick={() => setSavedMenuOpen(!savedMenuOpen)} style={btn(savedMenuOpen)}>
              {tLab("lab_saved_count", savedDesigns.length)}
            </button>
            {savedMenuOpen && (
              <div style={{
                position: "absolute", top: "100%", left: 0, marginTop: "4px",
                background: "#1a1a1e", border: `1px solid ${text}22`, borderRadius: "6px",
                minWidth: "200px", maxHeight: "240px", overflowY: "auto", zIndex: 100,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}>
                {savedDesigns.map(d => (
                  <div key={d.id} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 10px", cursor: "pointer",
                    background: d.id === loadedDesignId ? `${accent}15` : "transparent",
                    borderBottom: `1px solid ${text}08`,
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${accent}22`}
                    onMouseLeave={(e) => e.currentTarget.style.background = d.id === loadedDesignId ? `${accent}15` : "transparent"}
                  >
                    <span style={{ flex: 1, fontSize: "12px", color: text }}
                      onClick={() => { handleLoad(d.id); setLoadedDesignId(d.id); setSavedMenuOpen(false); }}>
                      {d.name}
                    </span>
                    <span onClick={(e) => { e.stopPropagation(); handleDeleteSingle(d.id); }}
                      style={{ color: "#ff666688", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 2px" }}
                      title={tLab("lab_delete")}>×</span>
                  </div>
                ))}
                <div style={{ padding: "6px 10px", borderTop: `1px solid ${text}15` }}>
                  <button onClick={() => { handleClearAll(); setSavedMenuOpen(false); }}
                    style={{ ...btn(false), color: "#ff6666", borderColor: "#ff666644", fontSize: "11px", width: "100%" }}>
                    {tLab("lab_clear_all")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {loadedDesignId && (
          <button onClick={handleReload} style={btn(false)}>{tLab("lab_reload")}</button>
        )}
        <span style={{ color: text, opacity: 0.1 }}>|</span>
        <button onClick={handleExport} style={btn(false)}>{tLab("lab_export")}</button>
        <button onClick={handleImport} style={btn(false)}>{tLab("lab_import")}</button>
        <span style={{ color: text, opacity: 0.1 }}>|</span>
        <button onClick={() => setShowRoadmap(true)} style={{
          ...btn(false),
          background: "linear-gradient(135deg, rgba(106,76,147,0.15), rgba(74,144,217,0.15))",
          border: "none",
          padding: "4px 12px",
          position: "relative",
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute", inset: "-1px", borderRadius: "5px", padding: "2px",
            background: "linear-gradient(135deg, #6a4c93, #4a90d9, #44dd88, #4a90d9, #6a4c93)",
            backgroundSize: "300% 300%",
            animation: "roadmapGlow 4s ease infinite",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }} />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}>
            ✦ {tLab("lab_roadmap")}
          </span>
        </button>
        <style>{`@keyframes roadmapGlow { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>
        <span style={{ flex: 1 }} />
        <button onClick={triggerDemo} style={btn(false)}>{tLab("lab_demo")}</button>
        <button onClick={() => setLiveTyping(!liveTyping)} style={btn(liveTyping)}>{liveTyping ? tLab("lab_live_on") : tLab("lab_live_off")}</button>
      </div>

      {/* ═══ Workspace ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: `${splitPercent}% 6px 1fr`, overflow: "hidden" }}>

        {/* 3D Viewport */}
        <div style={{ minHeight: 0, minWidth: 0 }}>
          <KeyboardLab ref={keyboardRef} layout={layout} shell={shell} keycapPreset={keycapPreset}
            keycapColor={colors.keycapColor} accentKeyColor={colors.accentKeyColor} caseColor={colors.caseColor}
            opacity={opacity} legendPreset={legendPreset} caseProfile={caseProfile} caseScale={caseScale}
            mountOffset={mountOffset} mountFit={mountFit} extrudeWidth={extrudeWidth} />
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
          <div style={sectionTitle}>{tLab("lab_assets")}</div>
          <div style={{ display: "flex", gap: "4px", padding: "0 8px 4px", flexWrap: "wrap" }}>
            <label style={lbl}>{tLab("lab_layout")}<select value={layoutRef} onChange={(e) => setLayoutRef(e.target.value)} style={sel}>
              {LAYOUT_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select></label>
            <label style={lbl}>{tLab("lab_shell")}<select value={shellRef} onChange={(e) => setShellRef(e.target.value)} style={sel}>
              {SHELL_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select></label>
            <label style={lbl}>{tLab("lab_keycap")}<select value={keycapRef} onChange={(e) => setKeycapRef(e.target.value)} style={sel}>
              {KEYCAP_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select></label>
            <label style={lbl}>{tLab("lab_legend")}<select value={legendRef} onChange={(e) => { setLegendRef(e.target.value); setLegendOverrides({}); }} style={sel}>
              {LEGEND_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select></label>
            <label style={lbl}>{tLab("lab_profile")}<select value={caseProfileRef} onChange={(e) => setCaseProfileRef(e.target.value)} style={sel}>
              {CASE_PROFILE_REFS.map(a => <option key={a.ref} value={a.ref}>{a.name}</option>)}
            </select></label>
            <label style={lbl}>{tLab("lab_theme")}<select value={colorPreset} onChange={(e) => applyColorPreset(e.target.value)} style={sel}>
              {Object.keys(COLOR_PRESETS).map(n => <option key={n} value={n}>{n}</option>)}
            </select></label>
          </div>

          {/* Legend + Color/Opacity controls */}
          <div style={{ display: "flex", gap: "4px", padding: "0 8px 4px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: accent, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{tLab("lab_legend_section")}</span>
            <label style={lbl}>{tLab("lab_size")}<input type="range" min="8" max="40" step="1" value={legendPreset.style.fontSize}
              onChange={(e) => setLegendOverrides(o => ({...o, fontSize: parseInt(e.target.value)}))} style={{ width: "36px", accentColor: accent }} />{legendPreset.style.fontSize}</label>
            <label style={lbl}>{tLab("lab_weight")}<select value={legendPreset.style.fontWeight} onChange={(e) => setLegendOverrides(o => ({...o, fontWeight: parseInt(e.target.value)}))} style={sel}>
              <option value="400">{tLab("lab_light")}</option><option value="600">{tLab("lab_semi")}</option><option value="700">{tLab("lab_bold")}</option></select></label>
            <label style={lbl}>{tLab("lab_font")}<select value={legendPreset.style.fontFamily.split(",")[0].trim()} onChange={(e) => setLegendOverrides(o => ({...o, fontFamily: e.target.value}))} style={sel}>
              <option value="Arial, sans-serif">Arial</option><option value="Courier New, monospace">Courier</option><option value="Tomorrow, monospace">Tomorrow</option></select></label>
            <label style={lbl}>{tLab("lab_color")}<input type="color" value={legendPreset.style.color} onChange={(e) => setLegendOverrides(o => ({...o, color: e.target.value}))}
              style={{ width: "24px", height: "24px", border: `1px solid ${text}22`, borderRadius: "3px", cursor: "pointer", background: "transparent", padding: 0 }} /></label>
          </div>
          <div style={{ display: "flex", gap: "4px", padding: "0 8px 6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: accent, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{tLab("lab_colors_section")}</span>
            {[{l:"lab_keycap_color",k:"keycapColor",ok:"keycap"},{l:"lab_accent_color",k:"accentKeyColor",ok:"accent"},{l:"lab_case_color",k:"caseColor",ok:"case"}].map(({l,k,ok}) => (
              <label key={k} style={lbl}>{tLab(l)}<input type="color" value={colors[k]} onChange={(e) => setColors(c => ({...c,[k]:e.target.value}))}
                style={{ width: "24px", height: "24px", border: `1px solid ${text}22`, borderRadius: "3px", cursor: "pointer", background: "transparent", padding: 0 }} />
                <input type="range" min="0.1" max="1" step="0.05" value={opacity[ok]} onChange={(e) => setOpacity(o => ({...o,[ok]:parseFloat(e.target.value)}))}
                  style={{ width: "28px", accentColor: accent }} /><span style={{ minWidth: "20px", fontSize: "11px" }}>{Math.round(opacity[ok]*100)}%</span>
              </label>
            ))}
            <label style={lbl}>{tLab("lab_label_opacity")}<input type="range" min="0.1" max="1" step="0.05" value={opacity.legend} onChange={(e) => setOpacity(o => ({...o, legend: parseFloat(e.target.value)}))}
              style={{ width: "28px", accentColor: accent }} /><span style={{ minWidth: "20px", fontSize: "11px" }}>{Math.round(opacity.legend*100)}%</span></label>
          </div>

          {/* Tabbed editor: Case Profile / 2D Layout */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${text}08` }}>
              <button onClick={() => setEditorTab("case")} style={{
                background: "transparent", border: "none",
                borderBottom: editorTab === "case" ? `2px solid ${accent}` : "2px solid transparent",
                color: editorTab === "case" ? accent : `${text}66`,
                padding: "5px 12px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit",
              }}>{tLab("lab_tab_case_profile")}</button>
              <button onClick={() => setEditorTab("layout")} style={{
                background: "transparent", border: "none",
                borderBottom: editorTab === "layout" ? `2px solid ${accent}` : "2px solid transparent",
                color: editorTab === "layout" ? accent : `${text}66`,
                padding: "5px 12px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit",
              }}>{tLab("lab_tab_2d_layout")}</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "6px 8px" }}>
              {editorTab === "case" && (
                <div>
                  {/* Keycap mount adjustment */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: accent, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{tLab("lab_keycap_mount")}</span>
                    {[
                      { axis: "x", label: "X", min: -3, max: 3, step: 0.1, color: "#ff6666" },
                      { axis: "y", label: "Y", min: -2, max: 2, step: 0.05, color: "#66ff66" },
                      { axis: "z", label: "Z", min: -3, max: 3, step: 0.1, color: "#6688ff" },
                    ].map(({ axis, label, min, max, step, color }) => (
                      <label key={axis} style={{ ...lbl, gap: "2px" }}>
                        <span style={{ color, fontWeight: 700, minWidth: "10px" }}>{label}</span>
                        <input type="range" min={min} max={max} step={step} value={mountOffset[axis]}
                          onChange={(e) => setMountOffset(prev => ({ ...prev, [axis]: parseFloat(e.target.value) }))}
                          style={{ width: "45px", accentColor: color }} />
                        <span style={{ minWidth: "28px", fontSize: "11px" }}>{mountOffset[axis].toFixed(1)}</span>
                      </label>
                    ))}
                    <label style={lbl}>
                      {tLab("lab_fit")}
                      <input type="range" min="0.4" max="1.5" step="0.05" value={mountFit}
                        onChange={(e) => setMountFit(parseFloat(e.target.value))}
                        style={{ width: "40px", accentColor: accent }} />
                      <span style={{ minWidth: "24px", fontSize: "11px" }}>{Math.round(mountFit * 100)}%</span>
                    </label>
                    <label style={lbl}>
                      {tLab("lab_scale")}
                      <input type="range" min="0.5" max="2.0" step="0.05" value={caseScale}
                        onChange={(e) => setCaseScale(parseFloat(e.target.value))}
                        style={{ width: "40px", accentColor: accent }} />
                      <span style={{ minWidth: "24px", fontSize: "11px" }}>{Math.round(caseScale * 100)}%</span>
                    </label>
                    <button onClick={() => { setMountOffset(DEFAULTS.mountOffset); setMountFit(DEFAULTS.mountFit); setCaseScale(DEFAULTS.caseScale); setExtrudeWidth(DEFAULTS.extrudeWidth); }} style={btn(false)}>{tLab("lab_reset")}</button>
                  </div>
                  <CaseProfileEditor
                    theme={theme}
                    initialProfile={caseProfile}
                    onChange={setCaseProfile}
                    extrudeWidth={extrudeWidth}
                    onExtrudeWidthChange={setExtrudeWidth}
                  />
                </div>
              )}
              {editorTab === "layout" && (
                <KeyboardLayout2D layout={layout} activeKeys={activeKeys} theme={theme} scale={scale2D} />
              )}
            </div>
          </div>

          {/* Tabbed JSON Editor + Doc */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", borderTop: `1px solid ${text}08` }}>
            <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${text}08` }}>
              {JSON_TAB_KEYS.map(tab => (
                <button key={tab} onClick={() => { setJsonTab(tab); setShowDoc(false); }} style={{
                  background: "transparent", border: "none",
                  borderBottom: jsonTab === tab && !showDoc ? `2px solid ${accent}` : "2px solid transparent",
                  color: jsonTab === tab && !showDoc ? accent : `${text}66`, padding: "5px 10px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit",
                }}>{tLab(JSON_TAB_I18N[tab])}</button>
              ))}
              <button onClick={() => setShowDoc(!showDoc)} style={{
                background: "transparent", border: "none",
                borderBottom: showDoc ? `2px solid ${accent}` : "2px solid transparent",
                color: showDoc ? accent : `${text}66`, padding: "5px 10px", cursor: "pointer", fontSize: "11px", fontFamily: "inherit",
              }}>{tLab("lab_tab_doc")}</button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {showDoc ? (
                <div style={{ height: "100%", overflow: "auto", padding: "12px 16px" }}>
                  <h3 style={{ color: accent, fontSize: "14px", margin: "0 0 12px", fontWeight: 600 }}>{tLab("lab_doc_title")}</h3>
                  {[
                    { key: "lab_doc_design", label: tLab("lab_tab_design") },
                    { key: "lab_doc_layout", label: tLab("lab_tab_layout") },
                    { key: "lab_doc_keycap", label: tLab("lab_tab_keycap") },
                    { key: "lab_doc_legend", label: tLab("lab_tab_legend") },
                    { key: "lab_doc_shell", label: tLab("lab_tab_shell") },
                    { key: "lab_doc_caseProfile", label: tLab("lab_tab_case_profile_json") },
                  ].map(({ key }) => (
                    <pre key={key} style={{
                      color: text, fontSize: "11px", lineHeight: 1.5, fontFamily: "monospace",
                      whiteSpace: "pre-wrap", margin: "0 0 16px",
                      padding: "10px 12px", borderRadius: "6px",
                      background: `${text}08`, border: `1px solid ${text}10`,
                    }}>{tLab(key)}</pre>
                  ))}
                </div>
              ) : (
                <Suspense fallback={<div style={{ padding: "8px", color: text, opacity: 0.3, fontSize: "11px" }}>{tLab("lab_loading")}</div>}>
                  <MonacoEditor
                    key={jsonTab}
                    height="100%"
                    language="json"
                    theme="vs-dark"
                    value={tabJson}
                    onChange={handleJsonChange}
                    onMount={(editor) => { monacoRef.current = editor; }}
                    options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: "off", scrollBeyondLastLine: false,
                      wordWrap: "on", tabSize: 2, renderLineHighlight: "none", overviewRulerBorder: false,
                      padding: { top: 4, bottom: 4 } }}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Roadmap Modal ═══ */}
      {showRoadmap && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }} onClick={() => setShowRoadmap(false)}>
          <div style={{
            background: bg, border: `1px solid ${text}20`, borderRadius: "12px",
            maxWidth: "600px", width: "90%", maxHeight: "80vh", overflow: "auto",
            padding: "28px 32px",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <h2 style={{ color: accent, margin: 0, fontSize: "20px", fontWeight: 700 }}>{tLab("lab_roadmap_title")}</h2>
              <button onClick={() => setShowRoadmap(false)} style={{
                background: "transparent", border: "none", color: `${text}66`, cursor: "pointer", fontSize: "20px", lineHeight: 1,
              }}>×</button>
            </div>
            <p style={{ color: `${text}88`, fontSize: "13px", margin: "0 0 20px" }}>{tLab("lab_roadmap_subtitle")}</p>

            {[
              { titleKey: "lab_roadmap_done", itemsKey: "lab_roadmap_done_items", icon: "✓", color: "#44dd88" },
              { titleKey: "lab_roadmap_next", itemsKey: "lab_roadmap_next_items", icon: "→", color: accent },
              { titleKey: "lab_roadmap_future", itemsKey: "lab_roadmap_future_items", icon: "◇", color: `${text}66` },
            ].map(({ titleKey, itemsKey, icon, color }) => (
              <div key={titleKey} style={{ marginBottom: "20px" }}>
                <h3 style={{ color, fontSize: "14px", fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {tLab(titleKey)}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {(tLab(itemsKey) || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: text, lineHeight: 1.5 }}>
                      <span style={{ color, flexShrink: 0, fontWeight: 700 }}>{icon}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Editor's note */}
            <div style={{ marginTop: "8px", paddingTop: "20px", borderTop: `1px solid ${text}15` }}>
              <h3 style={{ color: accent, fontSize: "14px", fontWeight: 700, margin: "0 0 10px", fontStyle: "italic" }}>
                {tLab("lab_editors_note_title")}
              </h3>
              <div style={{
                color: `${text}cc`, fontSize: "13px", lineHeight: 1.8,
                whiteSpace: "pre-wrap", fontStyle: "italic",
              }}>
                {tLab("lab_editors_note").split(tLab("lab_editors_note_link_text")).map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <React.Fragment key={i}>
                      {part}<a href={tLab("lab_editors_note_link")} target="_blank" rel="noopener noreferrer"
                        style={{ color: accent, textDecoration: "underline" }}>{tLab("lab_editors_note_link_text")}</a>
                    </React.Fragment>
                  ) : <React.Fragment key={i}>{part}</React.Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardLabDemo;
