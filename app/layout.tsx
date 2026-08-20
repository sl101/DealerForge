import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import GlobalAuthModal from '@/components/GlobalAuthModal';
import AdBanner from '@/components/AdBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DealerForge',
  description: 'Train Like a Pro Dealer',
  applicationName: 'DealerForge',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DealerForge',
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.webmanifest',
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
            <div style={{ flex: 1, minHeight: 0, width: '100%', overflowX: 'hidden' }}>
              {children}
            </div>
          </div>
          <GlobalAuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}