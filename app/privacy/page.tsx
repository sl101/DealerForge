import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy · DealerForge',
  description: 'How DealerForge collects and uses data.',
};

export default function PrivacyPage() {
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
            Privacy Policy
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
        <p>
          DealerForge (“we”, “the app”) is a training tool for roulette dealers.
          This policy explains what data we process.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          1. Data we collect
        </h2>
        <ul>
          <li>
            <strong>Account:</strong> email, password (hashed by Supabase Auth),
            optional nickname and profile photo.
          </li>
          <li>
            <strong>Training data:</strong> scores, accuracy, mode, timestamps
            for the leaderboard.
          </li>
          <li>
            <strong>Technical:</strong> basic device/browser data needed to run
            the web app; optional analytics if enabled later.
          </li>
        </ul>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          2. Why we use it
        </h2>
        <ul>
          <li>Sign-in and account security</li>
          <li>Leaderboard and progress</li>
          <li>Showing ads to free users (if enabled)</li>
          <li>Improving the product</li>
        </ul>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          3. Processors
        </h2>
        <p>
          Hosting and auth/database may be provided by Vercel and Supabase.
          They process data under their own terms and only as needed to run the
          service.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          4. Retention & deletion
        </h2>
        <p>
          We keep account and score data while your account exists. You can
          request deletion from Profile → Delete account, or by emailing us. We
          will delete or anonymize personal data within a reasonable time,
          except where law requires retention.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          5. Children
        </h2>
        <p>
          The app is intended for adults training for casino work. It is not
          directed at children under 13 (or the minimum age in your country).
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          6. Not real-money gambling
        </h2>
        <p>
          DealerForge is an educational trainer only. It does not accept bets or
          pay real-money winnings.
        </p>

        <h2 style={{ color: 'var(--text)', fontSize: 16, marginTop: 24 }}>
          7. Contact
        </h2>
        <p>
          Questions or data requests:{' '}
          <a href="mailto:support@dealerforge.app" style={{ color: 'var(--primary)' }}>
            support@dealerforge.app
          </a>{' '}
          (replace with your real contact before Play listing).
        </p>

        <p style={{ marginTop: 32 }}>
          <Link href="/terms" style={{ color: 'var(--primary)' }}>
            Terms of Use
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
