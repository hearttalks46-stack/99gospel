import { loadDotEnv } from "./load-env.js";
import { BUSINESS_EMAIL, sendEmail } from "./email.js";

const loaded = loadDotEnv();

const name = "SMTP test";
const email = "probe@cryptosolutionagency.com";
const message =
  "Manual SMTP test using the same Hostinger settings as the contact form. If you received this, SMTP works. The live site still needs this code deployed plus SMTP_PASS in hPanel.";

console.log("=== SMTP test (password hidden) ===");
console.log(`env files: ${loaded.join(" | ") || "(none)"}`);
console.log(`SMTP_HOST=${process.env.SMTP_HOST || "smtp.hostinger.com"}`);
console.log(`SMTP_PORT=${process.env.SMTP_PORT || "465"}`);
console.log(`SMTP_USER=${process.env.SMTP_USER || BUSINESS_EMAIL}`);
console.log(`EMAIL_FROM=${process.env.EMAIL_FROM || `Crypto Solution Agency <${BUSINESS_EMAIL}>`}`);
console.log(`EMAIL_TO=${process.env.EMAIL_TO || BUSINESS_EMAIL}`);
console.log(`SMTP_PASS set: ${Boolean(process.env.SMTP_PASS?.trim())}`);

const result = await sendEmail({
  to: process.env.EMAIL_TO?.trim() || BUSINESS_EMAIL,
  subject: `New Contact Form Inquiry from ${name}`,
  replyTo: email,
  text: `${name} <${email}>\n\n${message}`,
  html: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
  `,
});

console.log(`Sent to ${BUSINESS_EMAIL}: ${result.id}`);
console.log("Check the support inbox and spam folder.");
