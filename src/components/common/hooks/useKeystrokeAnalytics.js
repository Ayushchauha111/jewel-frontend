import { useCallback, useRef, useState } from "react";

const isAlphaNum = (key) => key && key.length === 1 && /[a-z0-9]/.test(key);

export function useKeystrokeAnalytics({ enabled }) {
  const [keystrokeData, setKeystrokeData] = useState({
    keyTimings: [],
    keyErrors: {},
  });

  const keystrokeDataRef = useRef({
    keyTimings: [],
    keyErrors: {},
  });

  const activeKeysRef = useRef({});

  const onAlphaNumKeyDown = useCallback(
    (rawKey) => {
      if (!enabled) return;
      const key = String(rawKey || "").toLowerCase();
      if (!isAlphaNum(key)) return;

      const pressTime = Date.now();
      activeKeysRef.current[key] = pressTime;

      setKeystrokeData((prev) => {
        const newData = {
          ...prev,
          keyTimings: [
            ...prev.keyTimings,
            { key, pressTime, releaseTime: null, nextKeyTime: null },
          ],
        };
        keystrokeDataRef.current = newData;
        return newData;
      });
    },
    [enabled]
  );

  const onAlphaNumKeyUp = useCallback(
    (rawKey) => {
      if (!enabled) return;
      const key = String(rawKey || "").toLowerCase();
      if (!isAlphaNum(key)) return;

      const pressTime = activeKeysRef.current[key];
      if (!pressTime) return;

      const releaseTime = Date.now();
      setKeystrokeData((prev) => {
        const newTimings = [...prev.keyTimings];
        for (let i = newTimings.length - 1; i >= 0; i--) {
          if (newTimings[i].key === key && !newTimings[i].releaseTime) {
            newTimings[i].releaseTime = releaseTime;
            break;
          }
        }
        const newData = { ...prev, keyTimings: newTimings };
        keystrokeDataRef.current = newData;
        return newData;
      });

      delete activeKeysRef.current[key];
    },
    [enabled]
  );

  const trackKeyError = useCallback(
    (rawKey) => {
      if (!enabled) return;
      const key = String(rawKey || "").toLowerCase();
      if (!isAlphaNum(key)) return;

      setKeystrokeData((prev) => {
        const newData = {
          ...prev,
          keyErrors: {
            ...prev.keyErrors,
            [key]: (prev.keyErrors[key] || 0) + 1,
          },
        };
        keystrokeDataRef.current = newData;
        return newData;
      });
    },
    [enabled]
  );

  const resetKeystrokeData = useCallback(() => {
    const empty = { keyTimings: [], keyErrors: {} };
    setKeystrokeData(empty);
    keystrokeDataRef.current = empty;
    activeKeysRef.current = {};
  }, []);

  return {
    keystrokeData,
    keystrokeDataRef,
    onAlphaNumKeyDown,
    onAlphaNumKeyUp,
    trackKeyError,
    resetKeystrokeData,
  };
}

