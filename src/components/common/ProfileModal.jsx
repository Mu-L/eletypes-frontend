import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton as MuiIconButton,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { getUserName, setUserName, getUserTag } from "../../services/userIdentity";
import BadgeDisplay from "../features/Badges/BadgeDisplay";
import StatsPanel from "../features/Stats/StatsPanel";
import LeaderboardPanel from "../features/Leaderboard/LeaderboardPanel";
import { useLocale } from "../../context/LocaleContext";
import { ALL_NEWS_KEYS } from "./Logo";
import { useLabTranslation } from "../features/KeyboardLab/i18n/useLabTranslation";

const renderNewsHighlighted = (text, highlights, theme) => {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = null;
    let earliestIdx = remaining.length;
    let matchedHighlight = null;

    for (const h of highlights) {
      // Match both {placeholder} and plain "placeholder" in full text
      const patterns = [`{${h.placeholder}}`, `"${h.placeholder}"`];
      for (const pattern of patterns) {
        const idx = remaining.indexOf(pattern);
        if (idx !== -1 && idx < earliestIdx) {
          earliest = pattern;
          earliestIdx = idx;
          matchedHighlight = h;
        }
      }
      // Also match the plain placeholder word
      const plainIdx = remaining.indexOf(h.placeholder);
      if (plainIdx !== -1 && plainIdx < earliestIdx) {
        earliest = h.placeholder;
        earliestIdx = plainIdx;
        matchedHighlight = h;
      }
    }

    if (!earliest) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, earliestIdx)}</span>);
    }

    const label = matchedHighlight.placeholder;
    if (matchedHighlight.link) {
      parts.push(
        <a
          key={key++}
          href={matchedHighlight.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.stats, textDecoration: "underline", fontWeight: 600 }}
        >
          {label}
        </a>
      );
    } else {
      parts.push(
        <span key={key++} style={{ color: theme.stats, fontWeight: 600 }}>
          {label}
        </span>
      );
    }

    remaining = remaining.slice(earliestIdx + earliest.length);
  }

  return parts;
};

const TAB_PROFILE = "profile";
const TAB_STATS = "stats";
const TAB_LEADERBOARD = "leaderboard";
const TAB_LAB = "lab";
const TAB_NEWS = "news";
const TAB_SITE = "site";

const ProfileModal = ({
  open,
  onClose,
  theme,
  onNameChange,
  isFocusedMode,
  toggleFocusedMode,
  soundMode,
  toggleSoundMode,
  isMusicMode,
  toggleMusicMode,
  isUltraZenMode,
  toggleUltraZenMode,
  initialTab,
  onNewsViewed,
  unviewedNewsCount,
}) => {
  const { locale, setLocale, t } = useLocale();
  const tLab = useLabTranslation();
  const [activeTab, setActiveTab] = useState(TAB_PROFILE);

  // Force fresh data when modal opens
  const [refreshKey, setRefreshKey] = useState(0);
  React.useEffect(() => {
    if (open) {
      setRefreshKey((k) => k + 1);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [open, initialTab]);
  const [name, setName] = useState(() => getUserName());
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) {
      setUserName(trimmed);
      setName(trimmed);
      if (onNameChange) onNameChange(trimmed);
    }
    setIsEditing(false);
    setSavedMessage(t("name_updated"));
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
    e.stopPropagation();
  };

  const tabStyle = (isActive) => ({
    background: "transparent",
    border: "none",
    borderBottom: isActive
      ? `2px solid ${theme.stats}`
      : `2px solid transparent`,
    color: isActive ? theme.stats : theme.textTypeBox,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: theme.fontFamily,
    fontWeight: isActive ? 600 : 400,
    transition: "all 0.2s",
  });

  const toggleRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${theme.textTypeBox}20`,
  };

  const toggleLabelStyle = {
    fontSize: "14px",
    color: theme.text,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      BackdropProps={{
        sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
      }}
      PaperProps={{
        style: {
          background: theme.background,
          color: theme.text,
          borderRadius: "8px",
          border: `1px solid ${theme.textTypeBox}33`,
        },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px 0",
          borderBottom: `1px solid ${theme.textTypeBox}30`,
        }}
      >
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          <button
            style={tabStyle(activeTab === TAB_PROFILE)}
            onClick={() => setActiveTab(TAB_PROFILE)}
          >
            {t("profile")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_STATS)}
            onClick={() => setActiveTab(TAB_STATS)}
          >
            {t("stats_tab")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_LEADERBOARD)}
            onClick={() => setActiveTab(TAB_LEADERBOARD)}
          >
            {t("leaderboard")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_LAB)}
            onClick={() => setActiveTab(TAB_LAB)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              {t("keyboard_lab")}
              <span style={{
                fontSize: "8px", fontWeight: 700, letterSpacing: "0.5px",
                textTransform: "uppercase", lineHeight: 1,
                padding: "1px 4px", borderRadius: "3px",
                background: "#4a90d9", color: "#fff",
              }}>beta</span>
            </span>
          </button>
          <button
            style={tabStyle(activeTab === TAB_SITE)}
            onClick={() => setActiveTab(TAB_SITE)}
          >
            {t("site")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_NEWS)}
            onClick={() => {
              setActiveTab(TAB_NEWS);
              if (onNewsViewed) onNewsViewed();
            }}
          >
            {t("news")}
            {unviewedNewsCount > 0 && activeTab !== TAB_NEWS && (
              <span
                style={{
                  fontSize: "10px",
                  background: "transparent",
                  color: theme.stats,
                  border: `1px solid ${theme.stats}`,
                  borderRadius: "50%",
                  minWidth: "16px",
                  height: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  marginLeft: "4px",
                  verticalAlign: "middle",
                  position: "relative",
                  top: "-1px",
                }}
              >
                {unviewedNewsCount}
              </span>
            )}
          </button>
        </div>
        <MuiIconButton onClick={onClose} style={{ color: theme.textTypeBox }}>
          <CloseIcon fontSize="small" />
        </MuiIconButton>
      </div>
      <DialogContent>
        {/* Profile tab */}
        {activeTab === TAB_PROFILE && (
          <div>
            {/* Section: Name */}
            <div className="profile-section">
              <h4 className="profile-section-label" style={{ color: theme.textTypeBox }}>
                {t("edit_name")}
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 20))}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      maxLength={20}
                      placeholder={t("your_name_placeholder")}
                      style={{
                        background: "transparent",
                        border: `1px solid ${theme.textTypeBox}`,
                        borderRadius: "4px",
                        color: theme.text,
                        padding: "8px 12px",
                        fontSize: "16px",
                        fontFamily: theme.fontFamily,
                        outline: "none",
                        flex: 1,
                      }}
                    />
                    <MuiIconButton onClick={handleSave} style={{ color: theme.stats }}>
                      <CheckIcon fontSize="small" />
                    </MuiIconButton>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "18px", color: name ? theme.text : theme.textTypeBox, flex: 1 }}>
                      {name || t("click_to_set_name")}
                      <span style={{ color: theme.textTypeBox, fontSize: "13px", marginLeft: "6px" }}>
                        {getUserTag()}
                      </span>
                    </span>
                    <MuiIconButton onClick={() => setIsEditing(true)} style={{ color: theme.textTypeBox }}>
                      <EditIcon fontSize="small" />
                    </MuiIconButton>
                  </>
                )}
              </div>
              {savedMessage && (
                <p style={{ color: theme.stats, fontSize: "13px", marginTop: "6px" }}>
                  {savedMessage}
                </p>
              )}
              <p style={{ color: theme.textTypeBox, fontSize: "11px", opacity: 0.6, marginTop: "6px", marginBottom: 0 }}>
                {t("profile_note")}
              </p>
            </div>

            {/* Section: Title + Badges (from BadgeDisplay) */}
            <BadgeDisplay theme={theme} />
          </div>
        )}

        {/* Stats tab */}
        {activeTab === TAB_STATS && (
          <StatsPanel key={refreshKey} theme={theme} />
        )}

        {/* Leaderboard tab */}
        {activeTab === TAB_LEADERBOARD && (
          <LeaderboardPanel key={refreshKey} theme={theme} />
        )}

        {/* Site tab */}
        {activeTab === TAB_SITE && (
          <div>
            <div style={toggleRowStyle}>
              <span style={toggleLabelStyle}>{t("site_focus_mode")}</span>
              <Switch
                checked={isFocusedMode}
                onChange={toggleFocusedMode}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.stats,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.stats,
                  },
                }}
              />
            </div>
            <div style={toggleRowStyle}>
              <span style={toggleLabelStyle}>{t("site_sound")}</span>
              <Switch
                checked={soundMode}
                onChange={toggleSoundMode}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.stats,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.stats,
                  },
                }}
              />
            </div>
            <div style={toggleRowStyle}>
              <span style={toggleLabelStyle}>{t("site_music")}</span>
              <Switch
                checked={isMusicMode}
                onChange={toggleMusicMode}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.stats,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.stats,
                  },
                }}
              />
            </div>
            <div style={toggleRowStyle}>
              <span style={toggleLabelStyle}>{t("site_ultra_zen")}</span>
              <Switch
                checked={isUltraZenMode}
                onChange={toggleUltraZenMode}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.stats,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.stats,
                  },
                }}
              />
            </div>
            <div style={{ ...toggleRowStyle, borderBottom: "none" }}>
              <span style={toggleLabelStyle}>{t("site_language")}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: locale === "en" ? theme.stats : theme.textTypeBox,
                  }}
                >
                  EN
                </span>
                <Switch
                  checked={locale === "zh"}
                  onChange={() => setLocale(locale === "en" ? "zh" : "en")}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.stats,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.stats,
                    },
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: locale === "zh" ? theme.stats : theme.textTypeBox,
                  }}
                >
                  中文
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Lab tab */}
        {activeTab === TAB_LAB && (
          <div>
            {/* Under development banner */}
            <div style={{
              border: `2px dashed ${theme.stats}55`,
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              <span style={{ fontSize: "14px", color: theme.stats, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
                🚧 {t("keyboard_lab_under_dev")}
              </span>
              <div style={{ marginTop: "8px" }}>
                <a href="/keyboardlab" style={{
                  display: "inline-block",
                  padding: "8px 20px", borderRadius: "6px",
                  background: `linear-gradient(135deg, #6a4c93, #4a90d9)`,
                  color: "#fff", fontWeight: 600, fontSize: "13px",
                  textDecoration: "none",
                }}>
                  → {t("keyboard_lab")}
                </a>
              </div>
            </div>

            {/* Roadmap */}
            <h3 style={{ color: theme.stats, fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>
              {tLab("lab_roadmap_title")}
            </h3>
            <p style={{ color: theme.textTypeBox, fontSize: "12px", margin: "0 0 16px" }}>
              {tLab("lab_roadmap_subtitle")}
            </p>

            {[
              { titleKey: "lab_roadmap_done", itemsKey: "lab_roadmap_done_items", icon: "✓", color: "#44dd88" },
              { titleKey: "lab_roadmap_next", itemsKey: "lab_roadmap_next_items", icon: "→", color: theme.stats },
              { titleKey: "lab_roadmap_future", itemsKey: "lab_roadmap_future_items", icon: "◇", color: theme.textTypeBox },
            ].map(({ titleKey, itemsKey, icon, color }) => (
              <div key={titleKey} style={{ marginBottom: "16px" }}>
                <h4 style={{ color, fontSize: "13px", fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {tLab(titleKey)}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {(tLab(itemsKey) || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", color: theme.text, lineHeight: 1.5 }}>
                      <span style={{ color, flexShrink: 0, fontWeight: 700 }}>{icon}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Editor's note */}
            <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: `1px solid ${theme.textTypeBox}20` }}>
              <h4 style={{ color: theme.stats, fontSize: "13px", fontWeight: 700, margin: "0 0 8px", fontStyle: "italic" }}>
                {tLab("lab_editors_note_title")}
              </h4>
              <div style={{
                color: theme.textTypeBox, fontSize: "12px", lineHeight: 1.8,
                whiteSpace: "pre-wrap", fontStyle: "italic",
              }}>
                {tLab("lab_editors_note").split(tLab("lab_editors_note_link_text")).map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <React.Fragment key={i}>
                      {part}<a href={tLab("lab_editors_note_link")} target="_blank" rel="noopener noreferrer"
                        style={{ color: theme.stats, textDecoration: "underline" }}>{tLab("lab_editors_note_link_text")}</a>
                    </React.Fragment>
                  ) : <React.Fragment key={i}>{part}</React.Fragment>
                )}
              </div>
            </div>
          </div>
        )}

        {/* News tab */}
        {activeTab === TAB_NEWS && (
          <div>
            {ALL_NEWS_KEYS.length === 0 ? (
              <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
                {t("no_news")}
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {ALL_NEWS_KEYS.map((banner) => {
                  const text = t(banner.fullTextKey);
                  return (
                    <div
                      key={banner.id}
                      style={{
                        padding: "12px 16px",
                        border: `1px solid ${theme.textTypeBox}30`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: theme.textTypeBox,
                      }}
                    >
                      <span style={{ color: theme.stats, fontFamily: "monospace", marginRight: "8px" }}>
                        &gt;
                      </span>
                      {renderNewsHighlighted(text, banner.highlights, theme)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
