import { EmailConfigError, EmailSendError, sendContactEmail } from "./email.js";

export async function handleContactPost(request: Request): Promise<Response> {
  let body: { name?: unknown; email?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  try {
    const result = await sendContactEmail({ name, email, message });
    return Response.json({
      success: true,
      id: result.id,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    if (error instanceof EmailSendError || error instanceof EmailConfigError) {
      const status = error instanceof EmailConfigError ? 500 : 400;
      return Response.json({ success: false, error: error.message }, { status });
    }
    console.error("contact form send failed", error);
    return Response.json(
      { success: false, error: "Could not send email" },
      { status: 500 },
    );
  }
}
