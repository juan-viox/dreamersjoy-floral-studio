'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

const COLORS = {
  primary: '#334155',
  accent: '#8B7355',
  light: '#FAFAF8',
  secondary: '#F5F0EB',
  white: '#FFFFFF',
  border: '#D4C5B2',
  muted: '#94a3b8',
}

const interestOptions = [
  'Seasonal Floral Experience',
  'Birthday Floral Night',
  'Corporate Creative Session',
  'Client Appreciation Event',
]

export default function InvitePage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interest: '',
    referral: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    const description = [
      `Name: ${form.firstName} ${form.lastName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Interest: ${form.interest}`,
      `Referral: ${form.referral}`,
      form.notes ? `Notes: ${form.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/v1/ingest/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '8e2c0eaeca4b01990e4f60b660afa52d7ee93c15c9d1b5a2c8a138b9853f33aa',
        },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          source: 'invitation_request',
          description,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    fontFamily: "'Jost', sans-serif",
    color: COLORS.primary,
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    color: COLORS.primary,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus {
          border-color: ${COLORS.accent} !important;
        }
        ::placeholder { color: ${COLORS.muted}; }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: COLORS.light }}>
        {/* ── Nav ── */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 48px',
            borderBottom: `1px solid ${COLORS.secondary}`,
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px',
              fontWeight: 500,
              color: COLORS.primary,
              textDecoration: 'none',
              letterSpacing: '1px',
            }}
          >
            DreamersJoy
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: COLORS.accent,
              textDecoration: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'opacity 0.3s ease',
            }}
          >
            Back to Studio
          </Link>
        </nav>

        {/* ── Main ── */}
        <main
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '80px 24px 120px',
          }}
        >
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 32px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  color: COLORS.accent,
                }}
              >
                &#10003;
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '32px',
                  fontWeight: 400,
                  color: COLORS.primary,
                  marginBottom: '20px',
                  lineHeight: 1.3,
                }}
              >
                Thank You
              </h2>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '16px',
                  fontWeight: 300,
                  color: COLORS.primary,
                  lineHeight: 1.7,
                  maxWidth: '440px',
                  margin: '0 auto',
                }}
              >
                Thank you for your interest. We&apos;ll reach out when a spot becomes
                available for your preferred experience.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  marginTop: '40px',
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  color: COLORS.accent,
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Return to Studio
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '42px',
                    fontWeight: 400,
                    color: COLORS.primary,
                    marginBottom: '20px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Request an Invitation
                </h1>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '16px',
                    fontWeight: 300,
                    color: COLORS.primary,
                    lineHeight: 1.8,
                    maxWidth: '500px',
                    margin: '0 auto',
                    opacity: 0.8,
                  }}
                >
                  Our floral experiences are held once or twice a month in intimate,
                  beautifully curated settings. Space is limited and offered by
                  invitation only.
                </p>
              </div>

              {/* Decorative line */}
              <div
                style={{
                  width: '48px',
                  height: '1px',
                  backgroundColor: COLORS.accent,
                  margin: '0 auto 48px',
                }}
              />

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Name row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input
                      required
                      type="text"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Email + Phone row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Interest dropdown */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>What interests you most?</label>
                  <select
                    required
                    value={form.interest}
                    onChange={(e) => update('interest', e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B7355' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: '40px',
                      cursor: 'pointer',
                      color: form.interest ? COLORS.primary : COLORS.muted,
                    }}
                  >
                    <option value="" disabled>
                      Select an experience
                    </option>
                    {interestOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Referral */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>How did you hear about us?</label>
                  <input
                    type="text"
                    placeholder="Instagram, a friend, an event..."
                    value={form.referral}
                    onChange={(e) => update('referral', e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '40px' }}>
                  <label style={labelStyle}>Anything else we should know?</label>
                  <textarea
                    placeholder="Tell us a bit about what you're looking for..."
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '120px',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    fontSize: '13px',
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 500,
                    color: COLORS.white,
                    backgroundColor: COLORS.accent,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: status === 'submitting' ? 'wait' : 'pointer',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    transition: 'background-color 0.3s ease, opacity 0.3s ease',
                    opacity: status === 'submitting' ? 0.7 : 1,
                  }}
                >
                  {status === 'submitting'
                    ? 'Submitting...'
                    : 'Request an Invitation'}
                </button>

                {status === 'error' && (
                  <p
                    style={{
                      marginTop: '16px',
                      textAlign: 'center',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '14px',
                      color: '#b91c1c',
                    }}
                  >
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </>
          )}
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            textAlign: 'center',
            padding: '32px 24px',
            borderTop: `1px solid ${COLORS.secondary}`,
          }}
        >
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 300,
              color: COLORS.muted,
              letterSpacing: '0.5px',
            }}
          >
            &copy; {new Date().getFullYear()} DreamersJoy Floral Studio. All rights
            reserved.
          </p>
        </footer>
      </div>
    </>
  )
}
