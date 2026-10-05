import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { escapeHtml, oneLine } from "@/lib/emailSafe";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const LEAD_RECIPIENTS = ["info@afdmctravel.com", "reservations@adventuresfinder.com"];


type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  travelDates?: string;
  guests?: number;
  tripType?: string;
  travelFrequency?: string;
  botField?: string;
};

type LeadData = {
  name: string;
  email: string;
  phone: string;
  travelDates: string;
  guests: number;
  tripType: string;
  travelFrequency: string;
};

function buildMailContent(lead: LeadData) {
  const submittedAt = new Date().toISOString();
  const safe = {
    name: escapeHtml(lead.name),
    email: escapeHtml(lead.email),
    phone: escapeHtml(lead.phone),
    travelDates: escapeHtml(lead.travelDates),
    tripType: escapeHtml(lead.tripType),
    travelFrequency: escapeHtml(lead.travelFrequency),
  };
  const mailBody = {
    lead,
    source: "Home Lead Form",
    submittedAt,
  };

  const text = JSON.stringify(mailBody, null, 2);
  const html = `
    <h2>New Lead Submission</h2>
    <p><strong>Name:</strong> ${safe.name}</p>
    <p><strong>Email:</strong> ${safe.email}</p>
    <p><strong>Phone:</strong> ${safe.phone}</p>
    <p><strong>Travel Dates:</strong> ${safe.travelDates}</p>
    <p><strong>Guests:</strong> ${lead.guests}</p>
    <p><strong>Trip Type:</strong> ${safe.tripType}</p>
    <p><strong>Frequency of travel to Punta Cana:</strong> ${safe.travelFrequency}</p>
    <p><strong>Source:</strong> Home Lead Form</p>
    <p><strong>Submitted At:</strong> ${submittedAt}</p>
  `;

  return {
    subject: `New lead: ${oneLine(lead.name, 120)}`,
    text,
    html,
  };
}

async function sendWithResend(lead: LeadData, from: string, content: ReturnType<typeof buildMailContent>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: LEAD_RECIPIENTS,
      reply_to: lead.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }),
  });

  if (!response.ok) {
    throw new Error("Resend request failed");
  }

  return true;
}

async function sendWithSmtp(lead: LeadData, from: string, content: ReturnType<typeof buildMailContent>) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return false;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: LEAD_RECIPIENTS,
    replyTo: lead.email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return true;
}

// Five submissions per ten minutes per address: a person filling in the form
// twice by mistake gets through, a script posting in a loop does not.
const LEADS_PER_WINDOW = 5;
const LEAD_WINDOW_MS = 10 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit({
    key: `send-lead:${clientIp(request)}`,
    limit: LEADS_PER_WINDOW,
    windowMs: LEAD_WINDOW_MS,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const body = (await request.json()) as LeadPayload;

    if (String(body.botField ?? "").trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const lead: LeadData = {
      name: oneLine(String(body.name ?? ""), 120),
      email: oneLine(String(body.email ?? ""), 254),
      phone: oneLine(String(body.phone ?? ""), 40),
      travelDates: oneLine(String(body.travelDates ?? ""), 120),
      guests: Math.min(Number(body.guests), 500),
      tripType: oneLine(String(body.tripType ?? ""), 80),
      travelFrequency: oneLine(String(body.travelFrequency ?? ""), 80),
    };

    if (
      !lead.name ||
      !lead.email ||
      !lead.phone ||
      !lead.travelDates ||
      !Number.isFinite(lead.guests) ||
      lead.guests <= 0 ||
      !lead.tripType ||
      !lead.travelFrequency
    ) {
      return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
    }

    const from =
      process.env.RESEND_FROM ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      "Adventures Finder <noreply@adventuresfinder.com>";

    const content = buildMailContent(lead);
    const sentWithResend = await sendWithResend(lead, from, content);

    if (!sentWithResend) {
      const sentWithSmtp = await sendWithSmtp(lead, from, content);
      if (!sentWithSmtp) {
        return NextResponse.json({ error: "Unable to send lead." }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send lead." }, { status: 500 });
  }
}
