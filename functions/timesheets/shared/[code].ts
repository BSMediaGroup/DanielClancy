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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shared ledger</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&family=Source+Sans+3:wght@650;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{
    margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    color:#f4f7fb; font-family:Blinker,sans-serif;
    background:
      radial-gradient(900px 420px at 15% -10%, rgba(90,140,220,.2), transparent 60%),
      radial-gradient(700px 380px at 100% 0%, rgba(124,92,196,.12), transparent 55%),
      #07090d;
  }
  form{
    width:min(380px, 92vw); text-align:left; padding:28px 26px 24px;
    border-radius:18px; border:1px solid rgba(186,206,230,.16);
    background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.012) 40%, transparent), #121820;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 24px 60px rgba(0,0,0,.5);
  }
  .kicker{font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:#8b97a6; margin-bottom:8px}
  h3{font-family:"Source Sans 3",sans-serif; font-weight:750; font-size:1.35rem; margin:0 0 6px; letter-spacing:-.3px}
  p{margin:0 0 16px; color:#8b97a6; font-size:.9rem}
  input{background:#0c1016; border:1px solid rgba(176,196,220,.16); color:#f4f7fb; padding:12px 14px; border-radius:10px; width:100%; font-family:inherit; font-size:1rem}
  input:focus{outline:none; border-color:#7eb0ff; box-shadow:0 0 0 3px rgba(126,176,255,.22)}
  button{background:linear-gradient(180deg,#9ec2ff,#4f86ee); color:#fff; border:1px solid rgba(190,214,255,.7); padding:12px 16px; border-radius:10px; margin-top:14px; width:100%; cursor:pointer; font-family:inherit; font-weight:650; box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(79,134,238,.28)}
</style></head>
<body>
  <form method="GET">
    <div class="kicker">Daniel Clancy</div>
    <h3>Shared timesheet</h3>
    <p>This link is password protected.</p>
    <input type="password" name="p" placeholder="Password" autofocus required>
    <button type="submit">View ledger</button>
  </form>
</body></html>`, { headers: { "Content-Type": "text/html" } });
    }
  }

  const data = JSON.parse(row.data);
  const weeks = data.weeks || [];
  const tilEntries = data.tilEntries || [];
  const standard = data.standard || 38;

  const formatClock = (v: any) => {
    if (v == null || v === "" || isNaN(Number(v))) return "";
    let n = Number(v);
    const neg = n < 0;
    n = Math.abs(n);
    let hrs = Math.floor(n + 1e-9);
    let mins = Math.round((n - hrs) * 60);
    if (mins === 60) { hrs += 1; mins = 0; }
    return (neg ? "-" : "") + hrs + "hrs, " + mins + "min";
  };
  const clockParen = (v: any, signed = false) => {
    const c = formatClock(v);
    if (!c) return "";
    if (signed && Number(v) > 0) return "(+" + c + ")";
    return "(" + c + ")";
  };

  let total = 0, count = 0, net = 0;
  weeks.forEach((w: any) => {
    if (w.hours != null && w.hours !== "") {
      total += Number(w.hours);
      count++;
      net += Number(w.hours) - standard;
    }
  });
  const tilTotal = tilEntries.reduce((s: number, t: any) => s + (Number(t.hours) || 0), 0);
  const netAfter = net - tilTotal;
  const avgNum = count ? total / count : null;
  const avg = avgNum != null ? avgNum.toFixed(2) : "—";
  const netStr = (netAfter >= 0 ? "+" : "") + netAfter.toFixed(2);
  const netClass = netAfter > 0.05 ? "positive" : netAfter < -0.05 ? "negative" : "neutral";
  const grossStr = (net >= 0 ? "+" : "") + net.toFixed(2);

  const esc = (s: any) => String(s ?? "")
    .split("&").join("&" + "amp;")
    .split("<").join("&" + "lt;")
    .split(">").join("&" + "gt;")
    .split('"').join("&" + "quot;")
    .split("'").join("&" + "#39;");
  const avgPdf = avgNum != null ? avg + "hrs " + clockParen(avgNum) : "—";

  const rows = weeks.map((w: any) => {
    const hoursNum = w.hours != null && w.hours !== "" ? Number(w.hours) : null;
    const hrs = hoursNum != null ? hoursNum.toFixed(2) : "—";
    const hrsClock = hoursNum != null ? `<span class="unit">hrs</span> <span class="clock">${clockParen(hoursNum)}</span>` : "";
    const variance = w.variance != null && w.variance !== "" ? Number(w.variance) : (hoursNum != null ? +(hoursNum - standard).toFixed(2) : null);
    const vr = variance != null ? (variance >= 0 ? "+" : "") + variance.toFixed(2) : "—";
    const vrClock = variance != null ? `<span class="unit">hrs</span> <span class="clock">${clockParen(variance, true)}</span>` : "";
    const link = w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">Open</a>` : "—";
    return `<tr><td>${esc(w.week || "")}</td><td>${esc(w.ending || "")}</td><td>${hrs} ${hrsClock}</td><td>${vr} ${vrClock}</td><td>${link}</td></tr>`;
  }).join("");

  const tilRows = tilEntries.map((t: any) => {
    const h = Number(t.hours) || 0;
    return `<tr><td>${esc(t.date || "—")}</td><td>${h.toFixed(2)} <span class="unit">hrs</span> <span class="clock">${clockParen(h)}</span></td><td>${esc(t.note || "")}</td></tr>`;
  }).join("");

  const weeksJson = JSON.stringify(weeks).replace(/</g, "\\u003c");
  const tilJson = JSON.stringify(tilEntries).replace(/</g, "\\u003c");

  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Global Timesheet Ledger — Daniel Clancy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@300;400;500;600;700&family=Source+Sans+3:wght@600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
  :root{
    --bg:#07090d; --border:rgba(176,196,220,.14); --text:#f4f7fb;
    --muted:#8b97a6; --accent:#7eb0ff; --green:#3dcc6e; --red:#ff6b63; --violet:#c4b5fd;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    color:var(--text); font-family:Blinker,sans-serif; min-height:100vh; padding:0 16px 48px;
    background:
      radial-gradient(1100px 480px at 8% -8%, rgba(90,140,220,.18), transparent 62%),
      radial-gradient(820px 420px at 100% -4%, rgba(124,92,196,.1), transparent 58%),
      radial-gradient(900px 520px at 50% 115%, rgba(36,64,108,.22), transparent 55%),
      var(--bg);
  }
  .container{max-width:1100px;margin:0 auto}
  header{
    margin:16px 0 20px; padding:18px 24px; display:flex; align-items:center; gap:14px;
    border-radius:18px; border:1px solid rgba(186,206,230,.16);
    background:linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.015)), rgba(14,18,26,.78);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 18px 48px rgba(0,0,0,.42);
    backdrop-filter:blur(22px);
  }
  .logo-mark{
    width:52px; height:52px; border-radius:16px; flex:none;
    display:flex; align-items:center; justify-content:center;
    background:radial-gradient(circle at 30% 20%, rgba(126,176,255,.28), rgba(126,176,255,.04) 70%);
    box-shadow:0 0 0 1px rgba(126,176,255,.22), 0 10px 24px rgba(0,0,0,.35);
  }
  .logo-mark img{width:52px; height:52px; object-fit:contain}
  .identity h1{font-family:"Source Sans 3",sans-serif; font-size:1.4rem; font-weight:800; margin:0; line-height:1.1; letter-spacing:-.3px}
  .identity .role{color:var(--accent); font-size:.9rem}
  .identity .company{color:var(--muted); font-size:.8rem}
  .badge{
    margin-left:auto; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:#c5ced8;
    border:1px solid var(--border); border-radius:999px; padding:6px 10px;
    background:rgba(255,255,255,.03);
  }
  .page-title{
    font-family:"Source Sans 3",sans-serif; font-size:1.15rem; font-weight:700; letter-spacing:.08em;
    text-transform:uppercase; margin:0 0 12px; display:flex; align-items:center; gap:10px;
    background:linear-gradient(90deg,#f7f9fc,#b7c8dc); -webkit-background-clip:text; background-clip:text; color:transparent;
  }
  .page-title::before{content:""; width:3px; height:16px; border-radius:3px; background:linear-gradient(180deg,#c5d9ff,#5b8def)}
  .summary{display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:18px}
  .stat{
    position:relative; overflow:hidden; border-radius:14px; padding:13px 16px;
    border:1px solid var(--border);
    background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.012) 42%, transparent), #121820;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 12px 28px rgba(0,0,0,.22);
  }
  .stat::before{content:""; position:absolute; left:12px; right:12px; top:0; height:1px; background:linear-gradient(90deg, transparent, rgba(158,190,240,.85), transparent)}
  .stat .label{font-size:.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; font-weight:600}
  .stat .value{font-family:"Source Sans 3",sans-serif; font-size:1.28rem; font-weight:700; margin-top:3px}
  .stat .value.positive{color:var(--green)}
  .stat .value.negative{color:var(--red)}
  .stat .value.neutral{color:#c5ced8}
  .stat.til{border-color:rgba(196,181,253,.45)}
  .stat.til::before{background:linear-gradient(90deg, transparent, rgba(196,181,253,.95), transparent)}
  .stat.til .value{color:var(--violet)}
  .unit{font-size:.72rem; font-weight:650; color:#c5ced8; margin-left:2px}
  .clock{font-size:.68rem; color:var(--muted); font-weight:500; margin-left:4px; white-space:nowrap}
  .positive .unit{color:var(--green)}
  .negative .unit{color:var(--red)}
  .til .unit{color:var(--violet)}
  .actions{margin-bottom:16px}
  .btn{
    background:linear-gradient(180deg,#9ec2ff,#4f86ee); border:1px solid rgba(190,214,255,.7); color:#fff;
    padding:9px 16px; border-radius:10px; font-size:.85rem; font-weight:650; cursor:pointer; font-family:Blinker,sans-serif;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(79,134,238,.28);
  }
  .btn:hover{filter:brightness(1.06)}
  .section-label{
    margin:18px 0 10px; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; color:var(--violet); font-weight:650;
  }
  .table-wrap{
    border-radius:16px; overflow:hidden; border:1px solid var(--border);
    background:linear-gradient(180deg, rgba(255,255,255,.035), transparent 90px), #10161e;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 16px 40px rgba(0,0,0,.28);
  }
  table{width:100%; border-collapse:collapse}
  th{
    background:linear-gradient(180deg,#1c2532,#151c26); text-align:left; padding:13px 16px;
    font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); font-weight:650;
  }
  td{padding:11px 16px; border-bottom:1px solid rgba(176,196,220,.08)}
  tbody tr:hover td{background:rgba(126,176,255,.07)}
  tr:last-child td{border-bottom:none}
  a{color:var(--accent); text-decoration:none; font-weight:600}
  a:hover{text-decoration:underline}
  footer{margin-top:24px; text-align:center; font-size:.78rem; color:var(--muted)}
  ::-webkit-scrollbar{width:8px; height:6px}
  ::-webkit-scrollbar-track{background:#0b0f14}
  ::-webkit-scrollbar-thumb{background:#343c48; border-radius:4px}
  *{scrollbar-width:thin; scrollbar-color:#343c48 #0b0f14}
  @media(max-width:720px){.summary{grid-template-columns:1fr 1fr} .badge{display:none}}
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo-mark"><img src="https://raw.githubusercontent.com/BSMediaGroup/DanielClancy/refs/heads/main/assets/logos/logomatteblue.webp" alt="DC"></div>
    <div class="identity">
      <h1>Daniel Clancy</h1>
      <div class="role">Architectural Technician</div>
      <div class="company">Greg Natale Design</div>
    </div>
    <div class="badge">Shared view</div>
  </header>

  <div class="page-title">Global Timesheet Ledger</div>

  <div class="summary">
    <div class="stat"><div class="label">Weeks entered</div><div class="value">${count}</div></div>
    <div class="stat"><div class="label">Total hours</div><div class="value">${total.toFixed(2)}<span class="unit">hrs</span> <span class="clock">${clockParen(total)}</span></div></div>
    <div class="stat"><div class="label">Average / week</div><div class="value">${avg}${avgNum != null ? `<span class="unit">hrs</span> <span class="clock">${clockParen(avgNum)}</span>` : ""}</div></div>
    <div class="stat"><div class="label">Net variance</div><div class="value ${netClass}">${netStr}<span class="unit">hrs</span> <span class="clock">${clockParen(netAfter, true)}</span>${tilTotal > 0 ? `<div class="clock">(${grossStr}hrs gross · ${formatClock(net)})</div>` : ""}</div></div>
    <div class="stat til"><div class="label">Time in lieu</div><div class="value">${tilTotal.toFixed(2)}<span class="unit">hrs</span> <span class="clock">${clockParen(tilTotal)}</span></div></div>
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

  ${tilEntries.length ? `<div class="section-label">Time taken</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Date</th><th>Hours</th><th>Note</th></tr></thead>
      <tbody>${tilRows}</tbody>
    </table>
  </div>` : ""}

  <footer>Read-only shared view · Standard week: ${standard}hrs ${clockParen(standard)}</footer>
</div>

<script>
const WEEKS = ${weeksJson};
const TIL = ${tilJson};
const STANDARD = ${standard};
const TIL_TOTAL = ${tilTotal};
const NET_GROSS = ${net};
const NET_AFTER = ${netAfter};

function formatClock(v) {
  if (v == null || v === "" || isNaN(Number(v))) return "";
  var n = Number(v), neg = n < 0;
  n = Math.abs(n);
  var hrs = Math.floor(n + 1e-9);
  var mins = Math.round((n - hrs) * 60);
  if (mins === 60) { hrs += 1; mins = 0; }
  return (neg ? "-" : "") + hrs + "hrs, " + mins + "min";
}
function clockParen(v, signed) {
  var c = formatClock(v);
  if (!c) return "";
  return (signed && Number(v) > 0 ? "(+" : "(") + c + ")";
}

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
  doc.text("Weeks entered: ${count}", 14, y);
  y += 5;
  doc.text("Total: ${total.toFixed(2)}hrs " + clockParen(${total}) + "     Average: ${avgPdf}", 14, y);
  y += 5;
  doc.text("Net variance: ${netStr}hrs " + clockParen(${netAfter}, true) + "     Gross variance: ${grossStr}hrs " + clockParen(${net}, true), 14, y);
  y += 5;
  doc.text("Time in lieu: ${tilTotal.toFixed(2)}hrs " + clockParen(${tilTotal}) + "     Standard: ${standard}hrs " + clockParen(${standard}), 14, y);
  y += 8;
  doc.setFillColor(26, 31, 38);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(240, 243, 246);
  doc.setFontSize(9);
  doc.text("Week", 16, y + 5);
  doc.text("Ending", 42, y + 5);
  doc.text("Hours", 72, y + 5);
  doc.text("Variance", 108, y + 5);
  doc.text("Timesheet", 148, y + 5);
  y += 12;
  doc.setTextColor(30, 30, 30);
  WEEKS.forEach(w => {
    if (y > 270) { doc.addPage(); y = 20; }
    const hoursNum = w.hours != null && w.hours !== "" ? Number(w.hours) : null;
    const variance = w.variance != null && w.variance !== "" ? Number(w.variance) : (hoursNum != null ? hoursNum - STANDARD : null);
    const hrs = hoursNum != null ? hoursNum.toFixed(2) + "hrs" : "—";
    const vr = variance != null ? (variance >= 0 ? "+" : "") + variance.toFixed(2) + "hrs" : "—";
    doc.text(String(w.week || ""), 16, y);
    doc.text(String(w.ending || ""), 42, y);
    doc.text(hrs, 72, y);
    doc.text(vr, 108, y);
    if (hoursNum != null) {
      doc.setFontSize(7);
      doc.setTextColor(110, 110, 110);
      doc.text(clockParen(hoursNum), 72, y + 3.4);
      if (variance != null) doc.text(clockParen(variance, true), 108, y + 3.4);
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
    }
    if (w.url) {
      doc.setTextColor(91, 156, 245);
      doc.textWithLink("Open", 148, y, { url: w.url });
      doc.setTextColor(30, 30, 30);
    } else {
      doc.text("—", 148, y);
    }
    y += 10;
  });
  if (TIL.length) {
    y += 6;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("Time taken", 14, y);
    y += 6;
    doc.setFontSize(9);
    TIL.forEach(function (t) {
      if (y > 275) { doc.addPage(); y = 20; }
      var h = Number(t.hours) || 0;
      doc.setTextColor(30, 30, 30);
      doc.text((t.date || "—") + "    " + h.toFixed(2) + "hrs " + clockParen(h) + "    " + (t.note || ""), 14, y);
      y += 6;
    });
  }
  doc.save("timesheet-daniel-clancy-shared.pdf");
}
</script>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
};
