import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useId } from 'react';

/**
 * Keeps the screen on while a game is open. Like expo-keep-awake's hook, but
 * never throws (in browsers the wake lock can be refused or still pending).
 */
export function useKeepAwake() {
  const tag = `gpp-${useId()}`;
  useEffect(() => {
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      try {
        deactivateKeepAwake(tag).catch(() => {});
      } catch {}
    };
  }, [tag]);
}
