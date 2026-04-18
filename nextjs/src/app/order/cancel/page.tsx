export const metadata = {
  title: 'Checkout Cancelled | DreamersJoy Floral Studio',
  description: 'Your checkout was cancelled. Your cart is still intact — return to the shop to continue.',
};

export default function OrderCancelPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/cinematic/assets/images/dj-logo.png" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Jost', sans-serif",
          fontWeight: 300,
          color: '#2C3E50',
          background: '#F2F2EB',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main style={{ maxWidth: 560, padding: '64px 24px', textAlign: 'center' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#87734C',
              marginBottom: 24,
            }}
          >
            Checkout Cancelled
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 300,
              lineHeight: 1.15,
              color: '#2C3E50',
              marginBottom: 24,
            }}
          >
            No charge made.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: 'rgba(44,62,80,0.7)',
              lineHeight: 1.7,
              maxWidth: '50ch',
              margin: '0 auto 40px',
            }}
          >
            Your order wasn't completed and no payment was taken. If you
            need help choosing an arrangement, feel free to reach out.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/shop"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: '#2C3E50',
                color: '#F2F2EB',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #2C3E50',
              }}
            >
              Return to Shop
            </a>
            <a
              href="/inquire"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'transparent',
                color: '#2C3E50',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #2C3E50',
              }}
            >
              Start an Inquiry
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
