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
npm run send:test
```

## Live website (Hostinger)

`npm run send:test` only runs on your PC. [cryptosolutionagency.com](https://cryptosolutionagency.com) is a separate Next.js app. The contact form already posts to `/api/contact`, but that route was returning success **without sending mail**.

1. Copy `src/email.ts`, `src/load-env.ts`, `src/contact-api.ts`, and `app/api/contact/route.ts` into the **same Next.js project you deploy** (the v0 site), then `npm install nodemailer`.
2. In **hPanel → Websites → cryptosolutionagency.com → Node.js** (or **Environment variables**), add:

   - `EMAIL_FROM=Crypto Solution Agency <support@cryptosolutionagency.com>`
   - `EMAIL_TO=support@cryptosolutionagency.com`
   - `SMTP_HOST=smtp.hostinger.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=support@cryptosolutionagency.com`
   - `SMTP_PASS=` (mailbox password)

   A laptop `.env` is **not** used on the live site.
3. Restart / rebuild the Node.js app so the new route and env vars load.
4. Submit the live **Get in Touch** form and check the support inbox.

## Tests

```bash
npm test
```
