'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, XCircle, Loader2, FileDown, Mail, Link2, Copy } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice, InvoiceItem } from '@/types'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(136,136,160,0.15)', color: 'var(--muted)' },
  sent: { bg: 'rgba(108,92,231,0.15)', color: 'var(--accent-light)' },
  paid: { bg: 'rgba(0,184,148,0.15)', color: 'var(--success)' },
  overdue: { bg: 'rgba(225,112,85,0.15)', color: 'var(--danger)' },
  cancelled: { bg: 'rgba(136,136,160,0.1)', color: 'var(--muted)' },
}

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadInvoice()
  }, [])

  async function loadInvoice() {
    const { data: inv } = await supabase
      .from('invoices')
      .select('*, contact:contacts(first_name, last_name, email, phone, company:companies(name)), deal:deals(title)')
      .eq('id', params.id)
      .single()

    if (!inv) { setLoading(false); return }
    setInvoice(inv)

    const { data: lineItems } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id)
      .order('sort_order')

    setItems(lineItems ?? [])
    setLoading(false)
  }

  async function updateStatus(status: string) {
    setUpdating(true)

    // Cancelling goes through the server so the Stripe payment link is taken
    // out of service too. A cancelled invoice with a live link is still
    // payable, which is how you end up refunding money you never wanted.
    if (status === 'cancelled') {
      const res = await fetch(`/api/v1/invoices/${params.id}/cancel`, { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      setUpdating(false)
      if (!res.ok) {
        setSendResult({ ok: false, message: body.error ?? 'Could not cancel that invoice.' })
        return
      }
      await loadInvoice()
      return
    }

    const patch: Record<string, unknown> = { status }
    // Marking paid by hand (cash, cheque, bank transfer) should stamp the same
    // column the Stripe webhook stamps, so "when was this paid" has one answer.
    if (status === 'paid') patch.paid_at = new Date().toISOString()
    await supabase.from('invoices').update(patch).eq('id', params.id)
    setInvoice(prev => prev ? { ...prev, status: status as Invoice['status'] } : null)
    setUpdating(false)
  }

  /**
   * Actually email the invoice. The server creates the Stripe payment link,
   * sends the mail, marks the invoice sent and logs the activity — this just
   * reports what happened.
   */
  async function sendInvoice() {
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch(`/api/v1/invoices/${params.id}/send`, { method: 'POST' })
      const body = await res.json()

      if (!res.ok) {
        setSendResult({ ok: false, message: body.error ?? 'Could not send that invoice.' })
        return
      }

      setSendResult({
        ok: true,
        message: body.payUrl
          ? `Sent to ${body.sentTo} with a Pay now button.`
          : `Sent to ${body.sentTo}. No payment link was created — they'll need to pay another way.`,
      })
      await loadInvoice()
    } catch {
      setSendResult({ ok: false, message: 'Could not reach the server. Try again.' })
    } finally {
      setSending(false)
    }
  }

  async function copyPayLink() {
    if (!invoice?.payment_link_url) return
    await navigator.clipboard.writeText(invoice.payment_link_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Invoice</h1>
        <div className="card animate-shimmer h-96" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl">
        <Link href="/invoices" className="inline-flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: 'var(--muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </Link>
        <p style={{ color: 'var(--muted)' }}>Invoice not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: 'var(--muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to invoices
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <span className="badge mt-1" style={STATUS_STYLES[invoice.status]}>
            {invoice.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <button
              onClick={() => updateStatus('sent')}
              disabled={updating}
              className="btn btn-primary"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Mark as Sent
            </button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={() => updateStatus('paid')}
              disabled={updating}
              className="btn btn-primary"
              style={{ background: 'var(--success)' }}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Mark as Paid
            </button>
          )}
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={updating}
              className="btn btn-secondary"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
          <button
            onClick={() => window.open(`/api/v1/invoices/${params.id}/pdf`, '_blank')}
            className="btn btn-secondary"
          >
            <FileDown className="w-4 h-4" /> Print Invoice
          </button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button
              onClick={sendInvoice}
              disabled={sending || !invoice.contact?.email}
              className="btn btn-primary"
              title={
                invoice.contact?.email
                  ? `Email this invoice to ${invoice.contact.email}`
                  : 'This contact has no email address'
              }
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {invoice.sent_at ? 'Send Again' : 'Email Invoice'}
            </button>
          )}
        </div>
      </div>

      {sendResult && (
        <div
          className="card mb-6 text-sm"
          style={{
            borderColor: sendResult.ok ? 'var(--success)' : 'var(--danger)',
            background: sendResult.ok ? 'rgba(0,184,148,0.08)' : 'rgba(225,112,85,0.08)',
          }}
        >
          {sendResult.message}
        </div>
      )}

      {invoice.payment_link_url && (
        <div className="card mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <Link2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent-light)' }} />
            <div className="min-w-0">
              <p className="font-semibold">Payment link</p>
              <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                {invoice.payment_link_url}
              </p>
            </div>
          </div>
          <button onClick={copyPayLink} className="btn btn-secondary shrink-0">
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {/* Invoice preview */}
      <div className="card" id="invoice-preview">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold mb-1">INVOICE</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{invoice.invoice_number}</p>
          </div>
          <div className="text-right text-sm">
            <p><span style={{ color: 'var(--muted)' }}>Issue Date:</span> {formatDate(invoice.issue_date)}</p>
            {invoice.due_date && (
              <p><span style={{ color: 'var(--muted)' }}>Due Date:</span> {formatDate(invoice.due_date)}</p>
            )}
          </div>
        </div>

        {/* Bill to */}
        {invoice.contact && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Bill To</p>
            <p className="font-semibold">{invoice.contact.first_name} {invoice.contact.last_name}</p>
            {invoice.contact.email && <p className="text-sm" style={{ color: 'var(--muted)' }}>{invoice.contact.email}</p>}
            {invoice.contact.phone && <p className="text-sm" style={{ color: 'var(--muted)' }}>{invoice.contact.phone}</p>}
            {(invoice.contact as { company?: { name?: string } }).company?.name && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{(invoice.contact as { company?: { name?: string } }).company?.name}</p>
            )}
          </div>
        )}

        {/* Line items table */}
        <div className="table-container mb-6">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--muted)' }}>{idx + 1}</td>
                  <td className="font-medium">{item.description}</td>
                  <td className="text-right" style={{ color: 'var(--muted)' }}>{item.quantity}</td>
                  <td className="text-right" style={{ color: 'var(--muted)' }}>{formatCurrency(Number(item.unit_price))}</td>
                  <td className="text-right font-medium">{formatCurrency(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--muted)' }}>Subtotal</span>
            <span>{formatCurrency(Number(invoice.subtotal))}</span>
          </div>
          {Number(invoice.tax_rate) > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Tax ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(Number(invoice.tax_amount))}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t text-lg" style={{ borderColor: 'var(--border)' }}>
            <span className="font-semibold">Total</span>
            <span className="font-bold" style={{ color: 'var(--accent-light)' }}>
              {formatCurrency(Number(invoice.total))}
            </span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Notes</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
