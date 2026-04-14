'use client'

import { useState, useEffect } from 'react'

const arrangements = [
  // ═══ MOTHER'S DAY — THE SPRING EDIT ═══
  { id: 'md-veiled-citrus-petite', name: "Mother's Day — Veiled Citrus (Petite)", price: '$95+', desc: 'Soft yellow, cream, fresh green. Ranunculus, sweet pea, jasmine vine. A refined, intimate piece.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-veiled-citrus-signature', name: "Mother's Day — Veiled Citrus (Signature)", price: '$145+', desc: 'Our most-loved size in the Veiled Citrus palette. Garden roses, ranunculus, butter-yellow tulips.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-olive-air-petite', name: "Mother's Day — Olive Air (Petite)", price: '$95+', desc: 'Muted olive, ivory, soft white. Hellebore, white ranunculus, olive branch. Quiet, sculptural, modern.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-olive-air-signature', name: "Mother's Day — Olive Air (Signature)", price: '$145+', desc: 'Signature size in the Olive Air palette. Tonal greens, ivory blooms, refined negative space.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-quiet-bloom-petite', name: "Mother's Day — Quiet Bloom (Petite)", price: '$95+', desc: 'Blush, dusty rose, soft neutrals. Garden roses, lisianthus, scabiosa. Softly romantic.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-quiet-bloom-signature', name: "Mother's Day — Quiet Bloom (Signature)", price: '$145+', desc: 'Signature size in the Quiet Bloom palette. Full, romantic, composed with airy movement.', category: "Mother's Day — The Spring Edit" },
  { id: 'md-quiet-bloom-statement', name: "Mother's Day — Quiet Bloom (Statement)", price: '$195+', desc: 'A sculptural, anchor piece in the Quiet Bloom palette. Designed to elevate and celebrate.', category: "Mother's Day — The Spring Edit" },
  // ═══ HAND-TIED BOUQUETS ═══
  { id: 'small-bouquet', name: 'Small Bouquet', price: '$75+', desc: 'A delicate, thoughtfully composed bouquet. Perfect for simple gestures and everyday moments.', category: 'Hand-Tied Bouquets' },
  { id: 'medium-bouquet', name: 'Medium Bouquet', price: '$95 \u2013 $125', desc: 'A balanced, fuller bouquet with a curated mix of seasonal florals.', category: 'Hand-Tied Bouquets' },
  { id: 'large-bouquet', name: 'Large Bouquet', price: '$125 \u2013 $165', desc: 'An abundant, expressive bouquet with layered blooms and natural movement.', category: 'Hand-Tied Bouquets' },
  { id: 'signature-bouquet', name: 'Signature Bouquet', price: '$165+', desc: 'A luxurious hand-tied bouquet featuring carefully selected stems. Designed for gifting and special occasions.', category: 'Hand-Tied Bouquets' },
  // ═══ SEASONAL ARRANGEMENTS ═══
  { id: 'petite', name: 'Petite Arrangement', price: '$85+', desc: 'A refined touch for intimate spaces. Perfect for a bedside, powder room, or thoughtful gesture.', category: 'Seasonal Arrangements' },
  { id: 'signature', name: 'Signature Arrangement', price: '$125+', desc: 'Our most-loved arrangement size. Designed to elevate dining tables, entryways, and everyday living.', category: 'Seasonal Arrangements' },
  { id: 'statement', name: 'Statement Arrangement', price: '$175+', desc: 'Sculptural and expressive. Designed to anchor a space and draw the eye with effortless presence.', category: 'Seasonal Arrangements' },
  { id: 'collectors', name: "Collector\u2019s Piece", price: '$250+', desc: 'One-of-a-kind and highly composed. Designed for those who appreciate exceptional floral work.', category: 'Seasonal Arrangements' },
]

const colorOptions = ['Soft & Neutral', 'Romantic Pastels', 'Rich & Moody', "Designer\u2019s Choice"]

export default function OrderPage() {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState('')
  const [color, setColor] = useState("Designer\u2019s Choice")
  const [form, setForm] = useState({ date: '', recipientName: '', address: '', cardMessage: '', deliveryNotes: '', name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [highlightMD, setHighlightMD] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('collection') === 'mothers-day') {
      setHighlightMD(true)
      setTimeout(() => {
        const el = document.getElementById('md-category')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/v1/ingest/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '8e2c0eaeca4b01990e4f60b660afa52d7ee93c15c9d1b5a2c8a138b9853f33aa' },
        body: JSON.stringify({
          firstName: form.name.split(' ')[0] || 'Order',
          lastName: form.name.split(' ').slice(1).join(' ') || 'Customer',
          email: form.email,
          phone: form.phone,
          description: `ORDER: ${selected} | Color: ${color} | Date: ${form.date} | Recipient: ${form.recipientName} | Address: ${form.address} | Card: ${form.cardMessage} | Notes: ${form.deliveryNotes}`,
          source: 'web_form',
        }),
      })
      setDone(true)
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <Page>
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 16 }}>Thank you for your order.</h1>
          <p style={{ fontSize: 16, color: 'rgba(51,65,85,0.6)', lineHeight: 1.7, maxWidth: '50ch', margin: '0 auto' }}>Your arrangement is being thoughtfully prepared using the most beautiful stems available this season. You will receive a confirmation once your delivery is complete.</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 40, padding: '14px 36px', background: '#334155', color: '#FAFAF8', fontSize: 13, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Return to Studio</a>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 120px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 20 }}>Place an Order</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, marginBottom: 12 }}>Order Your Arrangement</h1>
        <p style={{ fontSize: 15, color: 'rgba(51,65,85,0.6)', lineHeight: 1.7, maxWidth: '50ch', marginBottom: 48 }}>Select your arrangement and allow us to design with the most beautiful blooms of the season. Each piece is created with intention, movement, and a refined sense of composition.</p>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 48 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? '#334155' : 'rgba(201,184,168,0.3)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Step 1: Select Arrangement */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7C6E', marginBottom: 24 }}>Step 1 &mdash; Select Your Arrangement</p>
            {Array.from(new Set(arrangements.map(a => a.category))).map(category => (
              <div key={category} id={category.includes("Mother") ? 'md-category' : undefined} style={{ marginBottom: 32, padding: category.includes("Mother") && highlightMD ? '20px 24px' : 0, background: category.includes("Mother") && highlightMD ? 'rgba(139,115,85,0.04)' : 'transparent', border: category.includes("Mother") && highlightMD ? '1px solid rgba(139,115,85,0.2)' : 'none', borderRadius: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: category.includes("Mother") ? '#8B7355' : 'rgba(51,65,85,0.5)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(201,184,168,0.3)' }}>{category}</p>
                <div style={{ display: 'grid', gap: 16 }}>
                  {arrangements.filter(a => a.category === category).map(a => (
                    <button key={a.id} onClick={() => setSelected(a.name)} style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '24px 28px',
                      border: selected === a.name ? '2px solid #8B7355' : '1px solid rgba(201,184,168,0.3)',
                      borderRadius: 4, background: selected === a.name ? 'rgba(139,115,85,0.04)' : '#fff',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#334155' }}>{a.name}</h3>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#8B7355' }}>{a.price}</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(51,65,85,0.55)', lineHeight: 1.6, marginTop: 6 }}>{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(51,65,85,0.4)', marginTop: 16 }}>Each arrangement is seasonally designed. Specific flowers are not guaranteed.</p>
            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <button onClick={() => selected && setStep(2)} disabled={!selected} style={btnStyle(!selected)}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Design Preferences */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7C6E', marginBottom: 24 }}>Step 2 &mdash; Design Preferences</p>
            <label style={labelStyle}>Color Direction (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
              {colorOptions.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  padding: '14px 20px', border: color === c ? '2px solid #8B7355' : '1px solid rgba(201,184,168,0.3)',
                  borderRadius: 4, background: color === c ? 'rgba(139,115,85,0.04)' : '#fff',
                  cursor: 'pointer', fontSize: 14, color: '#334155', fontFamily: "'Jost', sans-serif", textAlign: 'left',
                }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button onClick={() => setStep(1)} style={btnOutlineStyle}>Back</button>
              <button onClick={() => setStep(3)} style={btnStyle(false)}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Delivery Details */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7C6E', marginBottom: 24 }}>Step 3 &mdash; Delivery Details</p>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>Delivery Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Recipient Name</label>
                <input type="text" value={form.recipientName} onChange={e => setForm({...form, recipientName: e.target.value})} placeholder="Who is this for?" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Delivery Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full delivery address" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Card Message</label>
                <textarea value={form.cardMessage} onChange={e => setForm({...form, cardMessage: e.target.value})} placeholder="What would you like the card to say?" style={{...inputStyle, minHeight: 80, resize: 'vertical' as const}} />
              </div>
              <div>
                <label style={labelStyle}>Delivery Notes (optional)</label>
                <input type="text" value={form.deliveryNotes} onChange={e => setForm({...form, deliveryNotes: e.target.value})} placeholder="Gate codes, placement instructions, etc." style={inputStyle} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(51,65,85,0.5)', marginTop: 16, lineHeight: 1.6 }}>Delivery will be calculated based on distance and selection. Same-day delivery is available for orders placed before 1:00 PM.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button onClick={() => setStep(2)} style={btnOutlineStyle}>Back</button>
              <button onClick={() => form.date && form.recipientName && form.address ? setStep(4) : null} disabled={!form.date || !form.recipientName || !form.address} style={btnStyle(!form.date || !form.recipientName || !form.address)}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Contact & Review */}
        {step === 4 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7C6E', marginBottom: 24 }}>Step 4 &mdash; Contact &amp; Review</p>
            <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@email.com" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(555) 123-4567" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ padding: 28, border: '1px solid rgba(201,184,168,0.3)', borderRadius: 4, background: '#F5F0EB', marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 16 }}>Order Summary</p>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'rgba(51,65,85,0.6)' }}>Arrangement</span><span style={{ fontWeight: 400 }}>{selected}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'rgba(51,65,85,0.6)' }}>Color Direction</span><span style={{ fontWeight: 400 }}>{color}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'rgba(51,65,85,0.6)' }}>Delivery Date</span><span style={{ fontWeight: 400 }}>{form.date}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'rgba(51,65,85,0.6)' }}>Delivery Address</span><span style={{ fontWeight: 400, maxWidth: '60%', textAlign: 'right' }}>{form.address}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(3)} style={btnOutlineStyle}>Back</button>
              <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email} style={btnStyle(submitting || !form.name || !form.email)}>
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(51,65,85,0.4)', marginTop: 16, textAlign: 'center' }}>We will confirm your order and delivery details via email. Payment will be arranged during confirmation.</p>
          </div>
        )}
      </div>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Place an Order | DreamersJoy Floral Studio</title>
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
        <nav style={{ padding: '20px 0', borderBottom: '1px solid rgba(201,184,168,0.2)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#334155', textDecoration: 'none' }}>DreamersJoy</a>
            <a href="/#booking" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', textDecoration: 'none', borderBottom: '1px solid #C9B8A8', paddingBottom: 2 }}>Inquire Instead</a>
          </div>
        </nav>
        {children}
        <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(201,184,168,0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'rgba(51,65,85,0.3)' }}>&copy; 2026 DreamersJoy Floral Studio. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: '#8B7355', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #C9B8A8',
  background: 'rgba(255,255,255,0.6)', color: '#334155',
  fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300,
  outline: 'none', borderRadius: 0, WebkitAppearance: 'none',
}
const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '14px 36px', background: disabled ? 'rgba(201,184,168,0.3)' : '#334155',
  color: disabled ? 'rgba(51,65,85,0.3)' : '#FAFAF8', fontFamily: "'Jost', sans-serif",
  fontSize: 13, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase',
  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
})
const btnOutlineStyle: React.CSSProperties = {
  padding: '14px 36px', border: '1px solid #C9B8A8', background: 'transparent',
  color: '#334155', fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 400,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
}
