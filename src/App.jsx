import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme, themesOptions } from "./style/theme";
import { GlobalStyles } from "./style/global";
import { LocaleProvider } from "./context/LocaleContext";
import Logo from "./components/common/Logo";
import MusicPlayerSnackbar from "./components/features/MusicPlayer/MusicPlayerSnackbar";
import FooterMenu from "./components/common/FooterMenu";
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

const FreeTypingBox = lazy(() => import("./components/features/FreeTypingBox"));
const DefaultKeyboard = lazy(() => import("./components/features/Keyboard/DefaultKeyboard"));
const WordsCard = lazy(() => import("./components/features/WordsCard/WordsCard"));
const KeyboardLabDemo = lazy(() => import("./components/features/KeyboardLab/KeyboardLabDemo"));

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

  // localStorage persist theme setting
  const [theme, setTheme] = useState(() => {
    const stickyTheme = window.localStorage.getItem("theme");
    if (stickyTheme !== null) {
      const localTheme = JSON.parse(stickyTheme);
      const upstreamTheme = themesOptions.find(
        (e) => e.label === localTheme.label
      ).value;
      // we will do a deep equal here. In case we want to support customized local theme.
      const isDeepEqual = localTheme === upstreamTheme;
      return isDeepEqual ? localTheme : upstreamTheme;
    }
    return defaultTheme;
  });

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

  // coffeeMode setting
  const [isCoffeeMode, setIsCoffeeMode] = useState(false);

  // trainer mode setting
  const [isTrainerMode, setIsTrainerMode] = useState(false);

  // words card mode
  const [isWordsCardMode, setIsWordsCardMode] = useLocalPersistState(
    false,
    "IsInWordsCardMode"
  );

  // keyboard lab mode
  const [isKeyboardLabMode, setIsKeyboardLabMode] = useState(false);

  const isWordGameMode =
    gameMode === GAME_MODE_DEFAULT &&
    !isCoffeeMode &&
    !isTrainerMode &&
    !isWordsCardMode &&
    !isKeyboardLabMode;
  const isSentenceGameMode =
    gameMode === GAME_MODE_SENTENCE &&
    !isCoffeeMode &&
    !isTrainerMode &&
    !isWordsCardMode &&
    !isKeyboardLabMode;

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

  const toggleCoffeeMode = () => {
    setIsCoffeeMode(!isCoffeeMode);
    setIsTrainerMode(false);
    setIsWordsCardMode(false);
    setIsKeyboardLabMode(false);
  };

  const toggleTrainerMode = () => {
    setIsTrainerMode(!isTrainerMode);
    setIsCoffeeMode(false);
    setIsWordsCardMode(false);
    setIsKeyboardLabMode(false);
  };

  const toggleWordsCardMode = () => {
    setIsTrainerMode(false);
    setIsCoffeeMode(false);
    setIsWordsCardMode(!isWordsCardMode);
    setIsKeyboardLabMode(false);
  };

  const toggleKeyboardLabMode = () => {
    setIsKeyboardLabMode(!isKeyboardLabMode);
    setIsTrainerMode(false);
    setIsCoffeeMode(false);
    setIsWordsCardMode(false);
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
    if (isWordGameMode) {
      focusTextInput();
      return;
    }
    if (isSentenceGameMode) {
      focusSentenceInput();
      return;
    }
    if (isCoffeeMode) {
      focusTextArea();
      return;
    }
    return;
  }, [
    theme,
    isFocusedMode,
    isMusicMode,
    isCoffeeMode,
    isWordGameMode,
    isSentenceGameMode,
    soundMode,
    soundType,
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
            {isCoffeeMode && !isTrainerMode && !isWordsCardMode && (
              <FreeTypingBox
                textAreaRef={textAreaRef}
                soundMode={soundMode}
                soundType={soundType}
              />
            )}
            {isTrainerMode && !isCoffeeMode && !isWordsCardMode && (
              <DefaultKeyboard
                soundMode={soundMode}
                soundType={soundType}
              ></DefaultKeyboard>
            )}
            {isWordsCardMode && !isCoffeeMode && !isTrainerMode && !isKeyboardLabMode && (
              <WordsCard soundMode={soundMode} soundType={soundType}></WordsCard>
            )}
            {isKeyboardLabMode && (
              <KeyboardLabDemo theme={theme} />
            )}
          </Suspense>
          <div className="bottomBar">
            <FooterMenu
              isWordGameMode={isWordGameMode}
              themesOptions={themesOptions}
              theme={theme}
              soundMode={soundMode}
              toggleSoundMode={toggleSoundMode}
              soundOptions={soundOptions}
              soundType={soundType}
              toggleUltraZenMode={toggleUltraZenMode}
              handleSoundTypeChange={handleSoundTypeChange}
              handleThemeChange={handleThemeChange}
              toggleFocusedMode={toggleFocusedMode}
              toggleMusicMode={toggleMusicMode}
              toggleCoffeeMode={toggleCoffeeMode}
              isCoffeeMode={isCoffeeMode}
              isMusicMode={isMusicMode}
              isUltraZenMode={isUltraZenMode}
              isFocusedMode={isFocusedMode}
              gameMode={gameMode}
              handleGameModeChange={handleGameModeChange}
              isTrainerMode={isTrainerMode}
              toggleTrainerMode={toggleTrainerMode}
              isWordsCardMode={isWordsCardMode}
              toggleWordsCardMode={toggleWordsCardMode}
              isKeyboardLabMode={isKeyboardLabMode}
              toggleKeyboardLabMode={toggleKeyboardLabMode}
            ></FooterMenu>
          </div>
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
