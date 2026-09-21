export const DEFAULT_BUSINESS_EMAIL = "support@cryptosolutionagency.com";
export const DEFAULT_FROM = `Crypto Solution Agency <${DEFAULT_BUSINESS_EMAIL}>`;
export const DEFAULT_SMTP_HOST = "smtp.hostinger.com";
export const DEFAULT_SMTP_PORT = 465;

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};

export type SendMailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

export type MailTransporter = {
  sendMail: (payload: SendMailPayload) => Promise<{ messageId?: string }>;
};

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export class EmailValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailValidationError";
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactPayload(input: unknown): ContactPayload {
  if (!input || typeof input !== "object") {
    throw new EmailValidationError("Invalid request body");
  }

  const body = input as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const company = String(body.company ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    throw new EmailValidationError("Name, email, and message are required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new EmailValidationError("Please enter a valid email address");
  }

  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    throw new EmailValidationError("One or more fields are too long");
  }

  if (phone.length > 40 || company.length > 160) {
    throw new EmailValidationError("One or more fields are too long");
  }

  return { name, email, phone, company, message };
}

export function formatContactEmail(
  contact: ContactPayload,
  to = process.env.EMAIL_TO?.trim() || DEFAULT_BUSINESS_EMAIL,
  from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
): SendMailPayload {
  const submittedAt = new Date().toISOString();
  const textLines = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    contact.phone ? `Phone: ${contact.phone}` : null,
    contact.company ? `Company: ${contact.company}` : null,
    "",
    contact.message,
    "",
    `Submitted at: ${submittedAt}`,
  ].filter((line): line is string => line !== null);

  return {
    from,
    to,
    replyTo: contact.email,
    subject: `New client inquiry from ${contact.name}`,
    text: textLines.join("\n"),
    html: `
      <h2>New client inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
      ${contact.phone ? `<p><strong>Phone:</strong> ${escapeHtml(contact.phone)}</p>` : ""}
      ${contact.company ? `<p><strong>Company:</strong> ${escapeHtml(contact.company)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <div style="background:#f4f4f4;padding:15px;border-radius:4px;white-space:pre-wrap;">${escapeHtml(contact.message)}</div>
      <p><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
    `,
  };
}

export function smtpPass() {
  return process.env.SMTP_PASS?.trim() || "";
}

export async function createDefaultTransporter(): Promise<MailTransporter> {
  const pass = smtpPass();
  if (!pass) {
    throw new EmailConfigError(
      "SMTP_PASS is not set. Add it in .env locally or in your host's environment variables, then restart the app.",
    );
  }

  const port = Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT);
  const nodemailer = (await import("nodemailer")).default;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || DEFAULT_BUSINESS_EMAIL,
      pass,
    },
  });
}

export async function sendContactEmail(
  contact: ContactPayload,
  transporter?: MailTransporter,
): Promise<{ id: string }> {
  const mailer = transporter ?? (await createDefaultTransporter());
  const payload = formatContactEmail(contact);
  const info = await mailer.sendMail(payload);
  return { id: info.messageId || "sent" };
}
