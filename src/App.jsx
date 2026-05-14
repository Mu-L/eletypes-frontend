import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./style/theme";
import {
  loadCustomThemes,
  resolveTheme,
} from "./style/customThemes";
import { GlobalStyles } from "./style/global";
import { LocaleProvider } from "./context/LocaleContext";
import Logo from "./components/common/Logo";
import MusicPlayerSnackbar from "./components/features/MusicPlayer/MusicPlayerSnackbar";
import FooterMenu from "./components/common/FooterMenu";
import CustomThemeEditor from "./components/features/CustomTheme/CustomThemeEditor";
import useCustomThemeEditor from "./hooks/useCustomThemeEditor";
import {
  GAME_MODE,
  GAME_MODE_DEFAULT,
  GAME_MODE_SENTENCE,
} from "./constants/Constants";
import useLocalPersistState from "./hooks/useLocalPersistState";
import {
  SOUND_MODE,
  soundOptions,
  DEFAULT_SOUND_TYPE,
  DEFAULT_SOUND_TYPE_KEY,
} from "./components/features/sound/sound";
import DynamicBackground from "./components/common/DynamicBackground";
import TypeBox from "./components/features/TypeBox/TypeBox";
import SentenceBox from "./components/features/SentenceBox/SentenceBox";
import { parseChallengeParams, clearChallengeParams } from "./services/challengeLink";
import { generateSeed } from "./scripts/seedUtils";

const DefaultKeyboard = lazy(() => import("./components/features/Keyboard/DefaultKeyboard"));
const WordsCard = lazy(() => import("./components/features/WordsCard/WordsCard"));

// Parse challenge params once at module level before any React renders
const initialChallenge = (() => {
  const params = parseChallengeParams();
  if (params) {
    clearChallengeParams();
    // Force settings into localStorage so useLocalPersistState picks them up
    window.localStorage.setItem("timer-constant", JSON.stringify(params.timer));
    window.localStorage.setItem("difficulty", JSON.stringify(params.difficulty));
    window.localStorage.setItem("language", JSON.stringify(params.language));
    window.localStorage.setItem("number", JSON.stringify(params.numberAddOn));
    window.localStorage.setItem("symbol", JSON.stringify(params.symbolAddOn));
    // Force word mode
    window.localStorage.setItem("game-mode", JSON.stringify(GAME_MODE_DEFAULT));
    window.localStorage.setItem("IsInWordsCardMode", JSON.stringify(false));
  }
  return params;
})();

function App() {
  // Every session gets a seed — from challenge URL or freshly generated
  const [sessionSeed, setSessionSeed] = useState(
    () => initialChallenge?.seed || generateSeed()
  );

  // Active theme. Resolved against built-in + custom so both kinds round-trip.
  const [theme, setTheme] = useState(() => {
    const raw = window.localStorage.getItem("theme");
    if (raw == null) return defaultTheme;
    try {
      return resolveTheme(JSON.parse(raw), loadCustomThemes());
    } catch {
      return defaultTheme;
    }
  });

  // While the editor is open, `theme` doubles as the in-progress edit so the
  // page previews live; cancel restores the previous theme.
  const {
    customThemes,
    editorOpen,
    editorMode,
    openEditorForNew,
    openEditorForCurrent,
    openEditorForId,
    activateTheme,
    deleteCustomThemeById,
    handleEditorChange,
    handleEditorSave,
    handleEditorCancel,
    handleEditorDelete,
  } = useCustomThemeEditor({ theme, setTheme });

  // local persist game mode setting
  const [soundMode, setSoundMode] = useLocalPersistState(false, SOUND_MODE);

  const [soundType, setSoundType] = useLocalPersistState(
    DEFAULT_SOUND_TYPE,
    DEFAULT_SOUND_TYPE_KEY
  );

  // local persist game mode setting
  const [gameMode, setGameMode] = useLocalPersistState(
    GAME_MODE_DEFAULT,
    GAME_MODE
  );

  const handleGameModeChange = (currGameMode) => {
    setGameMode(currGameMode);
  };

  // localStorage persist focusedMode setting
  const [isFocusedMode, setIsFocusedMode] = useState(
    localStorage.getItem("focused-mode") === "true"
  );

  // musicMode setting
  const [isMusicMode, setIsMusicMode] = useState(false);

  // ultraZenMode setting
  const [isUltraZenMode, setIsUltraZenMode] = useState(
    localStorage.getItem("ultra-zen-mode") === "true"
  );

  // trainer mode setting
  const [isTrainerMode, setIsTrainerMode] = useState(false);

  // words card mode
  const [isWordsCardMode, setIsWordsCardMode] = useLocalPersistState(
    false,
    "IsInWordsCardMode"
  );

  const isWordGameMode =
    gameMode === GAME_MODE_DEFAULT &&
    !isTrainerMode &&
    !isWordsCardMode;
  const isSentenceGameMode =
    gameMode === GAME_MODE_SENTENCE &&
    !isTrainerMode &&
    !isWordsCardMode;

  const handleThemeChange = (e) => {
    window.localStorage.setItem("theme", JSON.stringify(e.value));
    setTheme(e.value);
  };

  const handleSoundTypeChange = (e) => {
    setSoundType(e.label);
  };

  const toggleFocusedMode = () => {
    setIsFocusedMode(!isFocusedMode);
  };

  const toggleSoundMode = () => {
    setSoundMode(!soundMode);
  };

  const toggleMusicMode = () => {
    setIsMusicMode(!isMusicMode);
  };

  const toggleUltraZenMode = () => {
    setIsUltraZenMode(!isUltraZenMode);
  };

  const toggleTrainerMode = () => {
    setIsTrainerMode(!isTrainerMode);
    setIsWordsCardMode(false);
  };

  const toggleWordsCardMode = () => {
    setIsTrainerMode(false);
    setIsWordsCardMode(!isWordsCardMode);
  };

  useEffect(() => {
    localStorage.setItem("focused-mode", isFocusedMode);
  }, [isFocusedMode]);

  useEffect(() => {
    localStorage.setItem("ultra-zen-mode", isUltraZenMode);
  }, [isUltraZenMode]);

  const textInputRef = useRef(null);
  const focusTextInput = () => {
    textInputRef.current && textInputRef.current.focus();
  };

  const textAreaRef = useRef(null);
  const focusTextArea = () => {
    textAreaRef.current && textAreaRef.current.focus();
  };

  const sentenceInputRef = useRef(null);
  const focusSentenceInput = () => {
    sentenceInputRef.current && sentenceInputRef.current.focus();
  };

  useEffect(() => {
    // Don't steal focus from the custom-theme editor while the user is typing
    // in it (live-preview theme changes would otherwise re-fire this effect).
    if (editorOpen) return;
    if (isWordGameMode) {
      focusTextInput();
      return;
    }
    if (isSentenceGameMode) {
      focusSentenceInput();
      return;
    }
    return;
  }, [
    theme,
    isFocusedMode,
    isMusicMode,
    isWordGameMode,
    isSentenceGameMode,
    soundMode,
    soundType,
    editorOpen,
  ]);

  return (
    <LocaleProvider>
    <ThemeProvider theme={theme}>
      <>
        <DynamicBackground theme={theme}></DynamicBackground>
        <div className="canvas">
          <GlobalStyles />
          <Logo
            isFocusedMode={isFocusedMode}
            theme={theme}
            soundMode={soundMode}
            toggleSoundMode={toggleSoundMode}
            isMusicMode={isMusicMode}
            toggleMusicMode={toggleMusicMode}
            toggleFocusedMode={toggleFocusedMode}
            isUltraZenMode={isUltraZenMode}
            toggleUltraZenMode={toggleUltraZenMode}
            customThemes={customThemes}
            onActivateTheme={activateTheme}
            onCreateTheme={openEditorForNew}
            onEditTheme={openEditorForId}
            onDeleteTheme={deleteCustomThemeById}
          ></Logo>
          {isWordGameMode && (
            <TypeBox
              isUltraZenMode={isUltraZenMode}
              textInputRef={textInputRef}
              isFocusedMode={isFocusedMode}
              soundMode={soundMode}
              theme={theme}
              soundType={soundType}
              key="type-box"
              handleInputFocus={() => focusTextInput()}
              sessionSeed={sessionSeed}
              setSessionSeed={setSessionSeed}
            ></TypeBox>
          )}
          {isSentenceGameMode && (
            <SentenceBox
              sentenceInputRef={sentenceInputRef}
              isFocusedMode={isFocusedMode}
              soundMode={soundMode}
              soundType={soundType}
              key="sentence-box"
              handleInputFocus={() => focusSentenceInput()}
            ></SentenceBox>
          )}
          <Suspense fallback={null}>
            {isTrainerMode && !isWordsCardMode && (
              <DefaultKeyboard
                soundMode={soundMode}
                soundType={soundType}
              ></DefaultKeyboard>
            )}
            {isWordsCardMode && !isTrainerMode && (
              <WordsCard soundMode={soundMode} soundType={soundType}></WordsCard>
            )}
          </Suspense>
          <div className="bottomBar">
            <FooterMenu
              isWordGameMode={isWordGameMode}
              customThemes={customThemes}
              theme={theme}
              soundMode={soundMode}
              toggleSoundMode={toggleSoundMode}
              soundOptions={soundOptions}
              soundType={soundType}
              toggleUltraZenMode={toggleUltraZenMode}
              handleSoundTypeChange={handleSoundTypeChange}
              handleThemeChange={handleThemeChange}
              onCreateTheme={openEditorForNew}
              onEditCurrentTheme={openEditorForCurrent}
              toggleFocusedMode={toggleFocusedMode}
              toggleMusicMode={toggleMusicMode}
              isMusicMode={isMusicMode}
              isUltraZenMode={isUltraZenMode}
              isFocusedMode={isFocusedMode}
              gameMode={gameMode}
              handleGameModeChange={handleGameModeChange}
              isTrainerMode={isTrainerMode}
              toggleTrainerMode={toggleTrainerMode}
              isWordsCardMode={isWordsCardMode}
              toggleWordsCardMode={toggleWordsCardMode}
            ></FooterMenu>
          </div>
          <CustomThemeEditor
            open={editorOpen}
            workingTheme={editorOpen ? theme : null}
            onChange={handleEditorChange}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
            onDelete={handleEditorDelete}
            isExistingCustom={editorMode === "edit"}
            existingNames={customThemes
              .filter((t) => editorMode !== "edit" || t.id !== theme?.id)
              .map((t) => t.label)}
          />
          <MusicPlayerSnackbar
            isMusicMode={isMusicMode}
            isFocusedMode={isFocusedMode}
            onMouseLeave={() => focusTextInput()}
          ></MusicPlayerSnackbar>
        </div>
      </>
    </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;
