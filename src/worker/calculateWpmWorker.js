// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const { wpmKeyStrokes, countDownConstant, countDown } = e.data;

  // Ensure we don't divide by zero and handle edge cases
  const elapsedTime = countDownConstant - countDown + 1;
  const currWpm = (wpmKeyStrokes > 0 && elapsedTime > 0) 
    ? (wpmKeyStrokes / 5 / elapsedTime * 60.0)
    : 0;

  postMessage(Math.max(0, currWpm));
};
