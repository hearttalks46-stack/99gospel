# Send client info to your business email

This Next.js site collects client details on a contact form and emails them to your business inbox from a server route. The browser never talks to SMTP.

## How it works

1. The visitor submits name, email, optional phone/company, and a message.
2. `POST /api/contact` validates the fields on the server.
3. Nodemailer sends the email through your mailbox (Hostinger SMTP by default).
4. `to` is `EMAIL_TO` (your business email). `Reply-To` is the visitor, so you can answer from that inbox.

## Setup

```bash
cp .env.example .env
npm install
```

Edit `.env`:

- `EMAIL_TO` — the business inbox that should receive leads
- `SMTP_USER` / `SMTP_PASS` — the mailbox you send from (Hostinger: hPanel → Emails)
- Keep `SMTP_HOST=smtp.hostinger.com` and `SMTP_PORT=465` unless your host says otherwise

Never put `SMTP_PASS` in client components or commit `.env`.

```bash
npm run dev
```

Open http://localhost:3000, submit the form, then check the business inbox and spam folder.

`GET /api/contact` reports whether `SMTP_PASS` is set (`smtpPassSet`).

## Hostinger / production

Add the same variables in the Node.js app environment (hPanel), then restart/redeploy. A laptop `.env` file is not used by the live site.

## Tests

```bash
npm test
npm run lint
npm run build
```
