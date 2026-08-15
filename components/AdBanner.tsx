'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Top-of-app ad strip for free / guest users.
 * Sits ABOVE page headers. Replace placeholder with real ad SDK later.
 */
export default function AdBanner() {
  const { user } = useAuth();

  // Hide for subscribed users when you add isPro later
  const isPro = Boolean((user as { isPro?: boolean } | null)?.isPro);
  if (isPro) return null;

  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      style={{
        width: '100%',
        background: 'rgba(0,0,0,0.45)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          letterSpacing: 0.5,
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
        }}
      >
        Ad space · Upgrade to remove
      </div>
    </div>
  );
}