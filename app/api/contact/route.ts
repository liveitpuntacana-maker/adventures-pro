import { NextResponse } from "next/server";
import { oneLine } from "@/lib/emailSafe";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const CONTACT_RECIPIENTS = ["info@afdmctravel.com", "reservations@adventuresfinder.com"];

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  botField?: string;
};

type ContactData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildMailContent(contact: ContactData) {
  const submittedAt = new Date().toISOString();
  const safeName = escapeHtml(contact.name);
  const safeEmail = escapeHtml(contact.email);
  const safeSubject = escapeHtml(contact.subject);
  const safeMessage = escapeHtml(contact.message).replace(/\n/g, "<br />");

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <p><strong>Message:</strong><br />${safeMessage}</p>
    <p><strong>Source:</strong> Contact Page</p>
    <p><strong>Submitted At:</strong> ${submittedAt}</p>
  `;

  const text = [
    "New Contact Form Submission",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Subject: ${contact.subject}`,
    `Message: ${contact.message}`,
    "Source: Contact Page",
    `Submitted At: ${submittedAt}`,
  ].join("\n");

  return {
    subject: `Contact: ${contact.subject}`,
    html,
    text,
  };
}

// Five messages per ten minutes per address, same ceiling as the lead form.
const MESSAGES_PER_WINDOW = 5;
const MESSAGE_WINDOW_MS = 10 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit({
    key: `contact:${clientIp(request)}`,
    limit: MESSAGES_PER_WINDOW,
    windowMs: MESSAGE_WINDOW_MS,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const body = (await request.json()) as ContactPayload;

    if (String(body.botField ?? "").trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const contact: ContactData = {
      name: oneLine(String(body.name ?? ""), 120),
      email: oneLine(String(body.email ?? ""), 254),
      // The subject goes into a mail header: no line breaks, bounded length.
      subject: oneLine(String(body.subject ?? ""), 200),
      message: String(body.message ?? "").trim().slice(0, 5000),
    };

    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
      return NextResponse.json({ error: "Invalid contact payload." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;

    if (!apiKey || !from) {
      return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
    }

    const content = buildMailContent(contact);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: CONTACT_RECIPIENTS,
        reply_to: contact.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
