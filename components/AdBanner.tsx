'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Top-of-app ad strip for free / guest users.
 * Uses .ad-banner from globals.css (sticky top, stable on rotate).
 * Replace placeholder with real ad SDK later.
 */
export default function AdBanner() {
  const { user, loading } = useAuth();

  const isPro = Boolean(
    (user as { isPro?: boolean } | null)?.isPro ||
      (user?.user_metadata as { isPro?: boolean } | undefined)?.isPro
  );

  if (loading) {
    return <div className="ad-banner" style={{ visibility: 'hidden' }} aria-hidden />;
  }

  if (isPro) return null;

  return (
    <div className="ad-banner" role="complementary" aria-label="Advertisement">
      Ad space · Upgrade to remove
    </div>
  );
}