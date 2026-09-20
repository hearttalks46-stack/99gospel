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
    throw new EmailConfigError(`Missing required environment variable: ${name}`);
  }
  return trimmed;
}

type ResendLike = {
  emails: {
    send: (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      text?: string;
      replyTo?: string;
    }) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
  };
};

export function createResendSender(options: {
  apiKey: string;
  defaultFrom: string;
  resend?: ResendLike;
}): EmailSender {
  const apiKey = requireEnv("RESEND_API_KEY", options.apiKey);
  const defaultFrom = requireEnv("EMAIL_FROM", options.defaultFrom);

  return async (input) => {
    const from = input.from?.trim() || defaultFrom;
    const client: ResendLike =
      options.resend ?? new (await import("resend")).Resend(apiKey);

    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });

    if (error) {
      throw new EmailSendError(error.message);
    }
    if (!data?.id) {
      throw new EmailSendError("Resend returned no email id");
    }
    return { id: data.id };
  };
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
    to: requireEnv("EMAIL_TO", process.env.EMAIL_TO),
    subject: `New message from ${name}`,
    replyTo: email,
    text: `${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${escaped(name)} &lt;${escaped(email)}&gt;</p><p>${escaped(message).replaceAll("\n", "<br />")}</p>`,
  };
}

export async function sendEmail(
  input: SendEmailInput,
  sender: EmailSender = createResendSender({
    apiKey: process.env.RESEND_API_KEY ?? "",
    defaultFrom: process.env.EMAIL_FROM ?? "",
  }),
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
