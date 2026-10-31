// functions/budget/shared/[code].ts
interface Env {
  DB: D1Database;
  BUDGET_GUEST_SECRET?: string;
}

const CATEGORIES: Record<string, { label: string; keywords: string[]; icon: string }> = {
  housing: { label: "Housing", keywords: ["rent", "mortgage", "strata", "rates"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  transport: { label: "Transport", keywords: ["opal", "uber", "petrol", "fuel", "train", "bus", "transport", "parking"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' },
  food: { label: "Food", keywords: ["coffee", "lunch", "groceries", "food", "restaurant", "takeaway", "meal"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>' },
  utilities: { label: "Utilities", keywords: ["energy", "electricity", "water", "gas", "internet", "wifi"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  phone: { label: "Phone", keywords: ["phone", "mobile", "recharge"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>' },
  health: { label: "Health", keywords: ["medication", "pharmacy", "doctor", "health", "medical"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  subscriptions: { label: "Subscriptions", keywords: ["microsoft", "google", "apple", "netflix", "spotify", "subscription"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
  vice: { label: "Vice", keywords: ["cigarettes", "tobacco", "alcohol", "beer", "wine"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' },
  other: { label: "Other", keywords: [], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' }
};

function detectCategory(name: string, override?: string) {
  if (override && CATEGORIES[override]) return CATEGORIES[override];
  const n = (name || "").toLowerCase().trim();
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (key === "other") continue;
    if (cat.keywords.some(kw => n.includes(kw))) return cat;
  }
  return CATEGORIES.other;
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
  const gross = data.grossSalary || 90000;
  const expenses = data.expenses || [];
  const savings = data.savings || 0;

  const DAYS: Record<string, number> = { day: 1, week: 7, "2week": 14, "4week": 28, month: 365 / 12, year: 365 };
  const toDaily = (amt: number, freq: string) => amt / (DAYS[freq] || 1);
  const project = (daily: number, freq: string) => daily * (DAYS[freq] || 1);

  let totalDaily = 0;
  expenses.forEach((e: any) => { totalDaily += toDaily(Number(e.amount) || 0, e.frequency); });
  const savingsDaily = toDaily(Number(savings) || 0, "month");
  const incomeDaily = toDaily(Number(income) || 0, "month");
  const leftoverDaily = incomeDaily - totalDaily - savingsDaily;
  const leftoverMonth = project(leftoverDaily, "month");

  const rows = expenses.map((e: any) => {
    const daily = toDaily(Number(e.amount) || 0, e.frequency);
    const cat = detectCategory(e.name, e.categoryOverride);
    return `<tr>
      <td><div class="icon">${cat.icon}</div></td>
      <td>${e.name || ""}</td>
      <td class="cat">${cat.label}</td>
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
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;500;600&family=Source+Sans+3:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;padding:0}
  header{position:sticky;top:0;z-index:200;background:rgba(16,21,28,0.96);backdrop-filter:blur(16px);border-bottom:1px solid #2a3038;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
  header.slim{padding:8px 24px}
  .brand{display:flex;align-items:center;gap:12px}
  .logo{width:40px;height:40px;border-radius:8px;overflow:hidden}
  .logo img{width:100%;height:100%;object-fit:cover}
  .identity h1{font-family:"Source Sans 3",sans-serif;font-size:1.2rem;font-weight:800;margin:0}
  .identity .role{color:#5b9cf5;font-size:0.8rem}
  .slim-cards{display:flex;gap:10px}
  .slim-card{background:rgba(13,17,23,0.8);border:1px solid #2a3038;border-radius:8px;padding:4px 12px;display:flex;align-items:center;gap:6px}
  .slim-card.gross{border-color:rgba(63,185,80,0.4)}
  .slim-card .lbl{font-size:0.65rem;color:#7d8590;text-transform:uppercase}
  .slim-card .val{font-family:"Source Sans 3",sans-serif;font-size:0.95rem;font-weight:650}
  .slim-card.gross .val{color:#3fb950}
  .wrap{max-width:1100px;margin:0 auto;padding:20px 16px}
  .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .card{background:#161b22;border:1px solid #2a3038;border-radius:10px;padding:14px}
  .card .label{font-size:0.7rem;color:#7d8590;text-transform:uppercase}
  .card .value{font-family:"Source Sans 3",sans-serif;font-size:1.3rem;font-weight:650;margin-top:4px}
  .card .value.green{color:#3fb950}
  table{width:100%;border-collapse:collapse;background:#161b22;border-radius:10px;overflow:hidden}
  th{background:#1a1f26;text-align:left;padding:10px 12px;font-size:0.72rem;text-transform:uppercase;color:#8b949e}
  td{padding:10px 12px;border-top:1px solid #2a3038}
  .icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#1a1f26}
  .icon svg{stroke:#b0b8c4}
  .cat{font-size:0.8rem;color:#7d8590;text-transform:capitalize}
  .note{margin-top:16px;font-size:0.8rem;color:#7d8590;text-align:center}
  @media(max-width:720px){.cards{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<header id="hdr">
  <div class="brand">
    <div class="logo"><img src="https://raw.githubusercontent.com/BSMediaGroup/DanielClancy/refs/heads/main/assets/logos/logomatteblue.webp" alt="DC"></div>
    <div class="identity">
      <h1>Daniel Clancy</h1>
      <div class="role">Budget</div>
    </div>
  </div>
  <div class="slim-cards">
    <div class="slim-card gross"><span class="lbl">Gross</span><span class="val">$${Number(gross).toLocaleString()}</span></div>
    <div class="slim-card"><span class="lbl">Net</span><span class="val">$${Number(income).toFixed(2)}</span></div>
  </div>
</header>
<div class="wrap">
  <div class="cards">
    <div class="card"><div class="label">Net income / month</div><div class="value">$${Number(income).toFixed(2)}</div></div>
    <div class="card"><div class="label">Total expenses / month</div><div class="value">$${project(totalDaily, "month").toFixed(2)}</div></div>
    <div class="card"><div class="label">Savings / month</div><div class="value">$${Number(savings).toFixed(2)}</div></div>
    <div class="card"><div class="label">Leftover / month</div><div class="value green">$${leftoverMonth.toFixed(2)}</div></div>
  </div>
  <table>
    <thead><tr><th></th><th>Expense</th><th>Category</th><th>Frequency</th><th>Amount</th><th>Day</th><th>Week</th><th>Month</th><th>Year</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="note">Shared budget · View only</div>
</div>
<script>
window.addEventListener("scroll", () => {
  document.getElementById("hdr").classList.toggle("slim", window.scrollY > 40);
}, { passive: true });
</script>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
};
