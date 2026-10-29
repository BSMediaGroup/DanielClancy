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
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  form{background:#161b22;padding:32px;border-radius:12px;border:1px solid #2a3038;text-align:center}
  h3{font-weight:600;margin:0 0 14px}
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
  }

  const data = JSON.parse(row.data);
  const weeks = data.weeks || [];
  const standard = data.standard || 38;

  let total = 0, count = 0, net = 0;
  weeks.forEach((w: any) => {
    if (w.hours != null && w.hours !== "") {
      total += Number(w.hours);
      count++;
      net += Number(w.hours) - standard;
    }
  });
  const avg = count ? (total / count).toFixed(2) : "—";
  const netStr = (net >= 0 ? "+" : "") + net.toFixed(2);
  const netClass = net > 0.05 ? "positive" : net < -0.05 ? "negative" : "neutral";

  const rows = weeks.map((w: any) => {
    const hrs = w.hours != null ? Number(w.hours).toFixed(2) : "—";
    const vr = w.variance != null ? (w.variance >= 0 ? "+" : "") + Number(w.variance).toFixed(2) : "—";
    const link = w.url ? `<a href="${w.url}" target="_blank" rel="noopener">Open</a>` : "—";
    return `<tr><td>${w.week || ""}</td><td>${w.ending || ""}</td><td>${hrs}</td><td>${vr}</td><td>${link}</td></tr>`;
  }).join("");

  const weeksJson = JSON.stringify(weeks).replace(/</g, "\\u003c");

  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Global Timesheet Ledger — Daniel Clancy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;500;600&family=Source+Sans+3:wght@600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
  :root {
    --bg:#07090d; --bg-card:#161b22; --border:#2a3038; --text:#f0f3f6;
    --text-muted:#7d8590; --accent:#5b9cf5; --green:#3fb950; --red:#f85149;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:Blinker,sans-serif;padding:28px 16px;min-height:100vh}
  .container{max-width:1040px;margin:0 auto}
  header{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:22px 28px;margin-bottom:20px;display:flex;align-items:center;gap:14px}
  .logo{width:48px;height:48px;background:linear-gradient(135deg,#5b9cf5,#3d7dd4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0}
  .identity h1{font-family:"Source Sans 3",sans-serif;font-size:1.4rem;font-weight:800;margin:0;line-height:1.1}
  .identity .role{color:var(--accent);font-size:0.9rem}
  .identity .company{color:var(--text-muted);font-size:0.8rem}
  .page-title{font-family:"Source Sans 3",sans-serif;font-size:1.15rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#b0b8c4;margin:0 0 12px}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
  .stat{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px 16px}
  .stat .label{font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px}
  .stat .value{font-family:"Source Sans 3",sans-serif;font-size:1.45rem;font-weight:650;margin-top:2px}
  .stat .value.positive{color:var(--green)}
  .stat .value.negative{color:var(--red)}
  .stat .value.neutral{color:#b0b8c4}
  .actions{margin-bottom:16px}
  .btn{background:var(--bg-card);border:1px solid var(--border);color:#b0b8c4;padding:9px 16px;border-radius:8px;font-size:0.85rem;font-weight:500;cursor:pointer;font-family:Blinker,sans-serif}
  .btn:hover{background:#1c2129;color:var(--text)}
  .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
  .table-wrap{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
  table{width:100%;border-collapse:collapse}
  th{background:#1a1f26;text-align:left;padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)}
  td{padding:11px 16px;border-bottom:1px solid var(--border)}
  tr:last-child td{border-bottom:none}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
  footer{margin-top:24px;text-align:center;font-size:0.8rem;color:var(--text-muted)}
  @media(max-width:720px){.summary{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">DC</div>
    <div class="identity">
      <h1>Daniel Clancy</h1>
      <div class="role">Architectural Technician</div>
      <div class="company">Greg Natale Design</div>
    </div>
  </header>

  <div class="page-title">Global Timesheet Ledger</div>

  <div class="summary">
    <div class="stat"><div class="label">Weeks entered</div><div class="value">${count}</div></div>
    <div class="stat"><div class="label">Total hours</div><div class="value">${total.toFixed(2)}</div></div>
    <div class="stat"><div class="label">Average / week</div><div class="value">${avg}</div></div>
    <div class="stat"><div class="label">Net variance</div><div class="value ${netClass}">${netStr}</div></div>
  </div>

  <div class="actions">
    <button class="btn primary" onclick="exportPDF()">Export PDF</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead><tr><th>Week</th><th>Ending</th><th>Hours</th><th>Variance</th><th>Timesheet</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <footer>Read-only shared view · Standard week: ${standard} hrs</footer>
</div>

<script>
const WEEKS = ${weeksJson};
const STANDARD = ${standard};

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFillColor(16, 21, 28);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(240, 243, 246);
  doc.setFontSize(18);
  doc.text("Daniel Clancy", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(91, 156, 245);
  doc.text("Architectural Technician", 14, 23);
  doc.setTextColor(160, 170, 180);
  doc.text("Greg Natale Design  ·  Global Timesheet Ledger", 14, 29);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  let y = 50;
  doc.text("Standard week: ${standard} hrs  ·  Shared view", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text("Weeks entered: ${count}    Total hours: ${total.toFixed(2)}    Average: ${avg}    Net variance: ${netStr}", 14, y);
  y += 10;
  doc.setFillColor(26, 31, 38);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(240, 243, 246);
  doc.setFontSize(9);
  doc.text("Week", 16, y + 5);
  doc.text("Ending", 42, y + 5);
  doc.text("Hours", 72, y + 5);
  doc.text("Variance", 98, y + 5);
  doc.text("Timesheet", 130, y + 5);
  y += 12;
  doc.setTextColor(30, 30, 30);
  WEEKS.forEach(w => {
    if (y > 270) { doc.addPage(); y = 20; }
    const hrs = w.hours != null ? Number(w.hours).toFixed(2) : "—";
    const vr = w.variance != null ? (w.variance >= 0 ? "+" : "") + Number(w.variance).toFixed(2) : "—";
    doc.text(w.week || "", 16, y);
    doc.text(w.ending || "", 42, y);
    doc.text(hrs, 72, y);
    doc.text(vr, 98, y);
    if (w.url) {
      doc.setTextColor(91, 156, 245);
      doc.textWithLink("Open", 130, y, { url: w.url });
      doc.setTextColor(30, 30, 30);
    } else {
      doc.text("—", 130, y);
    }
    y += 7;
  });
  doc.save("timesheet-daniel-clancy-shared.pdf");
}
</script>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
};
