import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";
import { getUserName } from "../../services/userIdentity";
import { useLocale } from "../../context/LocaleContext";

const BANNER_DISMISS_KEY = "eletypes-banner-dismissed";
const BANNER_VERSION = "banners-v2";

const BANNER_KEYS = [
  { id: "leaderboard", textKey: "banner_leaderboard" },
  {
    id: "roblox",
    textKey: "banner_roblox",
    link: "https://www.roblox.com/games/89217440428554/Type",
  },
];

const Logo = ({ isFocusedMode }) => {
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(BANNER_DISMISS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (parsed.version !== BANNER_VERSION) return [];
      return parsed.ids || [];
    } catch {
      return [];
    }
  });

  const userName = getUserName();
  const visibleBanners = BANNER_KEYS.filter((b) => !dismissed.includes(b.id));

  const dismissBanner = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem(
      BANNER_DISMISS_KEY,
      JSON.stringify({ version: BANNER_VERSION, ids: updated })
    );
  };

  return (
    <div
      className="header"
      style={{ visibility: isFocusedMode ? "hidden" : "visible" }}
    >
      {visibleBanners.map((banner) => (
        <div className="global-banner" key={banner.id}>
          <span className="global-banner-text">
            {banner.link ? (
              <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {t(banner.textKey)}
              </a>
            ) : (
              t(banner.textKey)
            )}
          </span>
          <button
            className="global-banner-close"
            onClick={() => dismissBanner(banner.id)}
          >
            <CloseIcon style={{ fontSize: "14px" }} />
          </button>
        </div>
      ))}
      <div className="logo-row">
        <h1 className="logo-title">
          <span className="logo-accent">Ele Types</span>{" "}
          <KeyboardAltIcon className="logo-icon" />
        </h1>
        <span className="user-greeting">
          {userName && `👋 ${userName}, `}
          {t("greeting_suffix")}
        </span>
      </div>
    </div>
  );
};

export default Logo;
