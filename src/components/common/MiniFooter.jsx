/**
 * MiniFooter — shared minimal bottom nav for standalone routes.
 *
 * Uses the same bracketed monospace aesthetic as the top nav profile area.
 * Controls: Back, Theme, Sound toggle + type, Language.
 */

import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TranslateIcon from "@mui/icons-material/Translate";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { Tooltip } from "@mui/material";
import Select from "../utils/Select";
import { useLocale } from "../../context/LocaleContext";

const Sep = ({ theme }) => (
  <span style={{ color: theme?.stats || "#6ec6ff", opacity: 0.25, fontSize: "14px", fontFamily: "monospace", userSelect: "none" }}>│</span>
);

const BracketBtn = ({ children, onClick, href, title, theme }) => {
  const Tag = href ? "a" : "button";
  const props = href ? { href } : { onClick };
  return (
    <Tooltip title={title || ""} placement="top">
      <Tag className="profile-btn" {...props} style={href ? { textDecoration: "none" } : {}}>
        <span className="profile-bracket">[</span>
        {children}
        <span className="profile-bracket">]</span>
      </Tag>
    </Tooltip>
  );
};

const MiniFooter = ({
  theme,
  themesOptions,
  handleThemeChange,
  soundMode,
  toggleSoundMode,
  soundOptions,
  soundType,
  handleSoundTypeChange,
  backLabel,
}) => {
  const { locale, setLocale, t } = useLocale();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      flexWrap: "wrap",
    }}>
      <BracketBtn href="/" title={backLabel} theme={theme}>
        <ArrowBackIcon style={{ fontSize: "14px" }} />
        <span style={{ fontSize: "12px", marginLeft: "2px" }}>{backLabel || "Return"}</span>
      </BracketBtn>

      <Sep theme={theme} />

      <BracketBtn title={t("sound_mode_tooltip")} onClick={toggleSoundMode} theme={theme}>
        {soundMode
          ? <VolumeUpIcon style={{ fontSize: "14px" }} />
          : <VolumeOffIcon style={{ fontSize: "14px", opacity: 0.4 }} />
        }
      </BracketBtn>
      {soundMode && (
        <Select
          classNamePrefix="Select"
          value={soundOptions.find((e) => e.label === soundType)}
          options={soundOptions}
          isSearchable={false}
          isSelected={false}
          onChange={handleSoundTypeChange}
          menuPlacement="top"
        />
      )}

      <Sep theme={theme} />

      <BracketBtn theme={theme}>
        <PaletteOutlinedIcon style={{ fontSize: "14px" }} />
      </BracketBtn>
      <Select
        classNamePrefix="Select"
        value={themesOptions.find((e) => e.value.label === theme.label)}
        options={themesOptions}
        isSearchable={false}
        isSelected={false}
        onChange={handleThemeChange}
        menuPlacement="top"
      />

      <Sep theme={theme} />

      <BracketBtn title={t("locale_toggle")} onClick={() => setLocale(locale === "en" ? "zh" : "en")} theme={theme}>
        <TranslateIcon style={{ fontSize: "14px" }} />
      </BracketBtn>
    </div>
  );
};

export default MiniFooter;
