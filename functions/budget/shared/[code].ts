// functions/budget/shared/[code].ts
interface Env {
  DB: D1Database;
  BUDGET_GUEST_SECRET?: string;
}

const CATEGORIES: Record<string, { label: string; keywords: string[]; icon: string }> = {
  housing: { label: "Housing", keywords: ["rent", "mortgage", "strata", "rates"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' },
  transport: { label: "Transport", keywords: ["opal", "uber", "petrol", "fuel", "train", "bus", "transport", "parking"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/></svg>' },
  groceries: { label: "Groceries", keywords: ["groceries", "supermarket"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' },
  dining: { label: "Dining", keywords: ["restaurant", "dinner"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>' },
  coffee: { label: "Coffee", keywords: ["coffee", "cafe"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>' },
  power: { label: "Power", keywords: ["energy", "electricity", "power"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  water: { label: "Water", keywords: ["water"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
  internet: { label: "Internet", keywords: ["internet", "wifi", "nbn"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>' },
  phone: { label: "Phone", keywords: ["phone", "mobile", "recharge"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3" stroke-linecap="round"/><rect x="9" y="4" width="6" height="1.5" rx="0.5" fill="currentColor" stroke="none"/></svg>' },
  health: { label: "Health", keywords: ["medication", "pharmacy", "doctor", "health"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>' },
  apple: { label: "Apple", keywords: ["apple", "icloud"], icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>' },
  microsoft: { label: "Microsoft", keywords: ["microsoft", "office"], icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>' },
  google: { label: "Google", keywords: ["google", "youtube"], icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>' },
  subscriptions: { label: "Subscriptions", keywords: ["netflix", "spotify", "disney"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
  leisure: { label: "Leisure", keywords: ["cinema", "movie", "game"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' },
  gambling: { label: "Gambling", keywords: ["bet", "gambling", "poker"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>' },
  retail: { label: "Retail", keywords: ["clothes", "shopping", "amazon"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
  cigarettes: { label: "Cigarettes", keywords: ["cigarettes", "tobacco", "smokes"], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 12H2v4h16"/><path d="M22 12v4"/><path d="M7 12v4"/><path d="M18 8c0-2.5-2-2.5-2-5"/><path d="M22 8c0-2.5-2-2.5-2-5"/></svg>' },
  other: { label: "Other", keywords: [], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' }
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

  /* Slim dark scrollbars — all contexts */
  * {
    scrollbar-width: thin;
    scrollbar-color: #2a3038 #0d1117;
  }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: #0d1117; }
  *::-webkit-scrollbar-thumb { background: #2a3038; border-radius: 3px; }
  *::-webkit-scrollbar-thumb:hover { background: #3a414b; }
  *::-webkit-scrollbar-corner { background: #0d1117; }

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
  const phone = data.phoneAllowance || 0;
  const expenses = data.expenses || [];
  const savings = data.savings || 0;

  const DAYS: Record<string, number> = { day: 1, week: 7, "2week": 14, "4week": 28, month: 365 / 12, year: 365 };
  const toDaily = (amt: number, freq: string) => amt / (DAYS[freq] || 1);
  const project = (daily: number, freq: string) => daily * (DAYS[freq] || 1);

  let totalDaily = 0;
  expenses.forEach((e: any) => { totalDaily += toDaily(Number(e.amount) || 0, e.frequency); });
  const savingsDaily = toDaily(Number(savings) || 0, "month");
  const incomeDaily = toDaily(Number(income) || 0, "month");
  const spendableDaily = incomeDaily + toDaily(phone, "month");
  const leftoverDaily = spendableDaily - totalDaily - savingsDaily;
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

  /* Slim dark scrollbars — all contexts */
  * {
    scrollbar-width: thin;
    scrollbar-color: #2a3038 #0d1117;
  }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: #0d1117; }
  *::-webkit-scrollbar-thumb { background: #2a3038; border-radius: 3px; }
  *::-webkit-scrollbar-thumb:hover { background: #3a414b; }
  *::-webkit-scrollbar-corner { background: #0d1117; }

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
    <div class="slim-card"><span class="lbl">Phone</span><span class="val">$${Number(phone).toFixed(2)}</span></div>
  </div>
</header>
<div class="wrap">
  <div class="cards">
    <div class="card"><div class="label">Spendable / month</div><div class="value">$${(Number(income) + Number(phone)).toFixed(2)}</div></div>
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
