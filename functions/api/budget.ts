// functions/api/budget.ts
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
    CREATE TABLE IF NOT EXISTS budget_data (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT data, updated_at FROM budget_data WHERE id = 1"
    ).first<{ data: string; updated_at: string }>();

    if (!row) {
      return new Response(JSON.stringify({ data: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      data: JSON.parse(row.data),
      updated_at: row.updated_at
    }), { headers: { "Content-Type": "application/json" } });
  }

  if (request.method === "POST") {
    const body = await request.json();
    const json = JSON.stringify(body);
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO budget_data (id, data, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).bind(json, now).run();

    return new Response(JSON.stringify({ ok: true, updated_at: now }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
