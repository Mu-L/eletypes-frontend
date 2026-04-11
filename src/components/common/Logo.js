import React, { useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Tooltip } from "@mui/material";
import { getUserName } from "../../services/userIdentity";
import { useLocale } from "../../context/LocaleContext";
import ProfileModal from "./ProfileModal";

const BANNER_DISMISS_KEY = "eletypes-banner-dismissed";
const BANNER_VERSION = "banners-v3";

export const BANNER_KEYS = [
  {
    id: "leaderboard",
    bannerTextKey: "banner_leaderboard",
    fullTextKey: "banner_leaderboard_full",
    highlights: [{ placeholder: "submit" }, { placeholder: "提交" }],
  },
  {
    id: "roblox",
    bannerTextKey: "banner_roblox",
    fullTextKey: "banner_roblox_full",
    link: "https://www.roblox.com/games/89217440428554/Type",
    highlights: [
      { placeholder: "Type!", link: "https://www.roblox.com/games/89217440428554/Type" },
    ],
  },
];

const isDismissed = () => {
  try {
    const stored = localStorage.getItem(BANNER_DISMISS_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.version === BANNER_VERSION && parsed.dismissed === true;
  } catch {
    return false;
  }
};

// Render text with {highlighted} portions
const renderHighlighted = (text, highlights, theme) => {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = null;
    let earliestIdx = remaining.length;
    let matchedHighlight = null;

    for (const h of highlights) {
      const pattern = `{${h.placeholder}}`;
      const idx = remaining.indexOf(pattern);
      if (idx !== -1 && idx < earliestIdx) {
        earliest = pattern;
        earliestIdx = idx;
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

const Logo = ({
  isFocusedMode,
  theme,
  soundMode,
  toggleSoundMode,
  isMusicMode,
  toggleMusicMode,
  toggleFocusedMode,
  isUltraZenMode,
  toggleUltraZenMode,
}) => {
  const { t } = useLocale();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState("profile");
  const [userName, setUserNameState] = useState(() => getUserName());
  const [dismissed, setDismissed] = useState(() => isDismissed());

  const newsCount = dismissed ? 0 : BANNER_KEYS.length;

  const dismissAll = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(
      BANNER_DISMISS_KEY,
      JSON.stringify({ version: BANNER_VERSION, dismissed: true })
    );
  }, []);

  const openProfile = (tab) => {
    setProfileInitialTab(tab || "profile");
    setProfileOpen(true);
    if (tab === "news") {
      dismissAll();
    }
  };

  return (
    <>
      <div
        className="header"
        style={{ visibility: isFocusedMode ? "hidden" : "visible" }}
      >
        <div className="logo-row">
          <div className="logo-top">
            <h1 className="logo-title">
              <span className="logo-accent">Ele Types</span>{" "}
              <KeyboardAltIcon className="logo-icon" />
            </h1>
            <span className="user-greeting">
              {userName && `👋 ${userName}, `}
              {t("greeting_suffix")}
            </span>
          </div>
          {!dismissed && (
            <span className="header-banner">
              <span className="header-banner-prompt">&gt;</span>
              {BANNER_KEYS.map((banner, idx) => {
                const text = t(banner.bannerTextKey);
                return (
                  <span key={banner.id}>
                    {idx > 0 && (
                      <span className="header-banner-sep"> · </span>
                    )}
                    {theme
                      ? renderHighlighted(text, banner.highlights, theme)
                      : text}
                  </span>
                );
              })}
              <button className="header-banner-close" onClick={dismissAll}>
                <CloseIcon style={{ fontSize: "12px" }} />
              </button>
            </span>
          )}
        </div>
      </div>
      {theme && (
        <>
          <Tooltip title={t("profile")} placement="left">
            <button
              className="profile-btn"
              onClick={() => openProfile("profile")}
            >
              <span className="profile-bracket">[</span>
              <PersonOutlineIcon style={{ fontSize: "16px" }} />
              <span className="profile-bracket">]</span>
              {newsCount > 0 && (
                <span className="profile-badge">{newsCount}</span>
              )}
            </button>
          </Tooltip>
          <ProfileModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            theme={theme}
            onNameChange={(newName) => setUserNameState(newName)}
            isFocusedMode={isFocusedMode}
            toggleFocusedMode={toggleFocusedMode}
            soundMode={soundMode}
            toggleSoundMode={toggleSoundMode}
            isMusicMode={isMusicMode}
            toggleMusicMode={toggleMusicMode}
            isUltraZenMode={isUltraZenMode}
            toggleUltraZenMode={toggleUltraZenMode}
            initialTab={profileInitialTab}
            onNewsViewed={dismissAll}
            unviewedNewsCount={newsCount}
          />
        </>
      )}
    </>
  );
};

export default Logo;
