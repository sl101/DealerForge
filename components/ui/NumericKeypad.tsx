'use client';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['␣', '0', '⌫'],
];

export default function NumericKeypad({
  onDigit,
  onBackspace,
  onSpace,
  onEnter,
  disabled = false,
}: NumericKeypadProps) {
  const handle = (key: string) => {
    if (disabled) return;
    if (key === '⌫') onBackspace();
    else if (key === '␣') onSpace();
    else onDigit(key);
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '8px 12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        marginBottom: 8,
        background: 'rgba(22, 33, 62, 0.98)',
        borderTop: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.35)',
        boxSizing: 'border-box',
      }}
    >
      {KEYS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {row.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handle(key)}
              style={{
                flex: 1,
                maxWidth: 90,
                height: 42,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background:
                  key === '⌫' || key === '␣'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.1)',
                color: 'var(--text)',
                fontSize: 18,
                fontWeight: 600,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onEnter()}
        style={{
          height: 42,
          borderRadius: 12,
          border: 'none',
          background: disabled ? 'rgba(255,255,255,0.08)' : 'var(--primary)',
          color: disabled ? 'var(--text-muted)' : '#000',
          fontWeight: 700,
          fontSize: 16,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        Enter
      </button>
    </div>
  );
}