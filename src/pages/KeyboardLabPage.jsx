/**
 * KeyboardLabPage — standalone route at /keyboardlab.
 *
 * Shares the Logo header with the main app.
 * Has its own minimal bottom nav: Back, Theme, Language.
 */

import React, { lazy, Suspense } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../style/global";
import { defaultTheme, themesOptions } from "../style/theme";
import { LocaleProvider, useLocale } from "../context/LocaleContext";
import useLocalPersistState from "../hooks/useLocalPersistState";
import Logo from "../components/common/Logo";
import DynamicBackground from "../components/common/DynamicBackground";
import Select from "../components/utils/Select";
import { AppBar, Tooltip, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TranslateIcon from "@mui/icons-material/Translate";
import { useLabTranslation } from "../components/features/KeyboardLab/i18n/useLabTranslation";

const KeyboardLabDemo = lazy(() =>
  import("../components/features/KeyboardLab/KeyboardLabDemo")
);

const LabFooter = ({ theme, themesOptions, handleThemeChange }) => {
  const { locale, setLocale } = useLocale();
  const tLab = useLabTranslation();

  return (
    <AppBar position="static" color="transparent" style={{ boxShadow: "none" }}>
      <div className="nav-container" style={{ justifyContent: "flex-start", paddingLeft: "16px" }}>
        <div className="nav-group">
          <div className="nav-group-items">
            <IconButton size="small" component="a" href="/" style={{ borderRadius: "4px", gap: "4px" }}>
              <ArrowBackIcon fontSize="small" style={{ color: theme.text, opacity: 0.6 }} />
              <span style={{ color: theme.text, opacity: 0.6, fontSize: "12px" }}>{tLab("lab_return")}</span>
            </IconButton>
          </div>
        </div>

        <div className="nav-group">
          <span className="nav-group-label">{tLab("lab_theme")}</span>
          <div className="nav-group-items">
            <Select
              classNamePrefix="Select"
              value={themesOptions.find((e) => e.value.label === theme.label)}
              options={themesOptions}
              isSearchable={false}
              isSelected={false}
              onChange={handleThemeChange}
              menuPlacement="top"
            />
          </div>
        </div>

        <IconButton
          size="small"
          onClick={() => setLocale(locale === "en" ? "zh" : "en")}
        >
          <span style={{ color: theme.text, opacity: 0.6 }}>
            <TranslateIcon fontSize="small" />
          </span>
        </IconButton>
      </div>
    </AppBar>
  );
};

const KeyboardLabPage = () => {
  const [theme, setTheme] = useLocalPersistState(defaultTheme, "theme");

  const handleThemeChange = (e) => {
    window.localStorage.setItem("theme", JSON.stringify(e.value));
    setTheme(e.value);
  };

  return (
    <LocaleProvider>
      <ThemeProvider theme={theme}>
        <>
          <DynamicBackground theme={theme} />
          <div className="canvas">
            <GlobalStyles />
            <Logo
              isFocusedMode={false}
              theme={theme}
              soundMode={false}
              toggleSoundMode={() => {}}
              isMusicMode={false}
              toggleMusicMode={() => {}}
              toggleFocusedMode={() => {}}
              isUltraZenMode={false}
              toggleUltraZenMode={() => {}}
            />
            <Suspense
              fallback={
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "calc(100vh - 200px)",
                  color: theme.text, fontFamily: theme.fontFamily,
                }}>
                  Loading Keyboard Lab…
                </div>
              }
            >
              <div style={{ height: "calc(100vh - 200px)", maxHeight: "calc(100vh - 200px)", overflow: "hidden" }}>
                <KeyboardLabDemo theme={theme} />
              </div>
            </Suspense>
            <div className="bottomBar">
              <LabFooter
                theme={theme}
                themesOptions={themesOptions}
                handleThemeChange={handleThemeChange}
              />
            </div>
          </div>
        </>
      </ThemeProvider>
    </LocaleProvider>
  );
};

export default KeyboardLabPage;
