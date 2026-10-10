# DealerForge — security, auth, ads, Play, growth

## Env (Vercel Production + Preview)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://dealer-forge-omega.vercel.app` (prod)

Never put `service_role` in frontend env.

## Supabase Auth dashboard

1. Authentication → URL configuration  
   - Site URL = prod URL  
   - Redirect URLs: `https://dealer-forge-omega.vercel.app/**` and preview URLs  
2. Email → Confirm email: ON for new users  
3. Email templates: app name DealerForge, links use Site URL  
4. Run `sql/security_and_account.sql`

## Files to copy into repo

| Path | Action |
|------|--------|
| `contexts/AuthContext.tsx` | replace |
| `components/AdBanner.tsx` | replace |
| `components/AuthModal.tsx` | replace |
| `app/layout.tsx` | replace |
| `app/auth/page.tsx` | replace |
| `app/auth/forgot/page.tsx` | new |
| `app/auth/reset/page.tsx` | new |
| `app/profile/page.tsx` | replace |
| `app/privacy/page.tsx` | new |
| `app/terms/page.tsx` | new |
| `app/sitemap.ts` | new |
| `public/robots.txt` | new |
| `lib/pro.ts` | new |

Keep existing `app-main` / leaderboard-scroll CSS from previous fix.

## Ads model

- Free + guest: show `AdBanner`
- `profiles.is_pro = true`: no banner
- Later: RevenueCat / Play Billing / Stripe sets `is_pro`
- No interstitial on every answer

## Google Play (TWA)

1. Stable prod + Privacy URL `https://…/privacy`
2. [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or PWA Builder → AAB
3. Play Console: Data safety, content rating, screenshots
4. Internal testing → Production

## Organic growth

- OG metadata (in layout)
- Short vertical demos (payout in 10s)
- Dealer communities, not spam
- Respond to reviews after Play launch
