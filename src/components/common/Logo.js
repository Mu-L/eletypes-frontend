import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { getUserName } from "../../services/userIdentity";

const BANNER_DISMISS_KEY = "eletypes-banner-dismissed";
const BANNER_VERSION = "banners-v2";

const BANNERS = [
  {
    id: "leaderboard",
    text: "Leaderboard is live — no sign-up needed, just type and submit your scores!",
  },
  {
    id: "roblox",
    text: 'Eletypes is now on Roblox! Play "Type!" with leaderboards and battle modes',
    link: "https://www.roblox.com/games/89217440428554/Type",
  },
];

const Logo = ({ isFocusedMode }) => {
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

  const visibleBanners = BANNERS.filter((b) => !dismissed.includes(b.id));

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
                {banner.text}
              </a>
            ) : (
              banner.text
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
        <h1 className="logo-title">eletypes</h1>
        {userName && <span className="user-greeting">👋 {userName}</span>}
      </div>
    </div>
  );
};

export default Logo;
