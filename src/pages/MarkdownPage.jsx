/**
 * MarkdownPage — standalone route at /markdown.
 */

import React, { lazy, Suspense, useRef } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../style/global";
import { defaultTheme, themesOptions } from "../style/theme";
import { LocaleProvider, useLocale } from "../context/LocaleContext";
import useLocalPersistState from "../hooks/useLocalPersistState";
import Logo from "../components/common/Logo";
import DynamicBackground from "../components/common/DynamicBackground";
import MiniFooter from "../components/common/MiniFooter";
import {
  SOUND_MODE,
  soundOptions,
  DEFAULT_SOUND_TYPE,
  DEFAULT_SOUND_TYPE_KEY,
} from "../components/features/sound/sound";

const FreeTypingBox = lazy(() =>
  import("../components/features/FreeTypingBox")
);

const MarkdownPage = () => {
  const [theme, setTheme] = useLocalPersistState(defaultTheme, "theme");
  const [soundMode, setSoundMode] = useLocalPersistState(SOUND_MODE, "sound-mode");
  const [soundType, setSoundType] = useLocalPersistState(DEFAULT_SOUND_TYPE, DEFAULT_SOUND_TYPE_KEY);
  const textAreaRef = useRef(null);

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
            <div style={{ height: "calc(100vh - 200px)", overflow: "hidden" }}>
              <Suspense fallback={null}>
                <FreeTypingBox
                  textAreaRef={textAreaRef}
                  soundMode={soundMode}
                  soundType={soundType}
                />
              </Suspense>
            </div>
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
              />
            </div>
          </div>
        </>
      </ThemeProvider>
    </LocaleProvider>
  );
};

export default MarkdownPage;
