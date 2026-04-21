const RESEND_API_URL = "https://api.resend.com/emails";
const DESTINATION_EMAIL = "mail@danielclancy.net";
const CC_EMAIL = "daniel@brainstream.media";
const LOCAL_PREVIEW_MODE = "Local preview mode validated the form successfully. Delivery is ready for the deployed Pages Function.";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function sanitize(value, maxLength = 3000) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  let payload;

  try {
    payload = await context.request.json();
  } catch (_error) {
    return json({ message: "Invalid request payload." }, 400);
  }

  const name = sanitize(payload.name, 120);
  const email = sanitize(payload.email, 160);
  const company = sanitize(payload.company, 160);
  const subject = sanitize(payload.subject, 180);
  const message = sanitize(payload.message, 4000);
  const website = sanitize(payload.website, 120);
  const startedAt = Number(payload.startedAt);
  const elapsedMs = Number.isFinite(startedAt) ? Date.now() - startedAt : 0;

  if (website) {
    return json({ message: "Submission rejected." }, 400);
  }

  if (!name || !email || !message) {
    return json({ message: "Name, email, and message are required." }, 400);
  }

  if (!isEmail(email)) {
    return json({ message: "Please provide a valid email address." }, 400);
  }

  if (message.length < 20) {
    return json({ message: "Please provide a little more detail in your message." }, 400);
  }

  if (elapsedMs > 0 && elapsedMs < 2500) {
    return json({ message: "Please wait a moment before sending the form." }, 429);
  }

  const apiKey = sanitize(context.env?.RESEND_API_KEY, 200);
  const mailFrom = sanitize(context.env?.MAIL_FROM, 200);
  const mailReplyTo = sanitize(context.env?.MAIL_REPLY_TO, 200) || DESTINATION_EMAIL;

  if (!apiKey || !mailFrom) {
    return json({ message: LOCAL_PREVIEW_MODE, mode: "mock" }, 200);
  }

  const ip =
    context.request.headers.get("CF-Connecting-IP") ||
    context.request.headers.get("X-Forwarded-For") ||
    "Unknown";
  const userAgent = sanitize(context.request.headers.get("User-Agent"), 400);

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    `Subject: ${subject || "Website enquiry"}`,
    "",
    message,
    "",
    `IP: ${ip}`,
    `User agent: ${userAgent || "Not provided"}`,
  ];

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [DESTINATION_EMAIL],
      cc: [CC_EMAIL],
      reply_to: [mailReplyTo, email].filter(Boolean),
      subject: `[DanielClancy.net] ${subject || "Website enquiry"} - ${name}`,
      text: lines.join("\n"),
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return json(
      {
        message: "Message delivery failed. Please email mail@danielclancy.net directly if this continues.",
        detail: errorText.slice(0, 400),
      },
      502,
    );
  }

  return json({ message: "Message sent successfully." }, 200);
}
