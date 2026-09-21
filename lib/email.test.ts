import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EmailValidationError,
  formatContactEmail,
  parseContactPayload,
  sendContactEmail,
} from "./email.ts";

test("parseContactPayload requires name, email, and message", () => {
  assert.throws(
    () => parseContactPayload({ name: "Ada" }),
    EmailValidationError,
  );
});

test("parseContactPayload rejects invalid email", () => {
  assert.throws(
    () =>
      parseContactPayload({
        name: "Ada",
        email: "not-an-email",
        message: "Hello",
      }),
    /valid email/,
  );
});

test("parseContactPayload trims fields and keeps optional client info", () => {
  const contact = parseContactPayload({
    name: "  Ada Lovelace  ",
    email: " ada@example.com ",
    phone: " 555-0100 ",
    company: " Analytical Engine ",
    message: " I need a quote. ",
  });

  assert.deepEqual(contact, {
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "555-0100",
    company: "Analytical Engine",
    message: "I need a quote.",
  });
});

test("formatContactEmail sends to the business inbox and replies to the client", () => {
  const mail = formatContactEmail(
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Analytical Engine",
      message: "Please call me.",
    },
    "support@business.com",
    "Business <support@business.com>",
  );

  assert.equal(mail.to, "support@business.com");
  assert.equal(mail.replyTo, "ada@example.com");
  assert.match(mail.subject, /Ada Lovelace/);
  assert.match(mail.text, /555-0100/);
  assert.match(mail.html, /Analytical Engine/);
  assert.doesNotMatch(mail.html, /<script>/);
});

test("sendContactEmail uses the injected transporter", async () => {
  const sent: unknown[] = [];
  const result = await sendContactEmail(
    {
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    },
    {
      sendMail: async (payload) => {
        sent.push(payload);
        return { messageId: "test-id" };
      },
    },
  );

  assert.equal(result.id, "test-id");
  assert.equal(sent.length, 1);
});
