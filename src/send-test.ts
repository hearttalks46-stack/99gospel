import { BUSINESS_EMAIL, sendEmail } from "./email.js";

const result = await sendEmail({
  to: BUSINESS_EMAIL,
  subject: "99 Gospel SMTP test",
  text: "If you received this, support@cryptosolutionagency.com SMTP is working.",
  html: "<p>If you received this, <strong>support@cryptosolutionagency.com</strong> SMTP is working.</p>",
});

console.log(`Sent to ${BUSINESS_EMAIL}: ${result.id}`);
