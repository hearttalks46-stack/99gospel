# Email sending via support@cryptosolutionagency.com

Mail is sent through the existing Hostinger mailbox `support@cryptosolutionagency.com` (SMTP). Contact-form messages are delivered to that same inbox. Resend/SendGrid is not required.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `SMTP_PASS` to the **mailbox password** for `support@cryptosolutionagency.com` (Hostinger hPanel → **Emails** → that account). This is not your Hostinger login password unless you set them the same.
3. Leave the other values as they are unless Hostinger changes SMTP settings.

```bash
cp .env.example .env
npm install
```

## Send

```ts
import { sendEmail, sendContactEmail } from "./src/email.ts";

await sendEmail({
  to: "support@cryptosolutionagency.com",
  subject: "Welcome",
  html: "<p>Thanks for writing.</p>",
});

await sendContactEmail({
  name: "Ada",
  email: "ada@example.com",
  message: "I would like a copy of this week's reading.",
});
```

`sendContactEmail` always delivers to `support@cryptosolutionagency.com` and sets Reply-To to the visitor so you can answer from that mailbox.

After `SMTP_PASS` is set, send a test to yourself:

```bash
node --env-file=.env --import tsx src/send-test.ts
```

## Tests

```bash
npm test
```
