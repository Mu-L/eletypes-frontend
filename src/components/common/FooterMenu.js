import React, { useState } from "react";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { AppBar } from "@mui/material";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import LeaderboardModal from "../features/Leaderboard/LeaderboardModal";
import Select from "../utils/Select";
import {
  FOCUS_MODE,
  FREE_MODE,
  MUSIC_MODE,
  WORD_MODE_LABEL,
  SENTENCE_MODE_LABEL,
  GAME_MODE_DEFAULT,
  GAME_MODE_SENTENCE,
  TRAINER_MODE,
  WORDS_CARD_MODE,
  ULTRA_ZEN_MODE,
} from "../../constants/Constants";
import { Link } from "@mui/material";
import SupportMe from "../features/SupportMe";
import {
  GITHUB_TOOLTIP_TITLE,
  AUTHOR,
  GITHUB_REPO_LINK,
} from "../../constants/Constants";
import GitHubIcon from "@mui/icons-material/GitHub";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import { ReactComponent as DiscordIcon } from "../../assets/Icons/discord.svg";
import { SvgIcon } from "@mui/material";
import KeyboardAltOutlinedIcon from "@mui/icons-material/KeyboardAltOutlined";
import SchoolIcon from "@mui/icons-material/School";
import { SOUND_MODE_TOOLTIP } from "../features/sound/sound";

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
  const isSiteInfoDisabled = isMusicMode || isFocusedMode;
  const isSpecialMode = isCoffeeMode || isTrainerMode || isWordsCardMode;

  const activeCls = (on) => (on ? "nav-item-active" : "nav-item");
  const modeCls = (currMode, buttonMode) => {
    if (isSpecialMode) return "nav-mode";
    return currMode === buttonMode ? "nav-mode-active" : "nav-mode";
  };

  const handleWordSentenceMode = (mode) => {
    // Clicking word/sentence deactivates any special mode
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
          <span className="nav-group-label">mode</span>
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
              <Tooltip title={FREE_MODE}>
                <span className={activeCls(isCoffeeMode)}>
                  <EmojiFoodBeverageIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleTrainerMode}>
              <Tooltip title={TRAINER_MODE}>
                <span className={activeCls(isTrainerMode)}>
                  <KeyboardAltOutlinedIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleWordsCardMode}>
              <Tooltip title={WORDS_CARD_MODE}>
                <span className={activeCls(isWordsCardMode)}>
                  <SchoolIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        </div>

        {/* Group 2: Mode Options (contextual) */}
        {isWordGameMode && (
          <div className="nav-group">
            <div className="nav-group-items">
              <IconButton size="small" onClick={toggleUltraZenMode}>
                <Tooltip title={ULTRA_ZEN_MODE}>
                  <span className={activeCls(isUltraZenMode)}>
                    <ZoomInMapIcon fontSize="small" />
                  </span>
                </Tooltip>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setLeaderboardOpen(true)}
              >
                <Tooltip title="Stats">
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
          <span className="nav-group-label">settings</span>
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
              <Tooltip title={FOCUS_MODE}>
                <span className={activeCls(isFocusedMode)}>
                  <SelfImprovementIcon fontSize="small" />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton size="small" onClick={toggleSoundMode}>
              <Tooltip title={SOUND_MODE_TOOLTIP}>
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
              <Tooltip title={MUSIC_MODE}>
                <span className={activeCls(isMusicMode)}>
                  <MusicNoteIcon fontSize="small" />
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
                    {GITHUB_TOOLTIP_TITLE}
                    <Link margin="inherit" href="https://muyangguo.xyz">
                      {AUTHOR}
                    </Link>
                    <Link
                      margin="inherit"
                      href="https://github.com/gamer-ai/eletype-frontend/"
                    >
                      {GITHUB_REPO_LINK}
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
                  <span style={{ whiteSpace: "pre-line" }}>
                    <iframe
                      title="discord-widget"
                      src="https://discord.com/widget?id=993567075589181621&theme=dark"
                      width="100%"
                      height="300"
                      allowtransparency="true"
                      frameBorder="0"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    ></iframe>
                  </span>
                }
                placement="top-start"
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
