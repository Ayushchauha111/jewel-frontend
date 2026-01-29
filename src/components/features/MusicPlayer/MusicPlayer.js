import React, { useState, useEffect, useRef } from "react";
import { Slide, Button, IconButton, Typography, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

const MusicPlayer = ({ disabled, isZenMode }) => {
  const [isVideo, setIsVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const playerRef = useRef(null);

  const height = isZenMode ? (isVideo ? "80" : "60") : isVideo ? "240" : "60";

  const musicUrls = [
    { title: "Song 1", url: "r6SbfF9FjTg" },
    { title: "Song 2", url: "dQw4w9WgXcQ" },
    { title: "Song 3", url: "7ghhRHRP6t4" },
  ];

  // Load YouTube IFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = initializePlayer;
      document.body.appendChild(tag);
    } else {
      initializePlayer();
    }
  }, []);

  // Initialize or reinitialize the YouTube player
  const initializePlayer = () => {
    if (!isVideo) {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy(); // Destroy the existing player
      }
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: musicUrls[currentSongIndex].url, // Use the current song's video ID
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    }
  };

  // Reinitialize the player when the song changes
  useEffect(() => {
    if (!isVideo) {
      initializePlayer();
    }
  }, [currentSongIndex, isVideo]);

  // Cleanup YouTube player when switching modes or unmounting
  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Handle player ready event
  const onPlayerReady = (event) => {
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  // Handle player state change
  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      handleNext();
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  };

  // Handle player error
  const onPlayerError = (event) => {
    console.error("YouTube Player Error:", event);
  };

  // Toggle between video and audio modes
  const handleToggleVideoAudio = () => {
    setIsVideo((prev) => !prev);
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  };

  // Play or pause the player
  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying((prev) => !prev);
  };

  // Play the next song
  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % musicUrls.length);
    setIsPlaying(true);
  };

  // Play the previous song
  const handlePrevious = () => {
    setCurrentSongIndex((prev) => (prev - 1 + musicUrls.length) % musicUrls.length);
    setIsPlaying(true);
  };

  return (
    <Slide
      direction="up"
      style={{ transitionDelay: disabled ? "200ms" : "0ms" }}
      in={!disabled}
      mountOnEnter
      unmountOnExit
    >
      <div>
        {isVideo ? (
          <iframe
            width="100%"
            height={height}
            src={`https://www.youtube.com/embed/${musicUrls[currentSongIndex].url}?autoplay=${isPlaying ? 1 : 0}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="subtitle1" style={{ padding: "5px" }}>
              {musicUrls[currentSongIndex].title}
            </Typography>
            <div id="youtube-player" style={{ display: "none" }} />
            <Box display="flex" alignItems="center">
              <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }} onClick={handlePrevious} aria-label="previous">
                <SkipPreviousIcon />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }} onClick={handlePlayPause} aria-label="play/pause">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.8)' } }} onClick={handleNext} aria-label="next">
                <SkipNextIcon />
              </IconButton>
            </Box>
          </Box>
        )}
        <Box display="flex" justifyContent="center" marginTop="10px">
          <Button
            variant="outlined"
            onClick={handleToggleVideoAudio}
            startIcon={isVideo ? <MusicNoteIcon /> : <VideoLibraryIcon />}
          >
            {isVideo ? "Music" : "Video"}
          </Button>
        </Box>
      </div>
    </Slide>
  );
};

export default MusicPlayer;