import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EmailConfigError,
  EmailSendError,
  createResendSender,
  formatContactEmail,
  sendContactEmail,
  sendEmail,
  type SendEmailInput,
} from "./email.ts";

test("sendEmail uses the injected sender", async () => {
  const sent: SendEmailInput[] = [];
  const result = await sendEmail(
    {
      to: "inbox@example.com",
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
  assert.equal(sent[0]?.subject, "Hello");
});

test("sendEmail rejects empty content", async () => {
  await assert.rejects(
    () =>
      sendEmail(
        { to: "a@b.com", subject: "x", html: "   " },
        async () => ({ id: "nope" }),
      ),
    EmailSendError,
  );
});

test("createResendSender maps Resend errors", async () => {
  const sender = createResendSender({
    apiKey: "re_test",
    defaultFrom: "99 Gospel <noreply@example.com>",
    resend: {
      emails: {
        send: async () => ({ data: null, error: { message: "invalid from" } }),
      },
    },
  });

  await assert.rejects(
    () => sender({ to: "a@b.com", subject: "Hi", html: "<p>Hi</p>" }),
    (error: unknown) => {
      assert.ok(error instanceof EmailSendError);
      assert.match(error.message, /invalid from/);
      return true;
    },
  );
});

test("createResendSender requires API key", () => {
  assert.throws(
    () =>
      createResendSender({
        apiKey: "  ",
        defaultFrom: "noreply@example.com",
      }),
    EmailConfigError,
  );
});

test("formatContactEmail builds a reply-to message", () => {
  process.env.EMAIL_TO = "hello@example.com";
  const content = formatContactEmail({
    name: "Ada",
    email: "ada@example.com",
    message: "Hello <world>",
  });

  assert.equal(content.to, "hello@example.com");
  assert.equal(content.replyTo, "ada@example.com");
  assert.match(content.html, /Hello &lt;world&gt;/);
  assert.match(content.text ?? "", /Ada <ada@example.com>/);
});

test("sendContactEmail sends formatted content", async () => {
  process.env.EMAIL_TO = "hello@example.com";
  const result = await sendContactEmail(
    { name: "Ada", email: "ada@example.com", message: "Hello" },
    async () => ({ id: "contact_1" }),
  );
  assert.equal(result.id, "contact_1");
});
