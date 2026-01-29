import { useEffect, useState } from "react";
import ConfigService from "../../../service/config.service";

export function useAiEnabled() {
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    ConfigService.isAiEnabled()
      .then((res) => {
        const enabled = Boolean(res?.data?.success && res?.data?.data);
        if (!cancelled) setAiEnabled(enabled);
      })
      .catch(() => {
        // Fail closed: if config fetch fails, don't enable AI features.
        if (!cancelled) setAiEnabled(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return aiEnabled;
}

