// functions/api/timesheet.ts
// Cloudflare Pages Function — GET/POST timesheet JSON from D1

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

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const cookie = request.headers.get("Cookie") || "";
  const token = env.TSWEEK_PASSWORD ? await signAuth(env.TSWEEK_PASSWORD) : "";
  if (!token || !sameToken(readCookie(cookie, "tsweek_auth"), token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database not bound" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Ensure table exists
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS timesheet_data (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT data, updated_at FROM timesheet_data WHERE id = 1"
    ).first<{ data: string; updated_at: string }>();

    if (!row) {
      return new Response(JSON.stringify({ data: null }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      data: JSON.parse(row.data),
      updated_at: row.updated_at,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "POST") {
    let body: any;
    try { body = await request.json(); }
    catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!body || typeof body !== "object" || !Array.isArray(body.weeks)) {
      return new Response(JSON.stringify({ error: "Weeks required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const json = JSON.stringify(body);
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO timesheet_data (id, data, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).bind(json, now).run();

    return new Response(JSON.stringify({ ok: true, updated_at: now }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
