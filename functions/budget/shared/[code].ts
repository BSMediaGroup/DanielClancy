// functions/budget/shared/[code].ts
interface Env {
  DB: D1Database;
  BUDGET_GUEST_SECRET?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const code = params.code as string;

  if (!env.DB) return new Response("Database not configured", { status: 500 });

  const row = await env.DB.prepare(
    "SELECT data, expires_at, password_required FROM budget_shares WHERE code = ?"
  ).bind(code).first<{ data: string; expires_at: string | null; password_required: number }>();

  if (!row) return new Response("Share not found", { status: 404 });
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return new Response("This share link has expired", { status: 410 });
  }

  const url = new URL(request.url);
  const provided = url.searchParams.get("p") || "";

  if (row.password_required && provided !== env.BUDGET_GUEST_SECRET) {
    return new Response(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Password required</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&display=swap" rel="stylesheet">
<style>
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  form{background:#161b22;padding:32px;border-radius:12px;border:1px solid #2a3038;text-align:center}
  input{background:#0d1117;border:1px solid #2a3038;color:#fff;padding:10px 12px;border-radius:6px;width:220px;font-family:inherit}
  button{background:#5b9cf5;color:#fff;border:none;padding:10px 16px;border-radius:6px;margin-top:12px;width:100%;cursor:pointer;font-family:inherit;font-weight:600}
</style></head>
<body>
  <form method="GET">
    <h3>Password required</h3>
    <input type="password" name="p" placeholder="Password" autofocus required>
    <button type="submit">View</button>
  </form>
</body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const data = JSON.parse(row.data);
  const income = data.income || 0;
  const expenses = data.expenses || [];
  const savings = data.savings || 0;

  const DAYS = { day: 1, week: 7, "2week": 14, "4week": 28, month: 365 / 12, year: 365 };
  const toDaily = (amt: number, freq: string) => amt / (DAYS[freq as keyof typeof DAYS] || 1);
  const project = (daily: number, freq: string) => daily * (DAYS[freq as keyof typeof DAYS] || 1);

  let totalDaily = 0;
  expenses.forEach((e: any) => { totalDaily += toDaily(Number(e.amount) || 0, e.frequency); });
  const savingsDaily = toDaily(Number(savings) || 0, "month");
  const incomeDaily = toDaily(Number(income) || 0, "month");
  const leftoverDaily = incomeDaily - totalDaily - savingsDaily;
  const leftoverMonth = project(leftoverDaily, "month");

  const rows = expenses.map((e: any) => {
    const daily = toDaily(Number(e.amount) || 0, e.frequency);
    return `<tr>
      <td>${e.name || ""}</td>
      <td>${e.frequency}</td>
      <td>$${(Number(e.amount) || 0).toFixed(2)}</td>
      <td>$${project(daily, "day").toFixed(2)}</td>
      <td>$${project(daily, "week").toFixed(2)}</td>
      <td>$${project(daily, "month").toFixed(2)}</td>
      <td>$${project(daily, "year").toFixed(2)}</td>
    </tr>`;
  }).join("");

  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Budget — Daniel Clancy</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;500;600&family=Source+Sans+3:wght@600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;padding:28px 16px}
  .wrap{max-width:1000px;margin:0 auto}
  h1{font-family:"Source Sans 3",sans-serif;font-size:1.5rem;margin-bottom:4px}
  .sub{color:#8b949e;margin-bottom:20px;font-size:0.9rem}
  .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .card{background:#161b22;border:1px solid #2a3038;border-radius:10px;padding:14px}
  .card .label{font-size:0.7rem;color:#7d8590;text-transform:uppercase}
  .card .value{font-family:"Source Sans 3",sans-serif;font-size:1.3rem;font-weight:650;margin-top:4px}
  .card .value.green{color:#3fb950}
  table{width:100%;border-collapse:collapse;background:#161b22;border-radius:10px;overflow:hidden}
  th{background:#1a1f26;text-align:left;padding:10px 12px;font-size:0.72rem;text-transform:uppercase;color:#8b949e}
  td{padding:10px 12px;border-top:1px solid #2a3038}
  .note{margin-top:16px;font-size:0.8rem;color:#7d8590;text-align:center}
  @media(max-width:720px){.cards{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Budget</h1>
  <div class="sub">Daniel Clancy · Read-only shared view</div>
  <div class="cards">
    <div class="card"><div class="label">Net income / month</div><div class="value">$${Number(income).toFixed(2)}</div></div>
    <div class="card"><div class="label">Total expenses / month</div><div class="value">$${project(totalDaily, "month").toFixed(2)}</div></div>
    <div class="card"><div class="label">Savings / month</div><div class="value">$${Number(savings).toFixed(2)}</div></div>
    <div class="card"><div class="label">Leftover / month</div><div class="value green">$${leftoverMonth.toFixed(2)}</div></div>
  </div>
  <table>
    <thead><tr><th>Expense</th><th>Frequency</th><th>Amount</th><th>Day</th><th>Week</th><th>Month</th><th>Year</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="note">Shared budget · View only</div>
</div>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
};
