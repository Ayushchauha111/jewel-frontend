import React from "react";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import FullscreenIcon from "@mui/icons-material/Fullscreen"; // Import Fullscreen icon
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"; 
import { Grid, AppBar } from "@mui/material";
import { Box } from "@mui/system";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
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
import SupportMe from "../features/SupportMe";
import GitHubIcon from "@mui/icons-material/GitHub";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import KeyboardAltOutlinedIcon from "@mui/icons-material/KeyboardAltOutlined";
import SchoolIcon from "@mui/icons-material/School";
import { SOUND_MODE_TOOLTIP } from "../features/sound/sound";
import { LyricsOutlined, LyricsSharp, TextFields, FormatSize } from "@mui/icons-material";

// Font options for type box
export const fontOptions = [
  { value: "'Roboto Mono', monospace", label: "Roboto Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'Ubuntu Mono', monospace", label: "Ubuntu Mono" },
  { value: "'Inconsolata', monospace", label: "Inconsolata" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'SF Mono', monospace", label: "SF Mono" },
];

export const fontSizeOptions = [
  { value: "1rem", label: "Small" },
  { value: "1.25rem", label: "Medium" },
  { value: "1.5rem", label: "Large" },
  { value: "1.75rem", label: "X-Large" },
  { value: "2rem", label: "XX-Large" },
];

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
  isLyricsMode,
  toggleLyricsMode,
  isFullscreen,
  toggleFullscreen,
  // Font customization props
  fontFamily,
  fontSize,
  handleFontFamilyChange,
  handleFontSizeChange,
  showFontOptions,
  toggleFontOptions,
}) => {
  const isSiteInfoDisabled = isMusicMode || isFocusedMode;
  const isBottomLogoEnabled = isFocusedMode && !isMusicMode;
  const isTypeTestEnabled = !isCoffeeMode && !isTrainerMode && !isWordsCardMode;

  const getModeButtonClassName = (mode) => {
    if (mode) {
      return "zen-button";
    }
    return "zen-button-deactive";
  };

  const getGameModeButtonClassName = (currMode, buttonMode) => {
    if (currMode === buttonMode) {
      return "active-game-mode-button";
    }
    return "inactive-game-mode-button";
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      className={`bottomBar ${isFocusedMode && "fade-element"}`}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="row">
          <Select
            classNamePrefix="Select"
            value={themesOptions.find((e) => e.value.label === theme.label)}
            options={themesOptions}
            isSearchable={false}
            isSelected={false}
            onChange={handleThemeChange}
            menuPlacement="top"
          ></Select>

          <IconButton onClick={toggleFocusedMode} size="small">
            <Tooltip title={FOCUS_MODE}>
              <span className={getModeButtonClassName(isFocusedMode)}>
                <SelfImprovementIcon fontSize="small"></SelfImprovementIcon>
              </span>
            </Tooltip>
          </IconButton>
          <IconButton onClick={toggleSoundMode} size="small">
            <Tooltip title={SOUND_MODE_TOOLTIP}>
              <span className={getModeButtonClassName(soundMode)}>
                <VolumeUpIcon fontSize="small"></VolumeUpIcon>
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
            ></Select>
          )}
          <IconButton onClick={toggleWordsCardMode} size="small">
            <Tooltip
              title={
                <span style={{ whiteSpace: "pre-line" }}>
                  {WORDS_CARD_MODE}
                </span>
              }
            >
              <span className={getModeButtonClassName(isWordsCardMode)}>
                <SchoolIcon fontSize="small"></SchoolIcon>
              </span>
            </Tooltip>
          </IconButton>
          <IconButton onClick={toggleCoffeeMode} size="small">
            <Tooltip
              title={
                <span style={{ whiteSpace: "pre-line" }}>{FREE_MODE}</span>
              }
            >
              <span className={getModeButtonClassName(isCoffeeMode)}>
                <EmojiFoodBeverageIcon fontSize="small"></EmojiFoodBeverageIcon>
              </span>
            </Tooltip>
          </IconButton>
          <IconButton onClick={toggleTrainerMode} size="small">
            <Tooltip title={TRAINER_MODE}>
              <span className={getModeButtonClassName(isTrainerMode)}>
                <KeyboardAltOutlinedIcon fontSize="small"></KeyboardAltOutlinedIcon>
              </span>
            </Tooltip>
          </IconButton>
          <IconButton onClick={toggleMusicMode} size="small">
            <Tooltip title={MUSIC_MODE}>
              <span className={getModeButtonClassName(isMusicMode)}>
                <MusicNoteIcon fontSize="small"></MusicNoteIcon>
              </span>
            </Tooltip>{" "}
          </IconButton>
          {isTypeTestEnabled && (
            <>
              <IconButton
                onClick={() => {
                  handleGameModeChange(GAME_MODE_DEFAULT);
                }}
                size="small"
              >
                <span
                  className={getGameModeButtonClassName(
                    gameMode,
                    GAME_MODE_DEFAULT
                  )}
                >
                  {WORD_MODE_LABEL}
                </span>
              </IconButton>
              {isWordGameMode && (
                <IconButton onClick={toggleUltraZenMode} size="small">
                  <Tooltip title={ULTRA_ZEN_MODE}>
                    <span className={getModeButtonClassName(isUltraZenMode)}>
                      <ZoomInMapIcon style={{ fontSize: '16px' }} />
                    </span>
                  </Tooltip>{" "}
                </IconButton>
              )}
              <IconButton
                onClick={() => {
                  handleGameModeChange(GAME_MODE_SENTENCE);
                }}
                size="small"
              >
                <span
                  className={getGameModeButtonClassName(
                    gameMode,
                    GAME_MODE_SENTENCE
                  )}
                >
                  {SENTENCE_MODE_LABEL}
                </span>
              </IconButton>
            </>
          )}{/* Add Fullscreen Toggle Button */}
          <IconButton onClick={toggleFullscreen} size="small">
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              <span className={getModeButtonClassName(isFullscreen)}>
                {isFullscreen ? (
                  <FullscreenExitIcon fontSize="small" />
                ) : (
                  <FullscreenIcon fontSize="small" />
                )}
              </span>
            </Tooltip>
          </IconButton>

          {/* Add LyricsMode Toggle Button */}
          <IconButton onClick={toggleLyricsMode} size="small">
            <Tooltip title={isLyricsMode ? "Exit Lyricsmode" : "Enter Lyricsmode"}>
              <span className={getModeButtonClassName(isLyricsMode)}>
                {isLyricsMode ? (
                  <LyricsSharp fontSize="small" />
                ) : (
                  <LyricsOutlined fontSize="small" />
                )}
              </span>
            </Tooltip>
          </IconButton>

          {/* Font Options Toggle */}
          <IconButton onClick={toggleFontOptions} size="small">
            <Tooltip title="Font Options">
              <span className={getModeButtonClassName(showFontOptions)}>
                <TextFields fontSize="small" />
              </span>
            </Tooltip>
          </IconButton>

          {/* Font Family & Size Selectors */}
          {showFontOptions && (
            <>
              <Select
                classNamePrefix="Select"
                value={fontOptions.find((e) => e.value === fontFamily)}
                options={fontOptions}
                isSearchable={false}
                onChange={handleFontFamilyChange}
                menuPlacement="top"
                placeholder="Font"
              />
              <Select
                classNamePrefix="Select"
                value={fontSizeOptions.find((e) => e.value === fontSize)}
                options={fontSizeOptions}
                isSearchable={false}
                onChange={handleFontSizeChange}
                menuPlacement="top"
                placeholder="Size"
              />
            </>
          )}
        </Box>

        
        
        {!isSiteInfoDisabled && (
          <Box display="block" flexDirection="row">
            <SupportMe></SupportMe>
            {/* <Tooltip
              title={
                <span style={{ whiteSpace: "pre-line", fontSize: "12px" }}>
                  {GITHUB_TOOLTIP_TITLE}
                  <Link margin="inherit" href="https://www.github.com/ayushchauha111">
                    {AUTHOR}
                  </Link>
                  <Link
                    margin="inherit"
                    href="https://github.com/Ayushchauha111/Tutorial_demo_backend"
                  >
                    {GITHUB_REPO_LINK}
                  </Link>
                </span>
              }
              placement="top-start"
            >
              <IconButton
                href="https://www.github.com/ayushchauha111"
                color="inherit"
                size="small"
              >
                <GitHubIcon fontSize="small"></GitHubIcon>
              </IconButton>
            </Tooltip> */}
            <IconButton
                href="https://www.github.com/ayushchauha111"
                color="inherit"
                size="small"
              >
                <GitHubIcon fontSize="small"></GitHubIcon>
              </IconButton>
            {/* <Tooltip
              title={
                <span style={{ whiteSpace: "pre-line" }}>
                  <iframe
                    title="discord-widget"
                    src="https://discord.com/widget?id=993567075589181621&theme=dark"
                    width="100%"
                    height="300"
                    allowtransparency="true"
                    frameborder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  ></iframe>
                </span>
              }
              placement="top-start"
            >
              <IconButton color="inherit">
                <SvgIcon>
                  <DiscordIcon></DiscordIcon>
                </SvgIcon>
              </IconButton>
            </Tooltip> */}
          </Box>
        )}
        {isBottomLogoEnabled && (
          <Box display="block" flexDirection="row" className="bottom-info">
            <IconButton
              href="https://www.github.com/ayushchauha111"
              color="inherit"
              size="small"
            >
              <span style={{ fontSize: '12px' }}>
                TypoGram <KeyboardAltIcon style={{ fontSize: '14px' }} />
              </span>
            </IconButton>
          </Box>
        )}
      </Grid>
      
    </AppBar>
  );
};

export default FooterMenu;
