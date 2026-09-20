import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BUSINESS_EMAIL,
  DEFAULT_FROM,
  EmailConfigError,
  EmailSendError,
  createSmtpSender,
  formatContactEmail,
  sendContactEmail,
  sendEmail,
  type SendEmailInput,
} from "./email.ts";

test("sendEmail uses the injected sender", async () => {
  const sent: SendEmailInput[] = [];
  const result = await sendEmail(
    {
      to: BUSINESS_EMAIL,
      subject: "Hello",
      html: "<p>Hi</p>",
    },
    async (input) => {
      sent.push(input);
      return { id: "email_123" };
    },
  );

  assert.equal(result.id, "email_123");
  assert.equal(sent.length, 1);
  assert.equal(sent[0]?.to, BUSINESS_EMAIL);
});

test("sendEmail rejects empty content", async () => {
  await assert.rejects(
    () =>
      sendEmail(
        { to: BUSINESS_EMAIL, subject: "x", html: "   " },
        async () => ({ id: "nope" }),
      ),
    EmailSendError,
  );
});

test("createSmtpSender maps SMTP errors", async () => {
  const sender = createSmtpSender({
    user: BUSINESS_EMAIL,
    pass: "secret",
    transporter: {
      sendMail: async () => {
        throw new Error("Invalid login");
      },
    },
  });

  await assert.rejects(
    () => sender({ to: BUSINESS_EMAIL, subject: "Hi", html: "<p>Hi</p>" }),
    (error: unknown) => {
      assert.ok(error instanceof EmailSendError);
      assert.match(error.message, /Invalid login/);
      return true;
    },
  );
});

test("createSmtpSender requires mailbox password", () => {
  assert.throws(
    () =>
      createSmtpSender({
        user: BUSINESS_EMAIL,
        pass: "  ",
      }),
    EmailConfigError,
  );
});

test("createSmtpSender sends from the business mailbox", async () => {
  let from = "";
  const sender = createSmtpSender({
    user: BUSINESS_EMAIL,
    pass: "secret",
    transporter: {
      sendMail: async (payload) => {
        from = payload.from;
        return { messageId: "<smtp-id>" };
      },
    },
  });

  const result = await sender({
    to: BUSINESS_EMAIL,
    subject: "Hi",
    html: "<p>Hi</p>",
  });
  assert.equal(result.id, "<smtp-id>");
  assert.equal(from, DEFAULT_FROM);
});

test("formatContactEmail delivers to the business inbox", () => {
  delete process.env.EMAIL_TO;
  const content = formatContactEmail({
    name: "Ada",
    email: "ada@example.com",
    message: "Hello <world>",
  });

  assert.equal(content.to, BUSINESS_EMAIL);
  assert.equal(content.replyTo, "ada@example.com");
  assert.match(content.html, /Hello &lt;world&gt;/);
});

test("sendContactEmail sends formatted content", async () => {
  const result = await sendContactEmail(
    { name: "Ada", email: "ada@example.com", message: "Hello" },
    async () => ({ id: "contact_1" }),
  );
  assert.equal(result.id, "contact_1");
});
