import assert from "node:assert/strict";
import { test } from "node:test";
import { handleContactPost } from "./contact-api.ts";

test("handleContactPost rejects invalid JSON", async () => {
  const response = await handleContactPost(
    new Request("http://localhost/api/contact", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    }),
  );
  assert.equal(response.status, 400);
  const json = (await response.json()) as { success: boolean };
  assert.equal(json.success, false);
});

test("handleContactPost rejects missing fields", async () => {
  const response = await handleContactPost(
    new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Ada" }),
      headers: { "Content-Type": "application/json" },
    }),
  );
  assert.equal(response.status, 400);
  const json = (await response.json()) as { success: boolean; error: string };
  assert.equal(json.success, false);
  assert.match(json.error, /required/);
});
