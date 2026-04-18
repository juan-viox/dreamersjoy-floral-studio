import { stripe } from '@/lib/stripe';

export const metadata = {
  title: 'Order Received — Thank You | DreamersJoy Floral Studio',
  description: 'Your order has been received. We will be in touch shortly with delivery details.',
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let customerName = '';
  let arrangementName = '';
  let totalDisplay = '';
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      customerName =
        session.customer_details?.name?.split(' ')[0] || '';
      arrangementName = session.metadata?.arrangement_name || '';
      if (session.amount_total) {
        totalDisplay = `$${(session.amount_total / 100).toFixed(2)}`;
      }
    } catch {
      // Silent fallback — success page still renders generic copy
    }
  }

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
          flexDirection: 'column',
        }}
      >
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
          }}
        >
          <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#87734C',
                marginBottom: 28,
              }}
            >
              Order Received
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: '#2C3E50',
                marginBottom: 28,
              }}
            >
              Thank you{customerName ? `, ${customerName}` : ''}.
            </h1>
            <div
              style={{
                width: 60,
                height: 1,
                background: 'rgba(44,62,80,0.25)',
                margin: '0 auto 32px',
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.55,
                color: 'rgba(44,62,80,0.8)',
                marginBottom: 32,
              }}
            >
              Your arrangement is being thoughtfully prepared using the most
              beautiful stems available this season.
            </p>

            {arrangementName && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(44,62,80,0.12)',
                  borderRadius: 2,
                  padding: '24px 28px',
                  margin: '0 auto 32px',
                  maxWidth: 480,
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#87734C',
                    marginBottom: 8,
                  }}
                >
                  Your Order
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 400,
                    color: '#2C3E50',
                    marginBottom: 4,
                  }}
                >
                  {arrangementName}
                </p>
                {totalDisplay && (
                  <p style={{ fontSize: 14, color: '#87734C' }}>
                    Total charged: {totalDisplay}
                  </p>
                )}
              </div>
            )}

            <p
              style={{
                fontSize: 15,
                color: 'rgba(44,62,80,0.7)',
                lineHeight: 1.75,
                maxWidth: '50ch',
                margin: '0 auto 36px',
              }}
            >
              A confirmation receipt is on its way to your inbox. We will
              reach out within one business day to confirm delivery timing
              and any final details.
            </p>

            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                background: '#2C3E50',
                color: '#F2F2EB',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid #2C3E50',
                transition: 'all 0.25s ease',
              }}
            >
              Return to the Studio
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
