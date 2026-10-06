export default function CommunityPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            Community
          </h1>
        </div>
      </header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 24, paddingBottom: 40 }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 24,
            padding: 32,
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--text)',
            }}
          >
            Coming soon
          </p>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Discussions, hand reviews, and dealer tips will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}