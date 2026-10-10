import type { MetadataRoute } from 'next';

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://dealer-forge-omega.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/privacy', '/terms', '/auth', '/leaderboard'];
  return paths.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }));
}
