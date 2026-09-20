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

The public site still uses a dummy `/api/contact` that returns success **without sending mail**. A laptop `.env` does not affect https://cryptosolutionagency.com.

### Check

Open this URL in the browser:

https://cryptosolutionagency.com/api/contact/

- Old (broken) app: empty page or HTTP 405
- New app, missing password: `{"ok":true,"live":true,"smtpPassSet":false,...}`
- New app, ready: `"smtpPassSet":true`

A working send also returns an `id` field. The current live response is only `{"success":true,"message":"Contact form submitted successfully"}` with no `id`.

### Fix

1. In the **Next.js project Hostinger deploys** (the v0 app with `app/` and `components/`), replace `app/api/contact/route.ts` with the file from this repo.
2. In that same project: `npm install nodemailer`
3. hPanel → the cryptosolutionagency.com **Node.js** app → **Environment variables**:

   - `EMAIL_FROM=Crypto Solution Agency <support@cryptosolutionagency.com>`
   - `EMAIL_TO=support@cryptosolutionagency.com`
   - `SMTP_HOST=smtp.hostinger.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=support@cryptosolutionagency.com`
   - `SMTP_PASS=` (mailbox password)

4. **Save**, then **Restart** / **Rebuild** / **Redeploy** that Node app. Uploading `.env` by FTP is not enough unless Hostinger is told to use it.
5. Reload `/api/contact/` until `smtpPassSet` is `true`, then submit **Get in Touch** again.
6. Check the support inbox and spam.

## Tests

```bash
npm test
```
