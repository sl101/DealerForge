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
    <div className="numeric-keypad">
      {KEYS.map((row, ri) => (
        <div key={ri} className="numeric-keypad-row">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handle(key)}
              className={
                key === '⌫' || key === '␣'
                  ? 'numeric-key numeric-key-muted'
                  : 'numeric-key'
              }
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
        className="numeric-key-enter"
      >
        Enter
      </button>
    </div>
  );
}

