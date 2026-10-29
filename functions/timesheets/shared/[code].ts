// functions/timesheets/shared/[code].ts
interface Env {
  DB: D1Database;
  TSWEEK_GUEST_SECRET?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const code = params.code as string;

  if (!env.DB) {
    return new Response("Database not configured", { status: 500 });
  }

  const row = await env.DB.prepare(
    "SELECT data, expires_at, password_required FROM shares WHERE code = ?"
  ).bind(code).first<{ data: string; expires_at: string | null; password_required: number }>();

  if (!row) {
    return new Response("Share not found", { status: 404 });
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return new Response("This share link has expired", { status: 410 });
  }

  const url = new URL(request.url);
  const provided = url.searchParams.get("p") || "";

  if (row.password_required) {
    if (provided !== env.TSWEEK_GUEST_SECRET) {
      return new Response(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Password required</title>
<style>
  body{background:#07090d;color:#f0f3f6;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  form{background:#161b22;padding:32px;border-radius:12px;border:1px solid #2a3038}
  input{background:#0d1117;border:1px solid #2a3038;color:#fff;padding:10px;border-radius:6px;width:200px}
  button{background:#5b9cf5;color:#fff;border:none;padding:10px 16px;border-radius:6px;margin-top:10px;width:100%;cursor:pointer}
</style></head>
<body>
  <form method="GET">
    <h3 style="margin:0 0 12px">Password required</h3>
    <input type="password" name="p" placeholder="Password" autofocus required>
    <button type="submit">View</button>
  </form>
</body></html>`, { headers: { "Content-Type": "text/html" } });
    }
  }

  const data = JSON.parse(row.data);
  const weeks = data.weeks || [];
  const standard = data.standard || 38;

  const rows = weeks.map((w: any) => `
    <tr>
      <td>${w.week || ""}</td>
      <td>${w.ending || ""}</td>
      <td>${w.hours != null ? Number(w.hours).toFixed(2) : "—"}</td>
      <td>${w.variance != null ? (w.variance >= 0 ? "+" : "") + Number(w.variance).toFixed(2) : "—"}</td>
      <td>${w.url ? `<a href="${w.url}" target="_blank" rel="noopener">Open</a>` : "—"}</td>
    </tr>`).join("");

  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shared Timesheet — Daniel Clancy</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&family=Source+Sans+3:wght@600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;padding:32px 16px}
  .wrap{max-width:900px;margin:0 auto}
  h1{font-family:"Source Sans 3",sans-serif;font-size:1.6rem;margin-bottom:4px}
  .sub{color:#8b949e;margin-bottom:20px;font-size:0.9rem}
  table{width:100%;border-collapse:collapse;background:#161b22;border-radius:10px;overflow:hidden}
  th{background:#1a1f26;text-align:left;padding:12px 14px;font-size:0.75rem;text-transform:uppercase;color:#8b949e}
  td{padding:10px 14px;border-top:1px solid #2a3038}
  a{color:#5b9cf5}
  .note{margin-top:16px;font-size:0.8rem;color:#7d8590;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <h1>Global Timesheet Ledger</h1>
  <div class="sub">Daniel Clancy · Architectural Technician · Greg Natale Design<br>Standard week: ${standard} hrs · Read-only shared view</div>
  <table>
    <thead><tr><th>Week</th><th>Ending</th><th>Hours</th><th>Variance</th><th>Timesheet</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="note">Shared timesheet · View only</div>
</div>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
};
