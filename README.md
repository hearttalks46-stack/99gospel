# Email sending (Resend)

This repo sends transactional email through [Resend](https://resend.com). The same pattern works with SendGrid; Resend is wired up because its Node SDK matches the previous TODO.

## Setup

1. Create a Resend account and verify a sending domain.
2. Copy `.env.example` to `.env` and fill in:

   - `RESEND_API_KEY` — from the Resend dashboard
   - `EMAIL_FROM` — a verified sender, e.g. `99 Gospel <noreply@yourdomain.com>`
   - `EMAIL_TO` — the inbox that should receive contact-form messages

3. Install dependencies:

   ```bash
   npm install
   ```

## Send a message

```ts
import { sendEmail, sendContactEmail } from "./src/email.ts";

await sendEmail({
  to: "reader@example.com",
  subject: "Welcome",
  html: "<p>Thanks for joining 99 Gospel.</p>",
  text: "Thanks for joining 99 Gospel.",
});

await sendContactEmail({
  name: "Ada",
  email: "ada@example.com",
  message: "I would like a copy of this week's reading.",
});
```

`sendContactEmail` uses `EMAIL_TO` as the destination and sets `replyTo` to the visitor's address so you can answer from your inbox.

## Errors

- `EmailConfigError` — missing `RESEND_API_KEY` or `EMAIL_FROM`
- `EmailSendError` — Resend rejected the request, or required fields were blank

Do not commit API keys. Keep them in `.env` or your host's secret store.

## Tests

```bash
npm test
```
