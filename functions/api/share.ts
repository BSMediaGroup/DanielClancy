// functions/api/share.ts
interface Env {
  DB: D1Database;
  TSWEEK_PASSWORD?: string;
}

async function signAuth(secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("tsweek-auth-v1"));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function readCookie(header: string, name: string) {
  for (const part of header.split(/; */)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return "";
}
function sameToken(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
function shareCode() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = "";
  for (const b of bytes) out += alphabet[b % 36];
  return out;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const cookie = request.headers.get("Cookie") || "";
  const token = env.TSWEEK_PASSWORD ? await signAuth(env.TSWEEK_PASSWORD) : "";
  if (!token || !sameToken(readCookie(cookie, "tsweek_auth"), token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 not bound" }), { status: 500 });
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS shares (
      code TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at TEXT,
      password_required INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run();

  if (request.method === "POST") {
    let body: any;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
    if (!body || !Array.isArray(body.weeks)) {
      return new Response(JSON.stringify({ error: "Weeks required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const code = shareCode();

    let expires: string | null = null;
    const now = Date.now();
    if (body.expiry === "24h") expires = new Date(now + 24 * 3600 * 1000).toISOString();
    else if (body.expiry === "48h") expires = new Date(now + 48 * 3600 * 1000).toISOString();
    else if (body.expiry === "7d") expires = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
    else if (body.expiry === "30d") expires = new Date(now + 30 * 24 * 3600 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO shares (code, data, expires_at, password_required, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      code,
      JSON.stringify(body),
      expires,
      body.password ? 1 : 0,
      new Date().toISOString()
    ).run();

    return new Response(JSON.stringify({ code }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
