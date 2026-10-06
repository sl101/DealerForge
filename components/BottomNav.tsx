'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Trophy, User } from 'lucide-react';

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/leaderboard', label: 'Leaders', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname?.startsWith('/auth')) return null;

  const nav = (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99990,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        style={{
          display: 'flex',
          maxWidth: 512,
          margin: '0 auto',
          alignItems: 'stretch',
          justifyContent: 'space-around',
        }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : Boolean(pathname?.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 0',
                fontSize: 11,
                fontWeight: 500,
                textDecoration: 'none',
                color: active ? '#67e8f9' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return createPortal(nav, document.body);
}