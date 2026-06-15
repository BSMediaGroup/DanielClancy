import { postDanielClancyAlert } from "../_shared/alert-sender.js";
import { verifyTurnstileToken } from "../_shared/turnstile.js";

const RESEND_API_URL = "https://api.resend.com/emails";
const DESTINATION_EMAIL = "mail@danielclancy.net";
const SITE_LABEL = "DanielClancy.net";
const CONTACT_UNAVAILABLE_MESSAGE =
  "Message delivery is temporarily unavailable. Please email mail@danielclancy.net directly if this continues.";
const CONTACT_INVALID_MESSAGE = "Please check the form and try again.";

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function sanitize(value, maxLength = 3000) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeEnv(value, maxLength = 400) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function normalizeEnvValue(value, maxLength = 400) {
  const trimmed = sanitizeEnv(value, maxLength);

  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];

    if ((first === `"` && last === `"`) || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1).trim();
    }
  }

  return trimmed;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isResendSender(value) {
  if (isEmail(value)) {
    return true;
  }

  const match = /^(.+?)\s*<([^<>]+)>$/.exec(value);
  return Boolean(match?.[1]?.trim() && match?.[2] && isEmail(match[2].trim()));
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

function methodNotAllowed() {
  return json({ message: "Method not allowed.", code: "METHOD_NOT_ALLOWED" }, 405, {
    Allow: "POST, OPTIONS",
  });
}

export const onRequestGet = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;

function getEnvValue(env, names, maxLength = 300) {
  for (const name of names) {
    const value = normalizeEnvValue(env?.[name], maxLength);

    if (value) {
      return value;
    }
  }

  return "";
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildFieldLines(fields) {
  return Object.entries(fields).map(([label, value]) => `${label}: ${value || "Not provided"}`);
}

function buildHtmlBody(lines) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111827;">
${lines
  .map((line) => (line ? `<p style="margin:0 0 10px;">${htmlEscape(line)}</p>` : "<br>"))
  .join("\n")}
</div>`;
}

export async function onRequestPost(context) {
  let payload;

  try {
    payload = await context.request.json();
  } catch (_error) {
    return json({ message: CONTACT_INVALID_MESSAGE, code: "INVALID_INPUT" }, 400);
  }

  const name = sanitize(payload.name, 120);
  const email = sanitize(payload.email, 160);
  const company = sanitize(payload.company, 160);
  const subject = sanitize(payload.subject, 180);
  const reason = sanitize(payload.reason || payload.service || payload.topic, 180);
  const phone = sanitize(payload.phone, 80);
  const projectType = sanitize(payload.projectType || payload.project_type, 160);
  const budget = sanitize(payload.budget, 120);
  const timeline = sanitize(payload.timeline, 120);
  const sourcePage = sanitize(payload.sourcePath || payload.sourcePage || payload.source || payload.page, 500);
  const message = sanitize(payload.message, 4000);
  const website = sanitize(payload.website, 120);
  const turnstileToken = sanitize(payload.turnstileToken || payload["cf-turnstile-response"], 3000);
  const startedAt = Number(payload.startedAt);
  const elapsedMs = Number.isFinite(startedAt) ? Date.now() - startedAt : 0;

  if (website) {
    return json({ message: "Thanks. Your message has been received." }, 200);
  }

  const turnstileResult = await verifyTurnstileToken({
    env: context.env,
    token: turnstileToken,
    remoteIp: context.request.headers.get("CF-Connecting-IP") || "",
  });
  if (!turnstileResult.ok) {
    return json({ message: turnstileResult.message, code: turnstileResult.code || "TURNSTILE_FAILED" }, 403);
  }

  if (!name || !email || !message) {
    return json({ message: "Name, email, and message are required.", code: "INVALID_INPUT" }, 400);
  }

  if (!isEmail(email)) {
    return json({ message: "Please provide a valid email address.", code: "INVALID_INPUT" }, 400);
  }

  if (message.length < 20) {
    return json({ message: "Please provide a little more detail in your message.", code: "INVALID_INPUT" }, 400);
  }

  if (elapsedMs > 0 && elapsedMs < 2500) {
    return json({ message: "Please wait a moment before sending the form.", code: "INVALID_INPUT" }, 429);
  }

  const apiKey = normalizeEnvValue(context.env?.RESEND_API_KEY, 200);
  const mailFrom = normalizeEnvValue(context.env?.MAIL_FROM, 200);
  const destinationEmail =
    getEnvValue(context.env, ["CONTACT_MAIL_TO", "MAIL_TO", "MAIL_REPLY_TO"], 200) ||
    DESTINATION_EMAIL;

  if (!apiKey || !mailFrom || !isResendSender(mailFrom) || !destinationEmail || !isEmail(destinationEmail)) {
    console.error(
      JSON.stringify({
        event: "contact_config_missing",
        hasResendApiKey: Boolean(apiKey),
        hasMailFrom: Boolean(mailFrom),
        validMailFrom: Boolean(mailFrom && isResendSender(mailFrom)),
        hasDestinationEmail: Boolean(destinationEmail),
        validDestinationEmail: Boolean(destinationEmail && isEmail(destinationEmail)),
      }),
    );
    return json({ message: CONTACT_UNAVAILABLE_MESSAGE, code: "CONFIG_MISSING" }, 503);
  }

  const userAgent = sanitize(context.request.headers.get("User-Agent"), 400);
  const submittedAt = new Date().toISOString();
  const submittedFrom = sourcePage || new URL(context.request.url).pathname;
  const topic = subject || reason || "Website enquiry";

  const fieldLines = buildFieldLines({
    Name: name,
    Email: email,
    Phone: phone,
    Company: company,
    Subject: subject,
    Topic: reason,
    "Project type": projectType,
    Budget: budget,
    Timeline: timeline,
    "Source page": submittedFrom,
    "Submitted at": submittedAt,
    "User agent": userAgent || "Not provided",
  });

  const lines = [
    `${SITE_LABEL} contact form submission`,
    "",
    ...fieldLines,
    "",
    "Message:",
    message,
  ];

  try {
    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom,
        to: [destinationEmail],
        reply_to: email,
        subject: `${SITE_LABEL} contact form: ${topic}`,
        text: lines.join("\n"),
        html: buildHtmlBody(lines),
      }),
    });

    if (!resendResponse.ok) {
      console.error(
        JSON.stringify({
          event: "contact_resend_failure",
          status: resendResponse.status,
          submittedAt,
        }),
      );
      return json({ message: CONTACT_UNAVAILABLE_MESSAGE, code: "RESEND_REJECTED" }, 502);
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "contact_resend_exception",
        message: error instanceof Error ? error.message : "Unknown error",
        submittedAt,
      }),
    );
    return json({ message: CONTACT_UNAVAILABLE_MESSAGE, code: "SEND_FAILED" }, 502);
  }

  const alertResult = await postDanielClancyAlert(context, {
    triggerType: "contact_form",
    surface: "danielclancy.net",
    domain: "danielclancy.net",
    severity: "info",
    title: "New DanielClancy.net contact form submission",
    message: `Contact form submission from ${name || "Unknown"} for ${topic || "Website enquiry"}.`,
    tags: ["contact", "danielclancy"],
    linkUrl: "https://admin.danielclancy.net/#/alerts",
    pagePath: submittedFrom,
    payload: {
      name,
      email,
      company,
      topic,
      sourcePage: submittedFrom,
      submittedAt,
    },
  });
  if (!alertResult.ok && alertResult.configured) {
    console.error(JSON.stringify({ event: "contact_alert_delivery_failed", status: alertResult.status || 0, error: alertResult.error }));
  }

  return json({ message: "Thanks. Your message has been sent.", code: "SENT" }, 200);
}
