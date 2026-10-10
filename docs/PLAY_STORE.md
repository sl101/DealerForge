# Google Play — practical path for DealerForge

## What you need

- Google Play developer account (you have)
- Production URL (HTTPS)
- Privacy Policy URL (`/privacy`)
- Screenshots (phone)
- Feature graphic 1024×500
- App icon 512×512
- AAB signed package

## Recommended packaging: TWA (Trusted Web Activity)

Your app is already a PWA. TWA wraps the live site — updates ship via Vercel, not a new AAB every time (except native config changes).

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://dealer-forge-omega.vercel.app/manifest.webmanifest
bubblewrap build
```

Output: `app-release-bundle.aab` → upload to Play Console.

## Store listing draft

**Title:** DealerForge: Roulette Dealer Train  
**Short:** Practice roulette payouts & neighbors.  
**Full:** Educational trainer for dealers. Not a casino. No real-money betting.

## Data safety form

- Account: email
- Photos: user avatar (optional)
- App activity: training scores
- Collected to provide app functionality; not sold

## After launch

- Internal → closed test → production
- Monitor crashes (Play Vitals)
- App Store later when justified
