import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import GlobalAuthModal from '@/components/GlobalAuthModal';
import AdBanner from '@/components/AdBanner';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://dealer-forge-omega.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'DealerForge — Roulette Dealer Training',
    template: '%s · DealerForge',
  },
  description:
    'Train roulette payouts, neighbors, and casino math. Free dealer practice with leaderboard. Not real-money gambling.',
  applicationName: 'DealerForge',
  keywords: [
    'roulette dealer training',
    'payout trainer',
    'croupier practice',
    'casino math',
    'neighbors roulette',
  ],
  authors: [{ name: 'DealerForge' }],
  openGraph: {
    type: 'website',
    url: SITE,
    title: 'DealerForge — Roulette Dealer Training',
    description:
      'Practice roulette payouts and neighbors. Mobile-first trainer for dealers.',
    siteName: 'DealerForge',
    images: [{ url: '/icon-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'DealerForge — Roulette Dealer Training',
    description: 'Practice roulette payouts and neighbors.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DealerForge',
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} app-shell`}>
        <AuthProvider>
          <div className="app-root">
            <AdBanner />
            <div className="app-main">{children}</div>
          </div>
          <BottomNav />
          <GlobalAuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
