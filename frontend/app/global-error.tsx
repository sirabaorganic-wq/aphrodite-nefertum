'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0a0805',
          color: '#F5F0E8',
          fontFamily: 'serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            width: '90%',
            padding: '40px 24px',
            backgroundColor: '#1a1815',
            border: '1px solid #2a2520',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: '#C6A972', fontSize: '24px', marginBottom: '12px' }}>
            APHRODITE NEFERTUM
          </h1>
          <p style={{ color: '#a09888', fontSize: '14px', marginBottom: '24px' }}>
            A critical error occurred. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => reset()}
              style={{
                flex: 1,
                backgroundColor: '#C6A972',
                color: '#0a0805',
                border: 'none',
                padding: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                color: '#C6A972',
                border: '1px solid #C6A972',
                padding: '12px',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '12px',
                display: 'inline-block',
                boxSizing: 'border-box',
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
