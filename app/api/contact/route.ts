import { NextResponse } from "next/server";
import {
  DEFAULT_BUSINESS_EMAIL,
  EmailConfigError,
  EmailValidationError,
  parseContactPayload,
  sendContactEmail,
  smtpPass,
} from "@/lib/email";

export async function GET() {
  return NextResponse.json({
    ok: true,
    live: true,
    smtpPassSet: Boolean(smtpPass()),
    mailbox: process.env.EMAIL_TO?.trim() || DEFAULT_BUSINESS_EMAIL,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (String(record.website ?? "").trim()) {
    return NextResponse.json({ success: true, message: "Thanks" });
  }

  try {
    const contact = parseContactPayload(body);
    const result = await sendContactEmail(contact);
    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Your details were sent to our business email.",
    });
  } catch (error) {
    if (error instanceof EmailValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    if (error instanceof EmailConfigError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    console.error("contact form send failed", error);
    return NextResponse.json(
      { success: false, error: "Could not send your details. Please try again." },
      { status: 500 },
    );
  }
}
