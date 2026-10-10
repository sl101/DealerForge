'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Top ad strip for free / guest users.
 * Pro users (profiles.is_pro) see no banner.
 * Swap placeholder for AdMob / AdSense when ready.
 */
export default function AdBanner() {
  const { loading, isPro } = useAuth();

  if (loading) {
    return (
      <div className="ad-banner" style={{ visibility: 'hidden' }} aria-hidden />
    );
  }

  if (isPro) return null;

  return (
    <div className="ad-banner" role="complementary" aria-label="Advertisement">
      Ad space · Upgrade to remove
    </div>
  );
}
