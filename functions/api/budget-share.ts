// functions/api/budget-share.ts
interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const cookie = request.headers.get("Cookie") || "";
  if (!cookie.includes("budget_auth=1")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 not bound" }), { status: 500 });
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS budget_shares (
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Invalid budget" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const code = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => alphabet[b % 36]).join("");

    let expires: string | null = null;
    const now = Date.now();
    if (body.expiry === "24h") expires = new Date(now + 24 * 3600 * 1000).toISOString();
    else if (body.expiry === "48h") expires = new Date(now + 48 * 3600 * 1000).toISOString();
    else if (body.expiry === "7d") expires = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
    else if (body.expiry === "30d") expires = new Date(now + 30 * 24 * 3600 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO budget_shares (code, data, expires_at, password_required, created_at)
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
