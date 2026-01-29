import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(230, 126, 34, 0.6); }
  50% { text-shadow: 0 0 40px rgba(230, 126, 34, 1), 0 0 60px rgba(230, 126, 34, 0.5); }
`;

const wave = keyframes`
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const SetupCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(100, 100, 100, 0.2);
  animation: ${slideIn} 0.5s ease-out;
`;

const Title = styled.h2`
  color: ${props => props.theme?.stats || '#e2b714'};
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme?.textTypeBox || '#646669'};
  font-size: 14px;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme?.text || '#d1d0c5'};
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 180px;
  padding: 16px;
  background: rgba(20, 20, 20, 0.8);
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 12px;
  color: ${props => props.theme?.text || '#d1d0c5'};
  font-family: 'Roboto Mono', monospace;
  font-size: 15px;
  line-height: 1.8;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.stats || '#e2b714'};
  }
  
  &::placeholder {
    color: ${props => props.theme?.textTypeBox || '#646669'};
  }
`;

const FileButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: rgba(40, 40, 40, 0.8);
  border: 2px dashed rgba(100, 100, 100, 0.5);
  border-radius: 12px;
  color: ${props => props.theme?.textTypeBox || '#646669'};
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme?.stats || '#e2b714'};
    color: ${props => props.theme?.stats || '#e2b714'};
    background: rgba(230, 126, 34, 0.1);
  }
  
  input { display: none; }
`;

const FileName = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
  padding: 10px 16px;
  background: rgba(46, 204, 113, 0.2);
  border-radius: 8px;
  color: #2ecc71;
  font-size: 14px;
`;

const AudioSourceTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const SourceTab = styled.button`
  flex: 1;
  padding: 14px;
  background: ${props => props.$active ? 'rgba(230, 126, 34, 0.2)' : 'rgba(40, 40, 40, 0.6)'};
  border: 2px solid ${props => props.$active ? (props.theme?.stats || '#e2b714') : 'rgba(100, 100, 100, 0.3)'};
  border-radius: 10px;
  color: ${props => props.$active ? (props.theme?.stats || '#e2b714') : (props.theme?.textTypeBox || '#646669')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: ${props => props.theme?.stats || '#e2b714'};
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: rgba(20, 20, 20, 0.8);
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 10px;
  color: ${props => props.theme?.text || '#d1d0c5'};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.stats || '#e2b714'};
  }
  
  &::placeholder {
    color: ${props => props.theme?.textTypeBox || '#646669'};
  }
`;

const YouTubePreview = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  
  iframe {
    width: 100%;
    height: 200px;
    border: none;
  }
`;

const YouTubeNote = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(241, 196, 15, 0.15);
  border-radius: 8px;
  border-left: 4px solid #f1c40f;
  color: #f1c40f;
  font-size: 13px;
  line-height: 1.5;
`;

const StartButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, ${props => props.theme?.stats || '#e2b714'}, #f39c12);
  border: none;
  border-radius: 12px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(230, 126, 34, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlayerContainer = styled.div`
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(15, 15, 15, 1) 100%);
  border-radius: 24px;
  padding: 40px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.5s ease-out;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const SpeedIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(40, 40, 40, 0.8);
  border-radius: 30px;
  color: ${props => props.$speed > 1 ? '#2ecc71' : props.$speed < 0.5 ? '#e74c3c' : (props.theme?.stats || '#e2b714')};
  font-weight: 600;
  font-size: 16px;
  
  svg { font-size: 24px; }
`;

const MusicVisualizer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 60px;
`;

const VisualizerBar = styled.div`
  width: 6px;
  background: linear-gradient(to top, ${props => props.theme?.stats || '#e2b714'}, #f39c12);
  border-radius: 3px;
  height: ${props => props.$height}px;
  opacity: ${props => props.$isPlaying ? 1 : 0.2};
  animation: ${props => props.$isPlaying ? css`${wave} ${props.$delay}s ease-in-out infinite` : 'none'};
  transition: opacity 0.3s ease;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 30px 0;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.$color || (props.theme?.stats || '#e2b714')};
  font-family: 'Roboto Mono', monospace;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme?.textTypeBox || '#646669'};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 6px;
`;

const LyricsArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const LyricLine = styled.div`
  font-family: 'Roboto Mono', monospace;
  text-align: center;
  transition: all 0.4s ease;
  margin: 6px 0;
  
  ${props => props.$type === 'past' && css`
    font-size: 18px;
    color: ${props.theme?.text || '#d1d0c5'};
    opacity: 0.3;
  `}
  
  ${props => props.$type === 'current' && css`
    font-size: 32px;
    color: ${props.theme?.stats || '#e2b714'};
    animation: ${glow} 1.5s ease-in-out infinite;
    margin: 20px 0;
  `}
  
  ${props => props.$type === 'next' && css`
    font-size: 20px;
    color: ${props.theme?.textTypeBox || '#646669'};
    opacity: 0.5;
  `}
`;

const CurrentLineDisplay = styled.div`
  font-size: 36px;
  font-family: 'Roboto Mono', monospace;
  text-align: center;
  margin: 30px 0;
  min-height: 50px;
`;

const Char = styled.span`
  transition: color 0.1s ease;
  color: ${props => 
    props.$status === 'correct' ? '#2ecc71' :
    props.$status === 'wrong' ? '#e74c3c' :
    props.$status === 'current' ? (props.theme?.stats || '#e2b714') :
    (props.theme?.textTypeBox || '#646669')
  };
  ${props => props.$status === 'current' && css`
    border-bottom: 3px solid ${props.theme?.stats || '#e2b714'};
    animation: ${pulse} 0.5s ease-in-out infinite;
  `}
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

const StatusBar = styled.div`
  text-align: center;
  padding: 16px;
  background: ${props => props.$isTyping ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  border-radius: 12px;
  margin-top: 20px;
  color: ${props => props.$isTyping ? '#2ecc71' : '#e74c3c'};
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? css`
    background: linear-gradient(135deg, ${props.theme?.stats || '#e2b714'}, #f39c12);
    border: none;
    color: #1a1a1a;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(230, 126, 34, 0.4);
    }
  ` : css`
    background: rgba(50, 50, 50, 0.8);
    border: 2px solid rgba(100, 100, 100, 0.3);
    color: ${props.theme?.textTypeBox || '#646669'};
    
    &:hover {
      border-color: ${props.theme?.stats || '#e2b714'};
      color: ${props.theme?.stats || '#e2b714'};
    }
  `}
`;

const CompletionScreen = styled.div`
  text-align: center;
  animation: ${slideIn} 0.5s ease-out;
`;

const CompletionTitle = styled.h1`
  color: ${props => props.theme?.stats || '#e2b714'};
  font-size: 42px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Instruction = styled.p`
  color: ${props => props.theme?.textTypeBox || '#646669'};
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  
  span { 
    color: ${props => props.theme?.stats || '#e2b714'}; 
    font-weight: 600;
  }
`;

const LyricsBox = () => {
  // Setup
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioSource, setAudioSource] = useState("file"); // "file" or "youtube"
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [isSetup, setIsSetup] = useState(true);
  
  // Extract YouTube ID from URL
  const extractYoutubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };
  
  const handleYoutubeUrlChange = (url) => {
    setYoutubeUrl(url);
    const id = extractYoutubeId(url);
    setYoutubeId(id || "");
  };
  
  // Parsed data
  const [lines, setLines] = useState([]);
  const [allChars, setAllChars] = useState([]);
  
  // Game state
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [charStatuses, setCharStatuses] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Stats
  const [correctChars, setCorrectChars] = useState(0);
  const [wrongChars, setWrongChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  
  // Refs
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const lastTypeTimeRef = useRef(null);
  const typeSpeedRef = useRef([]);
  const pauseTimeoutRef = useRef(null);
  
  // Parse lyrics into chars
  const parseLyrics = (text) => {
    const cleanedLines = text.trim().split('\n').filter(l => l.trim());
    setLines(cleanedLines);
    
    const chars = [];
    cleanedLines.forEach((line, lineIdx) => {
      line.split('').forEach((char, charIdx) => {
        chars.push({ char, lineIdx, charIdx });
      });
      // Add newline marker (space for typing)
      if (lineIdx < cleanedLines.length - 1) {
        chars.push({ char: ' ', lineIdx, charIdx: line.length, isLineEnd: true });
      }
    });
    setAllChars(chars);
    setCharStatuses(new Array(chars.length).fill('pending'));
  };
  
  // Handle audio file
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
      setAudioFileName(file.name);
    }
  };
  
  // Start
  const handleStart = () => {
    if (!lyrics.trim() || !audioFile) return;
    parseLyrics(lyrics);
    setIsSetup(false);
    setCurrentCharIndex(0);
    setCorrectChars(0);
    setWrongChars(0);
    setWpm(0);
    setStartTime(null);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsTyping(false);
    setPlaybackSpeed(1);
    typeSpeedRef.current = [];
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  // Reset
  const handleReset = () => {
    setIsSetup(true);
    setIsPlaying(false);
    setIsCompleted(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Restart same song
  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentCharIndex(0);
    setCharStatuses(new Array(allChars.length).fill('pending'));
    setCorrectChars(0);
    setWrongChars(0);
    setWpm(0);
    setStartTime(null);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsTyping(false);
    typeSpeedRef.current = [];
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  // Calculate typing speed and adjust playback
  const updatePlaybackSpeed = useCallback(() => {
    const now = Date.now();
    const speeds = typeSpeedRef.current;
    
    // Keep only last 10 keystrokes for speed calculation
    if (speeds.length > 10) {
      typeSpeedRef.current = speeds.slice(-10);
    }
    
    if (speeds.length >= 2) {
      // Calculate average time between keystrokes
      const avgInterval = speeds.reduce((sum, s, i) => {
        if (i === 0) return 0;
        return sum + (s - speeds[i - 1]);
      }, 0) / (speeds.length - 1);
      
      // Target: ~150ms per char = normal speed (about 80 WPM)
      // Faster typing = higher speed, slower = lower speed
      const targetInterval = 150;
      let speed = targetInterval / avgInterval;
      
      // Clamp speed between 0.5x and 2x
      speed = Math.max(0.3, Math.min(2, speed));
      setPlaybackSpeed(speed);
      
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
      }
    }
  }, []);
  
  // Handle keypress
  const handleKeyDown = useCallback((e) => {
    if (isCompleted || currentCharIndex >= allChars.length) return;
    
    // Start timer on first key
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    const expectedChar = allChars[currentCharIndex]?.char;
    const now = Date.now();
    
    // Track typing timing
    typeSpeedRef.current.push(now);
    lastTypeTimeRef.current = now;
    
    // Clear pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Set typing state
    setIsTyping(true);
    
    // Start/resume audio
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    
    // Update playback speed based on typing speed
    updatePlaybackSpeed();
    
    // Handle character
    if (e.key.length === 1 || e.key === 'Enter') {
      e.preventDefault();
      
      let typedChar = e.key;
      if (e.key === 'Enter') typedChar = ' '; // Enter acts as space/newline
      
      const isCorrect = typedChar === expectedChar || 
        (expectedChar === ' ' && (e.key === ' ' || e.key === 'Enter'));
      
      setCharStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[currentCharIndex] = isCorrect ? 'correct' : 'wrong';
        return newStatuses;
      });
      
      if (isCorrect) {
        setCorrectChars(prev => prev + 1);
      } else {
        setWrongChars(prev => prev + 1);
      }
      
      setCurrentCharIndex(prev => prev + 1);
      
      // Check completion
      if (currentCharIndex + 1 >= allChars.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
      }
    }
    
    // Set pause timeout - pause music if no typing for 800ms
    pauseTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }, 800);
    
  }, [currentCharIndex, allChars, startTime, isCompleted, updatePlaybackSpeed]);
  
  // Calculate WPM
  useEffect(() => {
    if (startTime && correctChars > 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = correctChars / 5;
      setWpm(Math.round(words / elapsed));
    }
  }, [correctChars, startTime]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);
  
  // Focus input on click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  
  // Get current line index
  const currentLineIdx = allChars[currentCharIndex]?.lineIdx ?? 0;
  
  // Visualizer
  const visualizerBars = Array.from({ length: 30 }, (_, i) => ({
    height: Math.random() * 40 + 20,
    delay: 0.08 + (i * 0.03),
  }));
  
  // Accuracy
  const total = correctChars + wrongChars;
  const accuracy = total > 0 ? Math.round((correctChars / total) * 100) : 100;
  
  // Render current line with character highlighting
  const renderCurrentLine = () => {
    if (lines.length === 0) return null;
    
    const line = lines[currentLineIdx] || "";
    let charOffset = 0;
    
    // Calculate offset for current line
    for (let i = 0; i < currentLineIdx; i++) {
      charOffset += lines[i].length + 1; // +1 for line separator
    }
    
    return line.split('').map((char, idx) => {
      const globalIdx = charOffset + idx;
      const status = globalIdx < currentCharIndex ? charStatuses[globalIdx] :
                     globalIdx === currentCharIndex ? 'current' : 'pending';
      
      return (
        <Char key={idx} $status={status}>
          {char}
        </Char>
      );
    });
  };
  
  // Setup screen
  if (isSetup) {
  return (
      <Container>
        <SetupCard>
          <Title>
            <MusicNoteIcon style={{ fontSize: 32 }} />
            Karaoke Typing
          </Title>
          <Subtitle>
            Type to control the music! Type fast = music plays fast. Stop typing = music pauses.
          </Subtitle>
          
          <InputGroup>
            <Label>🎵 Paste Song Lyrics</Label>
            <TextArea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste your favorite song lyrics here...&#10;&#10;Each line will highlight as you type.&#10;The music speed follows your typing speed!&#10;&#10;Example:&#10;Main agar kahoon&#10;Tumsa haseen&#10;Koi nahi hai..."
            />
          </InputGroup>
          
          <InputGroup>
            <Label>🎧 Audio Source</Label>
            <AudioSourceTabs>
              <SourceTab 
                $active={audioSource === "file"}
                onClick={() => setAudioSource("file")}
              >
                📁 Upload File
              </SourceTab>
              <SourceTab 
                $active={audioSource === "youtube"}
                onClick={() => setAudioSource("youtube")}
              >
                ▶️ YouTube Link
              </SourceTab>
            </AudioSourceTabs>
            
            {audioSource === "file" ? (
    <div>
                <FileButton>
                  <CloudUploadIcon />
                  Choose Audio File (MP3, WAV)
                  <input type="file" accept="audio/*" onChange={handleAudioChange} />
                </FileButton>
                {audioFileName && <FileName>✓ {audioFileName}</FileName>}
      </div>
            ) : (
              <div>
                <TextInput
        type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                />
                {youtubeId && (
                  <YouTubePreview>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="YouTube Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      allowFullScreen
                    />
                  </YouTubePreview>
                )}
                <YouTubeNote>
                  💡 <strong>How it works with YouTube:</strong> Start the video manually, then type along. 
                  For full auto play/pause control, upload an MP3 file instead.
                </YouTubeNote>
              </div>
            )}
          </InputGroup>
          
          <StartButton 
            onClick={handleStart} 
            disabled={!lyrics.trim() || (audioSource === "file" && !audioFile) || (audioSource === "youtube" && !youtubeId)}
          >
            <PlayArrowIcon /> Start Karaoke
          </StartButton>
          
          <Instruction>
            <span>How it works:</span> Upload a song, paste its lyrics, and start typing. 
            Your typing speed controls the music playback!
          </Instruction>
        </SetupCard>
      </Container>
    );
  }
  
  // Completion screen
  if (isCompleted) {
    return (
      <Container>
        <PlayerContainer>
          <CompletionScreen>
            <CompletionTitle>
              <CheckCircleIcon style={{ fontSize: 56 }} />
              Song Completed!
            </CompletionTitle>
            
            <StatsRow>
              <Stat>
                <StatValue $color="#2ecc71">{wpm}</StatValue>
                <StatLabel>WPM</StatLabel>
              </Stat>
              <Stat>
                <StatValue $color="#3498db">{accuracy}%</StatValue>
                <StatLabel>Accuracy</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{correctChars}</StatValue>
                <StatLabel>Characters</StatLabel>
              </Stat>
            </StatsRow>
            
            <Controls>
              <Button onClick={handleReset}>New Song</Button>
              <Button $primary onClick={handleRestart}>
                <RestartAltIcon /> Play Again
              </Button>
            </Controls>
          </CompletionScreen>
        </PlayerContainer>
      </Container>
    );
  }
  
  // Main player
  return (
    <Container onClick={handleContainerClick}>
      {audioSource === "file" && audioFile && (
        <audio ref={audioRef} src={audioFile} />
      )}
      <HiddenInput
        ref={inputRef}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      
      {audioSource === "youtube" && youtubeId && (
        <div style={{ 
          marginBottom: '20px', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <iframe
            width="100%"
            height="120"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
            title="YouTube Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
            style={{ display: 'block' }}
      />
    </div>
      )}
      
      <PlayerContainer>
        <TopBar>
          <MusicVisualizer>
            {visualizerBars.map((bar, i) => (
              <VisualizerBar
                key={i}
                $height={bar.height}
                $delay={bar.delay}
                $isPlaying={isPlaying}
              />
            ))}
          </MusicVisualizer>
          
          <SpeedIndicator $speed={playbackSpeed}>
            <SpeedIcon />
            {playbackSpeed.toFixed(1)}x
          </SpeedIndicator>
        </TopBar>
        
        <StatsRow>
          <Stat>
            <StatValue>{wpm}</StatValue>
            <StatLabel>WPM</StatLabel>
          </Stat>
          <Stat>
            <StatValue $color={accuracy >= 90 ? '#2ecc71' : accuracy >= 70 ? '#f1c40f' : '#e74c3c'}>
              {accuracy}%
            </StatValue>
            <StatLabel>Accuracy</StatLabel>
          </Stat>
          <Stat>
            <StatValue $color="#3498db">
              {Math.round((currentCharIndex / allChars.length) * 100)}%
            </StatValue>
            <StatLabel>Progress</StatLabel>
          </Stat>
        </StatsRow>
        
        <LyricsArea>
          {/* Previous line */}
          {currentLineIdx > 0 && (
            <LyricLine $type="past">
              {lines[currentLineIdx - 1]}
            </LyricLine>
          )}
          
          {/* Current line with character highlighting */}
          <CurrentLineDisplay>
            {renderCurrentLine()}
          </CurrentLineDisplay>
          
          {/* Next lines */}
          {lines.slice(currentLineIdx + 1, currentLineIdx + 3).map((line, idx) => (
            <LyricLine key={idx} $type="next">
              {line}
            </LyricLine>
          ))}
        </LyricsArea>
        
        <StatusBar $isTyping={isTyping}>
          {audioSource === "youtube" ? (
            isTyping ? (
              <>🎵 Keep typing along with the music!</>
            ) : (
              <>▶️ Play the YouTube video above, then type along!</>
            )
          ) : (
            isTyping ? (
              <>🎵 Music playing at {playbackSpeed.toFixed(1)}x speed - Keep typing!</>
            ) : (
              <>⏸️ Music paused - Start typing to play!</>
            )
          )}
        </StatusBar>
        
        <Instruction>
          {audioSource === "youtube" ? (
            <>Press <span>play on YouTube</span> above, then type the lyrics as they appear!</>
          ) : (
            <>Click anywhere and <span>start typing</span> to play the music. Type faster = music plays faster!</>
          )}
        </Instruction>
        
        <Controls>
          <Button onClick={handleReset}>Change Song</Button>
          <Button onClick={handleRestart}>
            <RestartAltIcon /> Restart
          </Button>
        </Controls>
      </PlayerContainer>
    </Container>
  );
};

export default LyricsBox;
