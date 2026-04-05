import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { to, subject, body, contactId, userId } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Try sending via Resend if key is configured
    const resendKey = process.env.RESEND_API_KEY
    let emailSent = false

    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@viox.ai',
            to: [to],
            subject,
            html: body.replace(/\n/g, '<br/>'),
          }),
        })

        if (res.ok) {
          emailSent = true
        } else {
          const err = await res.json()
          console.error('Resend error:', err)
        }
      } catch (err) {
        console.error('Resend API error:', err)
      }
    }

    // Get org from first org (admin client)
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    const orgId = org?.id

    // Log email as activity regardless of send status
    await supabase.from('activities').insert({
      organization_id: orgId,
      contact_id: contactId || null,
      user_id: userId || null,
      type: 'email',
      title: `Email: ${subject}`,
      description: `To: ${to}\n\n${body.substring(0, 500)}`,
      status: 'completed',
      completed_at: new Date().toISOString(),
      metadata: {
        to,
        subject,
        sent_via: emailSent ? 'resend' : 'logged_only',
        sent_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      sent: emailSent,
      message: emailSent
        ? 'Email sent successfully'
        : 'Email logged as activity (no Resend API key configured)',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
