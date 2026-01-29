// Sample songs structure - users can add their own lyrics
export const sampleSongs = [
  {
    id: 1,
    title: "Custom Song",
    artist: "Your Artist",
    lyrics: "Type your favorite lyrics here and practice typing along with the music",
    isCustom: true,
  },
];

// Demo lyrics for practice (not copyrighted)
export const demoLyrics = `The quick brown fox jumps over the lazy dog
Practice makes perfect every single day
Type along with the rhythm of the music
Feel the beat and let your fingers dance

The more you practice the better you become
Speed and accuracy will come with time
Keep your eyes on the screen and type away
Let the music guide your typing flow`;

// Get demo lyrics
export const getDemoLyrics = () => demoLyrics;
