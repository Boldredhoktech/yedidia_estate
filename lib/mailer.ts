// lib/mailer.ts

import { Resend } from 'resend'
import { siteConfig } from '@/config/siteconfig'

// ─────────────────────────────────────────────
// RESEND CLIENT
// ─────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM    = process.env.RESEND_FROM    ?? `Yedidia Estate <noreply@yedidia-estate.com>`
const COMPLAINTS_TO = siteConfig.contact.emailComplaints
const SUPPORT_TO    = siteConfig.contact.emailSupport

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface MailResult {
    success:   boolean
    messageId?: string
    error?:    string
}

// ─────────────────────────────────────────────
// BASE SEND
// ─────────────────────────────────────────────

async function sendMail(opts: {
    to:      string | string[]
    subject: string
    html:    string
}): Promise<MailResult> {
    try {
        const { data, error } = await resend.emails.send({
            from:    FROM,
            to:      Array.isArray(opts.to) ? opts.to : [opts.to],
            subject: opts.subject,
            html:    opts.html,
        })

        if (error) return { success: false, error: error.message }
        return { success: true, messageId: data?.id }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown mailer error'
        return { success: false, error: message }
    }
}

// ─────────────────────────────────────────────
// SHARED HTML WRAPPER
// ─────────────────────────────────────────────

function emailWrapper(content: string): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Yedidia Estate</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

            <!-- Header -->
            <tr>
              <td style="background:#e23d76;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                  🇬🇭 Yedidia Estate
                </h1>
                <p style="margin:4px 0 0;color:#fce7f0;font-size:13px;">
                  Your Trusted Real Estate Partner in Ghana
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 32px 24px;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  ${siteConfig.name} · ${siteConfig.address.full}
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
                  <a href="${siteConfig.url}" style="color:#e23d76;text-decoration:none;">${siteConfig.url}</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:${siteConfig.contact.emailContact}" style="color:#e23d76;text-decoration:none;">
                    ${siteConfig.contact.emailContact}
                  </a>
                </p>
                <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">
                  © ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

// ─────────────────────────────────────────────
// EMAIL 1 — Payment receipt
// ─────────────────────────────────────────────

export async function sendPaymentReceipt(opts: {
    to:          string
    agentName:   string
    formulaName: string
    amount:      number
    currency:    string
    reference:   string
    method:      string
    paidAt:      string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Payment Confirmed ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Hello <strong>${opts.agentName}</strong>, your payment has been successfully processed.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f9fafb;border-radius:8px;padding:20px;border:1px solid #e5e7eb;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#6b7280;width:45%;">Formula</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${opts.formulaName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Amount</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">
          ${opts.currency} ${opts.amount.toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Method</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;text-transform:capitalize;">
          ${opts.method}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Reference</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-family:monospace;">${opts.reference}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Date</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">${opts.paidAt}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      You can now publish your listings. If you have any questions, contact us at
      <a href="mailto:${SUPPORT_TO}" style="color:#e23d76;">${SUPPORT_TO}</a>.
    </p>
  `)

    return sendMail({
        to:      opts.to,
        subject: `✅ Payment Confirmed — ${opts.formulaName} | Yedidia Estate`,
        html,
    })
}

// ─────────────────────────────────────────────
// EMAIL 2 — J-7 expiry warning
// ─────────────────────────────────────────────

export async function sendExpiryWarning(opts: {
    to:          string
    agentName:   string
    listingTitle:string
    listingId:   string
    expiresAt:   string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your listing expires in 7 days ⚠️</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Hello <strong>${opts.agentName}</strong>, one of your active listings is expiring soon.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fff7ed;border-radius:8px;padding:20px;border:1px solid #fed7aa;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#92400e;width:45%;">Listing</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${opts.listingTitle}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#92400e;">Listing ID</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-family:monospace;">${opts.listingId}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#92400e;">Expires on</td>
        <td style="padding:6px 0;font-size:14px;color:#dc2626;font-weight:700;">${opts.expiresAt}</td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">
      Once expired, your listing will no longer be visible to visitors.
      To keep it live, please publish a new listing or renew your subscription.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;">
      Need help? Contact us at
      <a href="mailto:${SUPPORT_TO}" style="color:#e23d76;">${SUPPORT_TO}</a>.
    </p>
  `)

    return sendMail({
        to:      opts.to,
        subject: `⚠️ Your listing expires in 7 days — ${opts.listingTitle}`,
        html,
    })
}

// ─────────────────────────────────────────────
// EMAIL 3 — Account blocked
// ─────────────────────────────────────────────

export async function sendAccountBlocked(opts: {
    to:        string
    agentName: string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Account Suspended 🚫</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Hello <strong>${opts.agentName}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Your Yedidia Estate agent account has been <strong style="color:#dc2626;">suspended</strong>.
      All your active listings have been temporarily removed from the platform.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      If you believe this is an error or would like to understand the reason,
      please contact our support team.
    </p>
    <a href="mailto:${SUPPORT_TO}"
      style="display:inline-block;background:#e23d76;color:#fff;padding:12px 24px;
             border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Contact Support
    </a>
  `)

    return sendMail({
        to:      opts.to,
        subject: '🚫 Your Yedidia Estate account has been suspended',
        html,
    })
}

// ─────────────────────────────────────────────
// EMAIL 4 — Account activated / unblocked
// ─────────────────────────────────────────────

export async function sendAccountActivated(opts: {
    to:        string
    agentName: string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Account Activated ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Hello <strong>${opts.agentName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      Great news! Your Yedidia Estate agent account is now
      <strong style="color:#16a34a;">active</strong>.
      You can log in and start publishing your listings.
    </p>
    <a href="${siteConfig.url}/agents"
      style="display:inline-block;background:#e23d76;color:#fff;padding:12px 24px;
             border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Go to My Dashboard
    </a>
  `)

    return sendMail({
        to:      opts.to,
        subject: '✅ Your Yedidia Estate account is now active',
        html,
    })
}

// ─────────────────────────────────────────────
// EMAIL 5 — Complaint forwarding
// ─────────────────────────────────────────────

export async function sendComplaintNotification(opts: {
    visitorName:  string
    visitorEmail: string
    visitorPhone?: string
    listingRef?:  string
    message:      string
    complaintId:  string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">New Complaint Received 📩</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      A visitor has submitted a complaint via the website.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fef2f2;border-radius:8px;padding:20px;border:1px solid #fecaca;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#991b1b;width:40%;">Complaint ID</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-family:monospace;">${opts.complaintId}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#991b1b;">Name</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">${opts.visitorName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#991b1b;">Email</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">
          <a href="mailto:${opts.visitorEmail}" style="color:#e23d76;">${opts.visitorEmail}</a>
        </td>
      </tr>
      ${opts.visitorPhone ? `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#991b1b;">Phone</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">${opts.visitorPhone}</td>
      </tr>` : ''}
      ${opts.listingRef ? `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#991b1b;">Listing ref</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">${opts.listingRef}</td>
      </tr>` : ''}
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;font-weight:600;">Message:</p>
    <div style="background:#f9fafb;border-left:4px solid #e23d76;padding:16px;
                border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6;">
      ${opts.message.replace(/\n/g, '<br/>')}
    </div>
  `)

    return sendMail({
        to:      COMPLAINTS_TO,
        subject: `📩 New Complaint #${opts.complaintId} — ${opts.visitorName}`,
        html,
    })
}

// ─────────────────────────────────────────────
// EMAIL 6 — Manual payment request (agent → support)
// ─────────────────────────────────────────────

export async function sendManualPaymentRequest(opts: {
    agentName:   string
    agentEmail:  string
    agentPhone?: string
    formulaName: string
    formulaKey:  string
}): Promise<MailResult> {

    const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Manual Payment Request 💳</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      An agent has requested to pay manually for a subscription formula.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f0fdf4;border-radius:8px;padding:20px;border:1px solid #bbf7d0;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#166534;width:40%;">Agent Name</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${opts.agentName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#166534;">Email</td>
        <td style="padding:6px 0;font-size:14px;">
          <a href="mailto:${opts.agentEmail}" style="color:#e23d76;">${opts.agentEmail}</a>
        </td>
      </tr>
      ${opts.agentPhone ? `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#166534;">Phone</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;">${opts.agentPhone}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#166534;">Formula</td>
        <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">
          ${opts.formulaKey} — ${opts.formulaName}
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      Please contact this agent to arrange payment and then activate their subscription
      from the admin panel at <strong>/kwaku</strong> or <strong>/opoku</strong>.
    </p>
  `)

    return sendMail({
        to:      SUPPORT_TO,
        subject: `💳 Manual Payment Request — ${opts.agentName} (${opts.formulaKey})`,
        html,
    })
}