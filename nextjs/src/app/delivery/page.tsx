export const metadata = {
  title: 'Delivery & Service | DreamersJoy Floral Studio',
  description: 'Hand-delivered floral designs throughout Northern New Jersey and the greater New York metropolitan area. Same-day delivery available.',
}

export default function DeliveryPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
        color: '#334155',
        background: '#FAFAF8',
        margin: 0,
        padding: 0,
        lineHeight: 1.6,
        WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Back to site */}
        <nav style={{
          padding: '20px 0',
          borderBottom: '1px solid rgba(201,184,168,0.2)',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#334155', textDecoration: 'none' }}>DreamersJoy</a>
            <a href="/#booking" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#8B7355', textDecoration: 'none', borderBottom: '1px solid #C9B8A8', paddingBottom: 2 }}>Inquire</a>
          </div>
        </nav>

        <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8B7355', marginBottom: 20 }}>Delivery &amp; Service</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, lineHeight: 1.15, marginBottom: 24, color: '#334155' }}>Hand-Delivered with Care</h1>
          <p style={{ fontSize: 16, color: 'rgba(51,65,85,0.65)', lineHeight: 1.8, maxWidth: '55ch', marginBottom: 48 }}>
            We offer hand-delivered floral designs throughout Northern New Jersey and the greater New York metropolitan area. Each arrangement is carefully transported to ensure it arrives in perfect condition and presentation.
          </p>

          {/* Delivery Options */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 24, color: '#334155' }}>Delivery Options</h2>
          <div style={{ display: 'grid', gap: 0, borderTop: '1px solid rgba(201,184,168,0.3)' }}>
            {[
              { zone: 'Local Delivery (0\u201310 miles)', price: 'Complimentary on orders over $125', note: '$18 for orders below minimum' },
              { zone: 'Extended Delivery (10\u201320 miles)', price: '$28\u2013$35', note: '' },
              { zone: 'Signature Delivery (20\u201330 miles)', price: '$45\u2013$65', note: 'Minimum order of $125 applies' },
              { zone: 'Concierge Delivery (30+ miles)', price: 'Available upon request', note: 'Please contact us to arrange a private courier service' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px 0', borderBottom: '1px solid rgba(201,184,168,0.15)', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 400, color: '#334155' }}>{item.zone}</p>
                </div>
                <div>
                  <p style={{ fontSize: 15, color: '#8B7355' }}>{item.price}</p>
                  {item.note && <p style={{ fontSize: 13, color: 'rgba(51,65,85,0.5)', marginTop: 4 }}>{item.note}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Same-Day */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 16, color: '#334155' }}>Same-Day Delivery</h2>
            <p style={{ fontSize: 15, color: 'rgba(51,65,85,0.65)', lineHeight: 1.8, maxWidth: '55ch' }}>
              Same-day delivery is available for orders placed before 1:00 PM. Orders placed after this time will be scheduled for the next available delivery date.
            </p>
            <p style={{ fontSize: 15, color: 'rgba(51,65,85,0.65)', lineHeight: 1.8, maxWidth: '55ch', marginTop: 12 }}>
              For urgent or time-sensitive requests, we invite you to contact us directly. When possible, we are happy to offer priority service.
            </p>
          </div>

          {/* Additional Services */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 24, color: '#334155' }}>Additional Services</h2>
            <div style={{ display: 'grid', gap: 0, borderTop: '1px solid rgba(201,184,168,0.3)' }}>
              {[
                { service: 'Priority Same-Day Delivery', desc: 'Available for a limited number of orders placed after the daily cutoff' },
                { service: 'Timed Delivery Window', desc: 'Scheduled delivery within a preferred timeframe' },
                { service: 'Evening & Event Delivery', desc: 'Available upon request' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px 0', borderBottom: '1px solid rgba(201,184,168,0.15)' }}>
                  <p style={{ fontSize: 15, fontWeight: 400, color: '#334155' }}>{item.service}</p>
                  <p style={{ fontSize: 14, color: 'rgba(51,65,85,0.55)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Notes */}
          <div style={{ marginTop: 48, padding: 32, border: '1px solid rgba(201,184,168,0.3)', borderRadius: 4, background: '#F5F0EB' }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#8B7355', marginBottom: 12 }}>Delivery Notes</p>
            <p style={{ fontSize: 14, color: 'rgba(51,65,85,0.6)', lineHeight: 1.7 }}>
              Deliveries are fulfilled between 12:00 PM and 6:00 PM unless otherwise arranged. Each arrangement is placed with care to ensure a seamless and elevated delivery experience.
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' as const, marginTop: 64 }}>
            <a href="/#offerings" style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: '#334155',
              color: '#FAFAF8',
              fontFamily: "'Jost', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              textDecoration: 'none',
            }}>View Floral Offerings</a>
          </div>
        </main>

        <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(201,184,168,0.2)', textAlign: 'center' as const }}>
          <p style={{ fontSize: 12, color: 'rgba(51,65,85,0.3)' }}>&copy; 2026 DreamersJoy Floral Studio. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
