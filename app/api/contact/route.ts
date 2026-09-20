import nodemailer from "nodemailer";

const MAILBOX = "support@cryptosolutionagency.com";

function smtpPass(): string {
  return process.env.SMTP_PASS?.trim() || "";
}

export async function GET() {
  return Response.json({
    ok: true,
    live: true,
    smtpPassSet: Boolean(smtpPass()),
    mailbox: MAILBOX,
  });
}

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !email || !message) {
    return Response.json(
      { success: false, error: "name, email, and message are required" },
      { status: 400 },
    );
  }

  const pass = smtpPass();
  if (!pass) {
    return Response.json(
      {
        success: false,
        error:
          "SMTP_PASS is not set on the server. Add it in hPanel → Node.js → Environment variables, then restart the app.",
      },
      { status: 500 },
    );
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || MAILBOX,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Crypto Solution Agency <${MAILBOX}>`,
      to: process.env.EMAIL_TO || MAILBOX,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });
    return Response.json({
      success: true,
      id: info.messageId,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "SMTP send failed";
    console.error("contact SMTP failed", detail);
    return Response.json({ success: false, error: detail }, { status: 500 });
  }
}
