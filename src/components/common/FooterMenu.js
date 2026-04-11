import React, { useState } from "react";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import TranslateIcon from "@mui/icons-material/Translate";
import { AppBar } from "@mui/material";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import LeaderboardModal from "../features/Leaderboard/LeaderboardModal";
import Select from "../utils/Select";
import {
  WORD_MODE_LABEL,
  SENTENCE_MODE_LABEL,
  GAME_MODE_DEFAULT,
  GAME_MODE_SENTENCE,
} from "../../constants/Constants";
import { Link } from "@mui/material";
import SupportMe from "../features/SupportMe";
import GitHubIcon from "@mui/icons-material/GitHub";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import { ReactComponent as DiscordIcon } from "../../assets/Icons/discord.svg";
import { SvgIcon } from "@mui/material";
import KeyboardAltOutlinedIcon from "@mui/icons-material/KeyboardAltOutlined";
import SchoolIcon from "@mui/icons-material/School";
import { useLocale } from "../../context/LocaleContext";

const FooterMenu = ({
  themesOptions,
  theme,
  soundMode,
  toggleSoundMode,
  soundOptions,
  soundType,
  handleSoundTypeChange,
  handleThemeChange,
  toggleFocusedMode,
  toggleMusicMode,
  toggleUltraZenMode,
  isUltraZenMode,
  toggleCoffeeMode,
  isMusicMode,
  isFocusedMode,
  isCoffeeMode,
  gameMode,
  handleGameModeChange,
  isTrainerMode,
  toggleTrainerMode,
  isWordsCardMode,
  isWordGameMode,
  toggleWordsCardMode,
}) => {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const isSiteInfoDisabled = isMusicMode || isFocusedMode;
  const isSpecialMode = isCoffeeMode || isTrainerMode || isWordsCardMode;

  const activeCls = (on) => (on ? "nav-item-active" : "nav-item");
  const modeCls = (currMode, buttonMode) => {
    if (isSpecialMode) return "nav-mode";
    return currMode === buttonMode ? "nav-mode-active" : "nav-mode";
  };

  const handleWordSentenceMode = (mode) => {
    if (isCoffeeMode) toggleCoffeeMode();
    if (isTrainerMode) toggleTrainerMode();
    if (isWordsCardMode) toggleWordsCardMode();
    handleGameModeChange(mode);
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      className={`bottomBar ${isFocusedMode && "fade-element"}`}
      elevation={0}
    >
      <div className="nav-container">
        {/* Group 1: Game Modes */}
        <div className="nav-group">
          <span className="nav-group-label">{t("nav_mode")}</span>
          <div className="nav-group-items">
            <IconButton
              size="small"
              onClick={() => handleWordSentenceMode(GAME_MODE_DEFAULT)}
            >
              <span className={modeCls(gameMode, GAME_MODE_DEFAULT)}>
                {WORD_MODE_LABEL}
              </span>
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleWordSentenceMode(GAME_MODE_SENTENCE)}
            >
              <span className={modeCls(gameMode, GAME_MODE_SENTENCE)}>
                {SENTENCE_MODE_LABEL}
              </span>
            </IconButton>
            <IconButton size="small" onClick={toggleCoffeeMode}>
              <Tooltip title={t("free_mode")}>
                <span className={activeCls(isCoffeeMode)}>
                  <EmojiFoodBeverageIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleTrainerMode}>
              <Tooltip title={t("trainer_mode")}>
                <span className={activeCls(isTrainerMode)}>
                  <KeyboardAltOutlinedIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleWordsCardMode}>
              <Tooltip title={t("words_card_mode")}>
                <span className={activeCls(isWordsCardMode)}>
                  <SchoolIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        </div>

        {/* Group 2: Word mode tools (no label) */}
        {isWordGameMode && (
          <div className="nav-group">
            <div className="nav-group-items">
              <IconButton size="small" onClick={toggleUltraZenMode}>
                <Tooltip title={t("ultra_zen_mode")}>
                  <span className={activeCls(isUltraZenMode)}>
                    <ZoomInMapIcon fontSize="small" />
                  </span>
                </Tooltip>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setLeaderboardOpen(true)}
              >
                <Tooltip title={t("stats_tooltip")}>
                  <span className="nav-item">
                    <LeaderboardIcon fontSize="small" />
                  </span>
                </Tooltip>
              </IconButton>
            </div>
          </div>
        )}

        {/* Group 3: Settings */}
        <div className="nav-group">
          <span className="nav-group-label">{t("nav_settings")}</span>
          <div className="nav-group-items">
            <Select
              classNamePrefix="Select"
              value={themesOptions.find(
                (e) => e.value.label === theme.label
              )}
              options={themesOptions}
              isSearchable={false}
              isSelected={false}
              onChange={handleThemeChange}
              menuPlacement="top"
            />
            <IconButton size="small" onClick={toggleFocusedMode}>
              <Tooltip title={t("focus_mode")}>
                <span className={activeCls(isFocusedMode)}>
                  <SelfImprovementIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleSoundMode}>
              <Tooltip title={t("sound_mode_tooltip")}>
                <span className={activeCls(soundMode)}>
                  {soundMode ? (
                    <VolumeUpIcon fontSize="small" />
                  ) : (
                    <VolumeOffIcon fontSize="small" />
                  )}
                </span>
              </Tooltip>
            </IconButton>
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
            <IconButton size="small" onClick={toggleMusicMode}>
              <Tooltip title={t("music_mode")}>
                <span className={activeCls(isMusicMode)}>
                  <MusicNoteIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            >
              <Tooltip title={t("locale_toggle")}>
                <span className="nav-item">
                  <TranslateIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        </div>

        {/* Group 4: Links */}
        {!isSiteInfoDisabled && (
          <div className="nav-group nav-group-links">
            <div className="nav-group-items">
              <SupportMe />
              <Tooltip
                title={
                  <span
                    style={{ whiteSpace: "pre-line", fontSize: "12px" }}
                  >
                    {t("github_tooltip")}
                    <Link margin="inherit" href="https://muyangguo.xyz">
                      {t("author")}
                    </Link>
                    <Link
                      margin="inherit"
                      href="https://github.com/gamer-ai/eletype-frontend/"
                    >
                      {t("github_repo")}
                    </Link>
                  </span>
                }
                placement="top-start"
              >
                <IconButton
                  size="small"
                  href="https://github.com/gamer-ai/eletype-frontend/"
                  color="inherit"
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  <iframe
                    title="discord-widget"
                    src="https://discord.com/widget?id=993567075589181621&theme=dark"
                    width="300"
                    height="300"
                    allowtransparency="true"
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    style={{ display: "block", border: "none" }}
                  />
                }
                placement="top-start"
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "transparent",
                      padding: 0,
                      maxWidth: "none",
                      boxShadow: "none",
                    },
                  },
                }}
              >
                <IconButton size="small" color="inherit">
                  <SvgIcon fontSize="small">
                    <DiscordIcon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        theme={theme}
      />
    </AppBar>
  );
};

export default FooterMenu;
