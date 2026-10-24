'use client';

import { useEffect } from 'react';

/**
 * Best-effort portrait lock.
 * Works in installed PWA / some WebViews; ignored in ordinary mobile Chrome tabs.
 * Android TWA should also set screenOrientation=portrait in the manifest.
 */
export default function PortraitLock() {
  useEffect(() => {
    const orient = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };

    const tryLock = () => {
      if (typeof orient?.lock === 'function') {
        orient.lock('portrait').catch(() => {
          /* not allowed without fullscreen / not supported */
        });
      }
    };

    tryLock();

    const onChange = () => tryLock();
    orient?.addEventListener?.('change', onChange);
    return () => orient?.removeEventListener?.('change', onChange);
  }, []);

  return null;
}
