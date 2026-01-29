// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const { word, currChar, currCharIndex } = e.data;

  if (!word) {
    console.error("Word is undefined or null");
    return;
  }

  const chars = word.split("");
  const char = chars[currCharIndex];

  if (char !== currChar && char !== undefined) {
    postMessage({ type: "increment" });
  }
};