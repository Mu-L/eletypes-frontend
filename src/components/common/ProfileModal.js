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
import { getUserName, setUserName } from "../../services/userIdentity";
import ScoreHistoryPanel from "../features/Leaderboard/ScoreHistoryPanel";
import { useLocale } from "../../context/LocaleContext";
import {
  DEFAULT_COUNT_DOWN,
  DEFAULT_DIFFICULTY,
  ENGLISH_MODE,
  COUNT_DOWN_90,
  COUNT_DOWN_60,
  COUNT_DOWN_30,
  COUNT_DOWN_15,
  HARD_DIFFICULTY,
  CHINESE_MODE,
} from "../../constants/Constants";

const DURATIONS = [COUNT_DOWN_15, COUNT_DOWN_30, COUNT_DOWN_60, COUNT_DOWN_90];
const DIFFICULTIES = [DEFAULT_DIFFICULTY, HARD_DIFFICULTY];
const LANGUAGES = [
  { value: ENGLISH_MODE, label: "eng" },
  { value: CHINESE_MODE, label: "chn" },
];

const BANNER_KEYS = [
  {
    id: "leaderboard",
    textKey: "banner_leaderboard",
  },
  {
    id: "roblox",
    textKey: "banner_roblox",
    link: "https://www.roblox.com/games/89217440428554/Type",
  },
];

const TAB_PROFILE = "profile";
const TAB_HISTORY = "history";
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
}) => {
  const { locale, setLocale, t } = useLocale();
  const [activeTab, setActiveTab] = useState(TAB_PROFILE);
  const [name, setName] = useState(() => getUserName());
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // History filters
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("language");
    return stored ? JSON.parse(stored) : ENGLISH_MODE;
  });
  const [difficulty, setDifficulty] = useState(() => {
    const stored = localStorage.getItem("difficulty");
    return stored ? JSON.parse(stored) : DEFAULT_DIFFICULTY;
  });
  const [duration, setDuration] = useState(() => {
    const stored = localStorage.getItem("timer-constant");
    return stored ? JSON.parse(stored) : DEFAULT_COUNT_DOWN;
  });
  const [numberAddon, setNumberAddon] = useState(() => {
    const stored = localStorage.getItem("number");
    return stored ? JSON.parse(stored) : false;
  });
  const [symbolAddon, setSymbolAddon] = useState(() => {
    const stored = localStorage.getItem("symbol");
    return stored ? JSON.parse(stored) : false;
  });

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

  const pillStyle = (active) => ({
    background: "transparent",
    border: `1px solid ${active ? theme.stats : theme.textTypeBox}44`,
    borderRadius: "4px",
    color: active ? theme.stats : theme.textTypeBox,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: theme.fontFamily,
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
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
        },
      }}
      PaperProps={{
        style: {
          background: theme.background,
          backdropFilter: "blur(20px)",
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
            style={tabStyle(activeTab === TAB_HISTORY)}
            onClick={() => setActiveTab(TAB_HISTORY)}
          >
            {t("my_history")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_SITE)}
            onClick={() => setActiveTab(TAB_SITE)}
          >
            {t("site")}
          </button>
          <button
            style={tabStyle(activeTab === TAB_NEWS)}
            onClick={() => setActiveTab(TAB_NEWS)}
          >
            {t("news")}
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
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  color: theme.textTypeBox,
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                {t("edit_name")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
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
                    <MuiIconButton
                      onClick={handleSave}
                      style={{ color: theme.stats }}
                    >
                      <CheckIcon fontSize="small" />
                    </MuiIconButton>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: "18px",
                        color: name ? theme.text : theme.textTypeBox,
                        flex: 1,
                      }}
                    >
                      {name || t("click_to_set_name")}
                    </span>
                    <MuiIconButton
                      onClick={() => setIsEditing(true)}
                      style={{ color: theme.textTypeBox }}
                    >
                      <EditIcon fontSize="small" />
                    </MuiIconButton>
                  </>
                )}
              </div>
              {savedMessage && (
                <p
                  style={{
                    color: theme.stats,
                    fontSize: "13px",
                    marginTop: "6px",
                  }}
                >
                  {savedMessage}
                </p>
              )}
            </div>
            <p
              style={{
                color: theme.textTypeBox,
                fontSize: "12px",
                lineHeight: "1.6",
                opacity: 0.7,
                marginTop: "8px",
                borderTop: `1px solid ${theme.textTypeBox}20`,
                paddingTop: "12px",
              }}
            >
              {t("profile_note")}
            </p>
          </div>
        )}

        {/* History tab */}
        {activeTab === TAB_HISTORY && (
          <div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  style={pillStyle(language === lang.value)}
                  onClick={() => setLanguage(lang.value)}
                >
                  {lang.label}
                </button>
              ))}
              <span style={{ color: theme.textTypeBox, alignSelf: "center" }}>
                |
              </span>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  style={pillStyle(difficulty === d)}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
              <span style={{ color: theme.textTypeBox, alignSelf: "center" }}>
                |
              </span>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  style={pillStyle(duration === d)}
                  onClick={() => setDuration(d)}
                >
                  {d}s
                </button>
              ))}
              <span style={{ color: theme.textTypeBox, alignSelf: "center" }}>
                |
              </span>
              <button
                style={pillStyle(numberAddon)}
                onClick={() => setNumberAddon(!numberAddon)}
              >
                +num
              </button>
              <button
                style={pillStyle(symbolAddon)}
                onClick={() => setSymbolAddon(!symbolAddon)}
              >
                +sym
              </button>
            </div>
            <ScoreHistoryPanel
              language={language}
              difficulty={difficulty}
              duration={duration}
              numberAddon={numberAddon}
              symbolAddon={symbolAddon}
              theme={theme}
            />
          </div>
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

        {/* News tab */}
        {activeTab === TAB_NEWS && (
          <div>
            {BANNER_KEYS.length === 0 ? (
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
                {BANNER_KEYS.map((banner) => (
                  <div
                    key={banner.id}
                    style={{
                      padding: "12px 16px",
                      border: `1px solid ${theme.textTypeBox}30`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: theme.text,
                    }}
                  >
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.stats,
                          textDecoration: "underline",
                        }}
                      >
                        {t(banner.textKey)}
                      </a>
                    ) : (
                      t(banner.textKey)
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
