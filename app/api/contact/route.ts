import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const MAILBOX = "support@cryptosolutionagency.com"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function smtpPass() {
  return process.env.SMTP_PASS?.trim() || ""
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    live: true,
    smtpPassSet: Boolean(smtpPass()),
    mailbox: MAILBOX,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim()
    const message = String(body.message ?? "").trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const pass = smtpPass()
    if (!pass) {
      return NextResponse.json(
        {
          error:
            "SMTP_PASS is not set on the server. Add it in hPanel Node.js environment variables, then restart.",
        },
        { status: 500 },
      )
    }

    const port = Number(process.env.SMTP_PORT || 465)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER || MAILBOX,
        pass,
      },
    })

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Crypto Solution Agency <${MAILBOX}>`,
      to: process.env.EMAIL_TO || MAILBOX,
      replyTo: email,
      subject: `New Contact Form Inquiry from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(message)}</div>
        <p><strong>Submitted At:</strong> ${escapeHtml(new Date().toLocaleString())}</p>
      `,
    })

    return NextResponse.json({
      success: true,
      id: info.messageId,
      message: "Contact form submitted successfully",
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 })
  }
}
