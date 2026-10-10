import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use · DealerForge',
  description: 'Terms of use for DealerForge training app.',
};

export default function TermsPage() {
  return (
    <div className="page-shell allow-page-scroll">
      <header className="page-header">
        <div className="page-inner" style={{ paddingTop: 16, paddingBottom: 12 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
            }}
          >
            Terms of Use
          </h1>
        </div>
      </header>
      <main
        className="page-inner"
        style={{
          paddingTop: 16,
          paddingBottom: 48,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text-muted)',
        }}
      >
        <p style={{ color: 'var(--text)' }}>
          <strong>Last updated:</strong> October 9, 2026
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          1. Service
        </h2>
        <p>
          DealerForge provides practice tools for roulette payouts and related
          skills. It is not a casino and does not offer real-money gambling.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          2. Accounts
        </h2>
        <p>
          You are responsible for your login credentials. Do not share accounts
          or abuse the leaderboard (bots, multi-accounts for ranking).
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          3. Acceptable use
        </h2>
        <p>
          Do not attempt to break security, scrape the service excessively, or
          upload illegal content (including profile photos).
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          4. Ads & subscription
        </h2>
        <p>
          Free users may see advertisements. A paid option may remove ads.
          Subscriptions are billed by the store or payment provider you use;
          refunds follow their rules.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          5. Disclaimer
        </h2>
        <p>
          Training content is for education. We do not guarantee employment or
          exam results. The app is provided “as is”.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          6. Contact
        </h2>
        <p>
          <a href="mailto:support@dealerforge.app" style={{ color: 'var(--primary)' }}>
            support@dealerforge.app
          </a>
        </p>

        <p style={{ marginTop: 32 }}>
          <Link href="/privacy" style={{ color: 'var(--primary)' }}>
            Privacy Policy
          </Link>
          {' · '}
          <Link href="/" style={{ color: 'var(--primary)' }}>
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
