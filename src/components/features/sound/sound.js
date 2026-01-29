import typeSoft from "../../../assets/sound/typeSoft.wav";
import keyboard from "../../../assets/sound/keyboard.wav";
import cherryBlue from "../../../assets/sound/cherryBlue.wav";

// Sound file mappings
const SOUND_MAP = {
  "keyboard": keyboard,
  "typewriter": typeSoft,
  "cherry": cherryBlue
};

// Options for sound selection dropdown
const soundOptions = [
  { label: "Keyboard", value: "keyboard" },
  { label: "Typewriter", value: "typewriter" },
  { label: "Cherry Blue", value: "cherry" },
];

// Default values and constants
const DEFAULT_SOUND_TYPE = "cherry";
const SOUND_MODE = "sound";
const DEFAULT_SOUND_TYPE_KEY = "sound-type";
const SOUND_MODE_TOOLTIP = "Typing sound effects";

export { 
  SOUND_MAP,
  soundOptions, 
  DEFAULT_SOUND_TYPE, 
  DEFAULT_SOUND_TYPE_KEY, 
  SOUND_MODE, 
  SOUND_MODE_TOOLTIP 
};