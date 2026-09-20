import { loadDotEnv } from "./load-env.js";

/** Hostinger mailbox used as from-address and contact inbox. */
export const BUSINESS_EMAIL = "support@cryptosolutionagency.com";
export const DEFAULT_FROM = `Crypto Solution Agency <${BUSINESS_EMAIL}>`;
export const DEFAULT_SMTP_HOST = "smtp.hostinger.com";
export const DEFAULT_SMTP_PORT = 465;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

export type SendEmailResult = {
  id: string;
};

export type EmailSender = (input: SendEmailInput) => Promise<SendEmailResult>;

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailSendError";
  }
}

export function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    if (name === "SMTP_PASS") {
      throw new EmailConfigError(
        "Missing SMTP_PASS. Add the Hostinger mailbox password for support@cryptosolutionagency.com to your .env file (hPanel → Emails). Host and port alone are not enough.",
      );
    }
    throw new EmailConfigError(`Missing required environment variable: ${name}`);
  }
  return trimmed;
}

type SmtpTransporter = {
  sendMail: (payload: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }) => Promise<{ messageId?: string }>;
};

export function createSmtpSender(options: {
  host?: string;
  port?: number;
  user: string;
  pass: string;
  defaultFrom?: string;
  transporter?: SmtpTransporter;
}): EmailSender {
  const user = requireEnv("SMTP_USER", options.user);
  const pass = requireEnv("SMTP_PASS", options.pass);
  const defaultFrom = options.defaultFrom?.trim() || DEFAULT_FROM;
  const host = options.host?.trim() || DEFAULT_SMTP_HOST;
  const port = options.port ?? DEFAULT_SMTP_PORT;

  return async (input) => {
    const from = input.from?.trim() || defaultFrom;
    const transporter: SmtpTransporter =
      options.transporter ??
      (await import("nodemailer")).default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

    try {
      const info = await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      });
      return { id: info.messageId || "sent" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "SMTP send failed";
      throw new EmailSendError(message);
    }
  };
}

export function createDefaultSender(): EmailSender {
  loadDotEnv();
  return createSmtpSender({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER ?? BUSINESS_EMAIL,
    pass: process.env.SMTP_PASS ?? "",
    defaultFrom: process.env.EMAIL_FROM ?? DEFAULT_FROM,
  });
}

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

export function formatContactEmail(contact: ContactMessage): SendEmailInput {
  const name = contact.name.trim();
  const email = contact.email.trim();
  const message = contact.message.trim();

  if (!name || !email || !message) {
    throw new EmailSendError("name, email, and message are required");
  }

  const escaped = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  return {
    to: process.env.EMAIL_TO?.trim() || BUSINESS_EMAIL,
    subject: `New message from ${name}`,
    replyTo: email,
    text: `${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${escaped(name)} &lt;${escaped(email)}&gt;</p><p>${escaped(message).replaceAll("\n", "<br />")}</p>`,
  };
}

export async function sendEmail(
  input: SendEmailInput,
  sender: EmailSender = createDefaultSender(),
): Promise<SendEmailResult> {
  if (!input.subject.trim()) {
    throw new EmailSendError("subject is required");
  }
  if (!input.html.trim() && !input.text?.trim()) {
    throw new EmailSendError("html or text is required");
  }
  return sender(input);
}

export async function sendContactEmail(
  contact: ContactMessage,
  sender?: EmailSender,
): Promise<SendEmailResult> {
  return sendEmail(formatContactEmail(contact), sender);
}
