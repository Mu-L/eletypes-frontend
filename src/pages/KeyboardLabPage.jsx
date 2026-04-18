/**
 * KeyboardLabPage — standalone route at /keyboardlab.
 */

import React, { lazy, Suspense } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../style/global";
import { defaultTheme, themesOptions } from "../style/theme";
import { LocaleProvider } from "../context/LocaleContext";
import useLocalPersistState from "../hooks/useLocalPersistState";
import Logo from "../components/common/Logo";
import DynamicBackground from "../components/common/DynamicBackground";
import MiniFooter from "../components/common/MiniFooter";
import { useLabTranslation } from "../components/features/KeyboardLab/i18n/useLabTranslation";
import {
  SOUND_MODE,
  soundOptions,
  DEFAULT_SOUND_TYPE,
  DEFAULT_SOUND_TYPE_KEY,
} from "../components/features/sound/sound";

const KeyboardLabDemo = lazy(() =>
  import("../components/features/KeyboardLab/KeyboardLabDemo")
);

const KeyboardLabInner = ({ theme, handleThemeChange }) => {
  const [soundMode, setSoundMode] = useLocalPersistState(SOUND_MODE, "sound-mode");
  const [soundType, setSoundType] = useLocalPersistState(DEFAULT_SOUND_TYPE, DEFAULT_SOUND_TYPE_KEY);
  const tLab = useLabTranslation();

  return (
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
            <KeyboardLabDemo theme={theme} soundMode={soundMode} soundType={soundType} />
          </div>
        </Suspense>
        <div className="bottomBar">
          <MiniFooter
            theme={theme}
            themesOptions={themesOptions}
            handleThemeChange={handleThemeChange}
            soundMode={soundMode}
            toggleSoundMode={() => setSoundMode(!soundMode)}
            soundOptions={soundOptions}
            soundType={soundType}
            handleSoundTypeChange={(e) => setSoundType(e.label)}
            backLabel={tLab("lab_return")}
          />
        </div>
      </div>
    </>
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
        <KeyboardLabInner theme={theme} handleThemeChange={handleThemeChange} />
      </ThemeProvider>
    </LocaleProvider>
  );
};

export default KeyboardLabPage;
