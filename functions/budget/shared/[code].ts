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

const LOGO = "https://raw.githubusercontent.com/BSMediaGroup/DanielClancy/refs/heads/main/assets/logos/logomatteblue.webp";
const FREQ_ORDER = ["day", "week", "2week", "4week", "month", "year"];
const FREQ_LABELS: Record<string, string> = {
  day: "Daily", week: "Weekly", "2week": "Fortnightly", "4week": "4-Weekly", month: "Monthly", year: "Yearly"
};
const DAYS: Record<string, number> = { day: 1, week: 7, "2week": 14, "4week": 28, month: 365 / 12, year: 365 };
const toDaily = (amt: number, freq: string) => amt / (DAYS[freq] || 1);
const project = (daily: number, freq: string) => daily * (DAYS[freq] || 1);

function esc(s: unknown) {
  const amp = "&" + "amp;";
  const lt = "&" + "lt;";
  const gt = "&" + "gt;";
  const quot = "&" + "quot;";
  return String(s ?? "").replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt).replace(/"/g, quot);
}
function money(n: number) {
  const v = Number(n) || 0;
  const sign = v < 0 ? "-" : "";
  return sign + "$" + Math.abs(v).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ICONS = {
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
};

function insightCard(color: string, kicker: string, figure: string, text: string, icon: string, delay: number) {
  return `<div class="insight-card ${color}" style="animation-delay:${delay}ms"><div class="icon">${icon}</div><div class="insight-copy"><div class="kicker">${esc(kicker)}</div><div class="figure">${esc(figure)}</div><div class="text">${esc(text)}</div></div></div>`;
}

const PAGE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  * { scrollbar-width: thin; scrollbar-color: #2a3038 #0d1117; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: #0d1117; }
  *::-webkit-scrollbar-thumb { background: #2a3038; border-radius: 3px; }
  body {
    color: #f4f7fb;
    font-family: "Blinker", "Segoe UI", sans-serif;
    min-height: 100vh;
    padding: 12px 16px 72px;
    background:
      radial-gradient(1100px 480px at 8% -8%, rgba(90,140,220,.18), transparent 62%),
      radial-gradient(820px 420px at 100% -4%, rgba(124,92,196,.1), transparent 58%),
      radial-gradient(900px 520px at 50% 115%, rgba(36,64,108,.22), transparent 55%),
      #07090d;
  }
  body.density-compact { font-size: 14px; }
  body.density-large { font-size: 17px; }
  body.density-compact td, body.density-compact th { padding: 6px 8px; }
  body.density-large td, body.density-large th { padding: 12px 14px; }
  .wrap { max-width: 1100px; margin: 0 auto; }
  header {
    position: sticky; top: 8px; z-index: 200;
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
    padding: 8px 14px; margin: 0 0 14px; border-radius: 14px;
    border: 1px solid rgba(186,206,230,.16);
    background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.015)), rgba(14,18,26,.82);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 16px 40px rgba(0,0,0,.4);
    backdrop-filter: blur(22px) saturate(1.3);
  }
  header.slim { padding: 6px 14px; }
  header.slim .logo { width: 36px; height: 36px; }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .logo { width: 44px; height: 44px; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0 1px rgba(126,176,255,.22); flex-shrink: 0; }
  .logo img { width: 100%; height: 100%; object-fit: cover; }
  .identity h1 { font-family: "Source Sans 3", sans-serif; font-size: 1.15rem; font-weight: 800; line-height: 1.1; }
  .identity .role { color: #7eb0ff; font-size: .8rem; }
  .page-title {
    position: absolute; left: 50%; transform: translateX(-50%);
    font-family: "Source Sans 3", sans-serif; font-weight: 700;
    font-size: .92rem; letter-spacing: .08em; text-transform: uppercase;
    background: linear-gradient(90deg, #f7f9fc, #b7c8dc);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    display: flex; align-items: center; gap: 10px; pointer-events: none; white-space: nowrap;
  }
  .page-title::before { content: ""; width: 3px; height: 14px; border-radius: 3px; background: linear-gradient(180deg, #c5d9ff, #5b8def); }
  .slim-cards { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .slim-card {
    background: rgba(12,16,22,.8); border: 1px solid rgba(176,196,220,.16); border-radius: 10px;
    padding: 4px 10px; display: flex; align-items: center; gap: 6px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }
  .slim-card.gross { border-color: rgba(61,204,110,.4); }
  .slim-card .lbl { font-size: .62rem; color: #8b97a6; text-transform: uppercase; letter-spacing: .06em; }
  .slim-card .val { font-family: "Source Sans 3", sans-serif; font-size: .92rem; font-weight: 700; }
  .slim-card.gross .val { color: #3dcc6e; }
  .super-note { display: flex; flex-direction: column; line-height: 1.15; margin-left: 4px; }
  .super-note span { font-size: .62rem; color: #8b97a6; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
  .card, .section, .chart-card, .insight-card {
    position: relative;
    background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.012) 42%, transparent), #121820;
    border: 1px solid rgba(176,196,220,.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 12px 28px rgba(0,0,0,.22);
  }
  .card, .insight-card { border-radius: 12px; padding: 12px 14px; overflow: hidden; }
  .card::before, .chart-card::before, .insight-card::before {
    content: ""; position: absolute; left: 12px; right: 12px; top: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(158,190,240,.85), transparent);
  }
  .card .label, .section h3, .chart-card h3 {
    font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; color: #8b97a6; font-weight: 600;
  }
  .card .value { font-family: "Source Sans 3", sans-serif; font-size: 1.25rem; font-weight: 750; margin-top: 4px; letter-spacing: -.3px; }
  .card .value.green { color: #3dcc6e; }
  .card .value.red { color: #ff6b63; }
  .card .sub { font-size: .75rem; margin-top: 4px; }
  .section { border-radius: 14px; margin: 14px 0; overflow: hidden; }
  .section h3 { padding: 12px 14px 0; }
  .section .pad { padding: 12px 14px 14px; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .chart-card { border-radius: 14px; padding: 14px 16px 12px; overflow: hidden; transition: border-color .2s ease; }
  .chart-card.wide { grid-column: 1 / -1; }
  .chart-card h3 { margin-bottom: 8px; }
  .chart-card:hover { border-color: rgba(196,214,236,.32); }
  .chart-stage { position: relative; height: 250px; display: flex; align-items: center; justify-content: center; }
  .chart-stage.bars, .chart-stage.tall { display: block; height: 260px; }
  .chart-stage.line { height: 280px; }
  .chart-stage canvas,
  .chart-stage.bars canvas,
  .chart-card:hover canvas,
  .chart-card:hover .chart-stage.bars canvas {
    transform: none !important;
    filter: none !important;
    max-height: none !important;
  }
  .chart-stage.bars canvas { width: 100% !important; height: 100% !important; }
  .table-wrap { overflow: auto; border-radius: 14px; border: 1px solid rgba(176,196,220,.14); background: linear-gradient(180deg, rgba(255,255,255,.04), transparent 30%), #121820; box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a2230; text-align: left; padding: 8px 10px; font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; color: #8b97a6; white-space: nowrap; }
  td { padding: 8px 10px; border-top: 1px solid rgba(176,196,220,.1); font-size: .85rem; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr:hover td { background: rgba(255,255,255,.03); }
  tr.paid td { color: #8b97a6; }
  tr.paid { background: rgba(61,204,110,.06); }
  .icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #1a2230; }
  .icon svg { width: 16px; height: 16px; stroke: #b7c3d4; }
  .cat { color: #8b97a6; font-size: .8rem; }
  .paid-mark { width: 16px; height: 16px; border-radius: 4px; background: #3dcc6e; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px rgba(61,204,110,.15); }
  .paid-mark svg { width: 10px; height: 10px; stroke: #fff; }
  .purchase { color: #c4b5fd; }
  .insight-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
  .insight-card { display: flex; gap: 10px; align-items: flex-start; animation: insight-in .55s ease both; transition: transform .2s ease, border-color .2s ease; }
  .insight-card:hover { transform: translateY(-3px); border-color: rgba(196,214,236,.32); }
  .insight-card .icon { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
  .insight-card .icon svg { width: 16px; height: 16px; }
  .insight-card.green .icon { background: rgba(61,204,110,.15); color: #3dcc6e; }
  .insight-card.blue .icon { background: rgba(126,176,255,.15); color: #7eb0ff; }
  .insight-card.orange .icon { background: rgba(240,160,90,.15); color: #f0a05a; }
  .insight-card.red .icon { background: rgba(255,107,99,.15); color: #ff6b63; }
  .insight-card .kicker { font-size: .66rem; letter-spacing: .08em; text-transform: uppercase; color: #8b97a6; }
  .insight-card .figure { font-family: "Source Sans 3", sans-serif; font-size: 1.12rem; font-weight: 750; margin: 2px 0; letter-spacing: -.3px; }
  .insight-card.green .figure { color: #3dcc6e; }
  .insight-card.blue .figure { color: #7eb0ff; }
  .insight-card.orange .figure { color: #f0a05a; }
  .insight-card.red .figure { color: #ff6b63; }
  .insight-card .text { font-size: .78rem; color: #b7c3d4; line-height: 1.35; }
  .note { margin-top: 16px; font-size: .78rem; color: #8b97a6; text-align: center; }
  .density-toggle {
    position: fixed; bottom: 16px; left: 16px; display: flex; gap: 2px; padding: 3px; z-index: 400;
    background: rgba(14,18,26,.9); border: 1px solid rgba(186,206,230,.16); border-radius: 999px;
    box-shadow: 0 10px 24px rgba(0,0,0,.4); backdrop-filter: blur(12px);
  }
  .density-toggle button { background: transparent; border: none; color: #8b97a6; padding: 5px 10px; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: .72rem; font-weight: 650; }
  .density-toggle button.active { background: linear-gradient(180deg, #9ec2ff, #4f86ee); color: #fff; }
  @keyframes insight-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (max-width: 860px) {
    .cards { grid-template-columns: 1fr 1fr; }
    .charts { grid-template-columns: 1fr; }
    .page-title { display: none; }
  }
`;

const CHART_BOOT = `
(function () {
  var el = document.getElementById("bd");
  if (!el || !window.Chart) return;
  var DATA = JSON.parse(el.textContent || "{}");
  var palette = ["#7eb0ff", "#3dcc6e", "#f0a05a", "#c4b5fd", "#ff6b63", "#79c0ff", "#e6c15a", "#8b9cff"];
  function shadeHex(hex, amt) {
    var n = String(hex).replace("#", "");
    var full = n.length === 3 ? n.split("").map(function (c) { return c + c; }).join("") : n;
    var num = parseInt(full, 16);
    function clamp(v) { return Math.max(0, Math.min(255, v)); }
    var r = clamp((num >> 16) + amt), g = clamp(((num >> 8) & 255) + amt), b = clamp((num & 255) + amt);
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }
  var valueLabels = { id: "valueLabels", afterDatasetsDraw: function (chart) {
    var ctx = chart.ctx;
    var meta = chart.getDatasetMeta(0);
    if (!meta || meta.hidden) return;
    var horizontal = chart.options.indexAxis === "y";
    ctx.save();
    ctx.fillStyle = "#d5deea";
    ctx.font = "600 11px Blinker, sans-serif";
    meta.data.forEach(function (el, i) {
      var raw = Number(chart.data.datasets[0].data[i]);
      if (!isFinite(raw)) return;
      var label = "$" + Math.round(raw).toLocaleString();
      var p = el.getProps(["x", "y", "base"], true);
      if (horizontal) { ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(label, p.x + 8, p.y); }
      else { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(label, p.x, Math.min(p.y, p.base) - 6); }
    });
    ctx.restore();
  }};
  var barTrack = { id: "barTrack", beforeDatasetsDraw: function (chart) {
    if (chart.options.indexAxis !== "y") return;
    var ctx = chart.ctx, area = chart.chartArea, meta = chart.getDatasetMeta(0);
    if (!meta || !area) return;
    ctx.save();
    meta.data.forEach(function (bar) {
      var p = bar.getProps(["y"], true);
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      ctx.beginPath();
      ctx.roundRect(area.left, p.y - 5, area.right - area.left, 10, 6);
      ctx.fill();
    });
    ctx.restore();
  }};
  function verticalGradient(chart, hex) {
    var area = chart.chartArea; if (!area) return hex;
    var g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, shadeHex(hex, 28)); g.addColorStop(0.45, hex); g.addColorStop(1, shadeHex(hex, -62));
    return g;
  }
  function horizontalGradient(chart, hex) {
    var area = chart.chartArea; if (!area) return hex;
    var g = chart.ctx.createLinearGradient(area.left, 0, area.right, 0);
    g.addColorStop(0, shadeHex(hex, -36)); g.addColorStop(1, shadeHex(hex, 18));
    return g;
  }
  function hexAlpha(hex, a) {
    var n = parseInt(String(hex).replace("#", ""), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function areaFill(chart, hex) {
    var area = chart.chartArea;
    if (!area) return hexAlpha(hex, 0.2);
    var g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, hexAlpha(hex, 0.38));
    g.addColorStop(1, hexAlpha(hex, 0));
    return g;
  }
  function drawAnim(step) {
    return { duration: 1400, easing: "easeOutQuart", delay: function (ctx) { return ctx.type === "data" ? ctx.dataIndex * step : 0; } };
  }
  var tip = { backgroundColor: "rgba(10,14,20,.94)", borderColor: "rgba(186,206,230,.22)", borderWidth: 1, padding: 10, cornerRadius: 10, titleColor: "#f4f7fb", bodyColor: "#c5ced8", titleFont: { family: "Blinker", size: 12, weight: "600" }, bodyFont: { family: "Blinker", size: 12 } };
  var legend = { position: "bottom", labels: { color: "#c5ced8", boxWidth: 10, padding: 10, font: { size: 11, family: "Blinker" } } };
  var scales = { x: { ticks: { color: "#8b97a6", font: { size: 11, family: "Blinker" } }, grid: { display: false } }, y: { ticks: { color: "#8b97a6", font: { size: 10 } }, grid: { color: "rgba(176,196,220,0.08)" }, border: { display: false }, beginAtZero: true } };
  var lineScales = { x: { ticks: { color: "#8b97a6", font: { size: 11, family: "Blinker" }, maxRotation: 0 }, grid: { display: false } }, y: { ticks: { color: "#8b97a6", font: { size: 10 }, callback: function (v) { return "$" + Number(v).toLocaleString(); } }, grid: { color: "rgba(176,196,220,0.08)" }, border: { display: false }, beginAtZero: true } };
  var lineHover = { mode: "index", intersect: false };
  if (document.getElementById("pieChart")) {
    new Chart(document.getElementById("pieChart"), {
      type: "doughnut",
      data: { labels: DATA.pieLabels, datasets: [{ data: DATA.pieValues, backgroundColor: palette, hoverBackgroundColor: palette.map(function (c) { return shadeHex(c, 22); }), borderColor: "#121820", borderWidth: 2, spacing: 2, borderRadius: 4, hoverOffset: 6 }] },
      plugins: [{ id: "pieCenter", afterDraw: function (chart) {
        var meta = chart.getDatasetMeta(0); if (!meta.data[0]) return;
        var x = meta.data[0].x, y = meta.data[0].y, ctx = chart.ctx;
        ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#f4f7fb";
        ctx.font = "700 16px Source Sans 3, sans-serif";
        ctx.fillText("$" + Math.round(DATA.totalMonth || 0).toLocaleString(), x, y - 2);
        ctx.fillStyle = "#8b97a6"; ctx.font = "600 10px Blinker, sans-serif"; ctx.fillText("PER MONTH", x, y + 14); ctx.restore();
      }}],
      options: { cutout: "68%", animation: { duration: 1300, easing: "easeOutQuart", animateRotate: true, animateScale: false }, plugins: { legend: legend, tooltip: Object.assign({}, tip, { callbacks: { label: function (c) { return " " + c.label + "  $" + Number(c.raw).toFixed(2); } } }) } }
    });
  }
  if (document.getElementById("barChart")) {
    new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: { labels: DATA.barLabels, datasets: [{ data: DATA.barValues, borderRadius: 6, borderSkipped: false, barPercentage: 0.55, backgroundColor: function (c) { return verticalGradient(c.chart, DATA.barColors[c.dataIndex]); }, hoverBackgroundColor: (DATA.barColors || []).map(function (c) { return shadeHex(c, 28); }) }] },
      plugins: [valueLabels],
      options: { animation: drawAnim(120), maintainAspectRatio: false, layout: { padding: { top: 18, right: 4, bottom: 0, left: 0 } }, plugins: { legend: { display: false }, tooltip: Object.assign({}, tip, { callbacks: { label: function (c) { return " $" + Number(c.raw).toFixed(2); } } }) }, scales: scales }
    });
  }
  if (document.getElementById("catChart") && DATA.catLabels && DATA.catLabels.length) {
    var catStage = document.getElementById("catChart").parentElement;
    if (catStage) catStage.style.height = Math.max(160, DATA.catLabels.length * 38 + 28) + "px";
    new Chart(document.getElementById("catChart"), {
      type: "bar",
      data: { labels: DATA.catLabels, datasets: [{ data: DATA.catValues, borderRadius: 6, borderSkipped: false, barPercentage: 0.55, backgroundColor: function (c) { return horizontalGradient(c.chart, palette[c.dataIndex % palette.length]); }, hoverBackgroundColor: DATA.catLabels.map(function (_k, i) { return shadeHex(palette[i % palette.length], 26); }) }] },
      plugins: [barTrack, valueLabels],
      options: { indexAxis: "y", animation: drawAnim(80), maintainAspectRatio: false, layout: { padding: { right: 72 } }, plugins: { legend: { display: false }, tooltip: Object.assign({}, tip, { callbacks: { label: function (c) { return " $" + Number(c.raw).toFixed(2) + " / mo"; } } }) }, scales: { x: scales.x, y: { ticks: { color: "#c5ced8", font: { size: 12, family: "Blinker" } }, grid: { display: false } } } }
    });
  }
  if (document.getElementById("lineChart") && DATA.outlook) {
    var o = DATA.outlook;
    var leftColor = o.leftover >= 0 ? "#3dcc6e" : "#ff6b63";
    new Chart(document.getElementById("lineChart"), {
      type: "line",
      data: {
        labels: o.labels,
        datasets: [
          { label: "Savings balance", data: o.savingsPath, borderColor: "#7eb0ff", backgroundColor: function (c) { return areaFill(c.chart, "#7eb0ff"); }, fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: "#7eb0ff", pointBorderColor: "#0e141c", pointBorderWidth: 2 },
          { label: "Leftover, cumulative", data: o.leftoverPath, borderColor: leftColor, fill: false, tension: 0.35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: leftColor, pointBorderColor: "#0e141c", pointBorderWidth: 2 },
          { label: "Savings goal", data: o.goalPath, borderColor: "#e6c15a", borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0 }
        ]
      },
      options: { animation: drawAnim(70), maintainAspectRatio: false, interaction: lineHover, plugins: { legend: legend, tooltip: Object.assign({}, tip, { callbacks: { label: function (c) { return " " + c.dataset.label + "  $" + Number(c.raw).toLocaleString(); } } }) }, scales: lineScales }
    });
  }
  if (document.getElementById("histChart") && DATA.history && DATA.history.length > 1) {
    new Chart(document.getElementById("histChart"), {
      type: "line",
      data: {
        labels: DATA.history.map(function (h) { return h.label; }),
        datasets: [
          { label: "Income", data: DATA.history.map(function (h) { return h.income; }), borderColor: "#7eb0ff", backgroundColor: function (c) { return areaFill(c.chart, "#7eb0ff"); }, fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: "#7eb0ff", pointBorderColor: "#0e141c", pointBorderWidth: 2 },
          { label: "Expenses", data: DATA.history.map(function (h) { return h.expenses; }), borderColor: "#ff6b63", fill: false, tension: 0.3, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: "#ff6b63", pointBorderColor: "#0e141c", pointBorderWidth: 2 }
        ]
      },
      options: { animation: drawAnim(90), maintainAspectRatio: false, interaction: lineHover, plugins: { legend: legend, tooltip: tip }, scales: lineScales }
    });
  }
})();
`;

function passwordPage(wrong: boolean) {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Budget — password</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&family=Source+Sans+3:wght@650;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #f4f7fb; font-family: Blinker, sans-serif;
    background: radial-gradient(900px 420px at 15% -10%, rgba(90,140,220,.2), transparent 60%), radial-gradient(700px 380px at 100% 0%, rgba(124,92,196,.12), transparent 55%), #07090d; }
  form { width: min(380px, 92vw); text-align: left; padding: 28px 26px 24px; border-radius: 18px; border: 1px solid rgba(186,206,230,.16);
    background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.012) 40%, transparent), #121820;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 24px 60px rgba(0,0,0,.5); }
  img { width: 52px; height: 52px; border-radius: 12px; display: block; margin-bottom: 14px; }
  .kicker { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: #8b97a6; margin-bottom: 6px; }
  h2 { font-family: "Source Sans 3", sans-serif; font-weight: 800; font-size: 1.45rem; margin: 0 0 6px; }
  p { margin: 0 0 16px; color: #8b97a6; font-size: .9rem; }
  .err { color: #ff6b63; font-size: .85rem; margin: -8px 0 12px; }
  input { background: #0c1016; border: 1px solid rgba(176,196,220,.16); color: #f4f7fb; padding: 12px 14px; border-radius: 10px; width: 100%; font-family: inherit; font-size: 1rem; }
  input:focus { outline: none; border-color: #7eb0ff; box-shadow: 0 0 0 3px rgba(126,176,255,.22); }
  button { background: linear-gradient(180deg, #9ec2ff, #4f86ee); color: #fff; border: 1px solid rgba(190,214,255,.7); padding: 12px 18px; border-radius: 10px; margin-top: 14px; cursor: pointer; width: 100%; font-family: inherit; font-weight: 650; box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(79,134,238,.28); }
</style></head>
<body><form method="GET">
  <img src="${LOGO}" alt="">
  <div class="kicker">Shared budget</div>
  <h2>Password required</h2>
  <p>This link is locked.</p>
  ${wrong ? '<div class="err">Incorrect password.</div>' : ""}
  <input type="password" name="p" placeholder="Password" autofocus required>
  <button type="submit">View</button>
</form></body></html>`, { headers: { "Content-Type": "text/html" } });
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
    return passwordPage(provided.length > 0);
  }

  const data = JSON.parse(row.data);
  const income = Number(data.income) || 0;
  const gross = Number(data.grossSalary) || 0;
  const sources = data.incomeSources || [];
  const SUPER_DEFAULTS: Record<string, number> = { AU: 12, US: 6, UK: 5, NZ: 3, CA: 5 };
  let superTotal = 0;
  sources.forEach((s: any) => {
    if (s.included && s.hasSuper) {
      const rate = (s.superRate || SUPER_DEFAULTS[s.nation] || 12) / 100;
      superTotal += s.isMain ? gross * rate : (Number(s.amount) || 0) * 12 * rate;
    }
  });
  const phone = Number(data.phoneAllowance) || 0;
  const expenses = data.expenses || [];
  const savings = Number(data.savings) || 0;
  const purchases = data.purchases || [];

  let totalDaily = 0;
  const byFreq: Record<string, number> = {};
  FREQ_ORDER.forEach((f) => { byFreq[f] = 0; });
  const byCat: Record<string, number> = {};
  expenses.forEach((e: any) => {
    const daily = toDaily(Number(e.amount) || 0, e.frequency);
    totalDaily += daily;
    const month = project(daily, "month");
    byFreq[e.frequency] = (byFreq[e.frequency] || 0) + month;
    const cat = detectCategory(e.name, e.categoryOverride);
    byCat[cat.label] = (byCat[cat.label] || 0) + month;
  });
  const spendable = income + phone;
  const expMonth = project(totalDaily, "month");
  const leftoverMonth = spendable - expMonth - savings;
  const purchaseTotal = purchases.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const afterPurchases = leftoverMonth - purchaseTotal;

  const periods = data.periods && typeof data.periods === "object" ? data.periods as Record<string, any> : {};
  const periodKeys = Object.keys(periods).sort();
  let ytdIncome = 0, ytdExpenses = 0, ytdSavings = 0, ytdPurchases = 0;
  const history: { label: string; income: number; expenses: number }[] = [];
  periodKeys.forEach((key) => {
    const p = periods[key] || {};
    const inc = (Number(p.income) || 0) + (Number(p.phoneAllowance) || 0);
    let expDaily = 0;
    (p.expenses || []).forEach((e: any) => { expDaily += toDaily(Number(e.amount) || 0, e.frequency); });
    const expM = project(expDaily, "month");
    const sav = Number(p.savings) || 0;
    const purch = (p.purchases || []).reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
    ytdIncome += inc; ytdExpenses += expM; ytdSavings += sav; ytdPurchases += purch;
    history.push({ label: key, income: Math.round(inc * 100) / 100, expenses: Math.round(expM * 100) / 100 });
  });
  const ytdLeft = ytdIncome - ytdExpenses - ytdSavings - ytdPurchases;

  const rateIncome = periodKeys.length > 1 ? ytdIncome : spendable;
  const rateSave = periodKeys.length > 1 ? ytdSavings : savings;
  const rate = rateIncome > 0 ? (rateSave / rateIncome) * 100 : 0;
  const burnInc = periodKeys.length > 1 ? ytdIncome / periodKeys.length : spendable;
  const burnExp = periodKeys.length > 1 ? ytdExpenses / periodKeys.length : expMonth;
  const burn = burnInc > 0 ? (burnExp / burnInc) * 100 : 0;
  let changeFig = "—";
  let changeText = periodKeys.length > 1 ? "Not enough to compare" : "One snapshot — no prior period in this share";
  let changeColor = "blue";
  if (history.length > 1) {
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (prev.expenses) {
      const expChange = ((last.expenses - prev.expenses) / prev.expenses) * 100;
      changeFig = (expChange > 0 ? "+" : "") + expChange.toFixed(1) + "%";
      changeText = "Expense change versus the previous saved period";
      changeColor = expChange > 2 ? "orange" : expChange < -2 ? "green" : "blue";
    }
  }
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const paid = expenses.filter((e: any) => e.paid).length;
  const goal = Number(data.savingsGoal) || 0;
  const balance = Number(data.savingsBalance) || 0;
  const monthsLeft = savings > 0 ? Math.max(0, Math.ceil((goal - balance) / savings)) : null;

  const cards = [
    insightCard(rate >= 15 ? "green" : "orange", "Savings rate", rate.toFixed(1) + "%", periodKeys.length > 1 ? "Share of recorded income set aside across saved periods" : "Share of this period's spendable income set aside", ICONS.trend, 0),
    insightCard(burn > 90 ? "red" : burn > 70 ? "orange" : "blue", "Spend ratio", burn.toFixed(0) + "%", "Expenses against income", ICONS.clock, 70),
    insightCard(changeColor, "Period shift", changeFig, changeText, ICONS.pulse, 140),
    insightCard("blue", "Largest category", topCat ? topCat[0] : "—", topCat ? money(topCat[1]) + " this period" : "No expenses in this share", ICONS.home, 210),
    insightCard(expenses.length && paid === expenses.length ? "green" : "orange", "Paid", expenses.length ? paid + " / " + expenses.length : "—", "Expenses marked paid", ICONS.check, 280),
    insightCard("green", "Goal", goal ? (monthsLeft == null ? "—" : monthsLeft + " mo") : "—", goal ? money(Math.max(0, goal - balance)) + " still to save" : "No savings goal in this share", ICONS.coin, 350)
  ].join("");

  const pieKeys = Object.keys(byFreq).filter((k) => byFreq[k] > 0);
  const chartJson = JSON.stringify({
    pieLabels: pieKeys.map((k) => FREQ_LABELS[k] || k),
    pieValues: pieKeys.map((k) => Math.round(byFreq[k] * 100) / 100),
    totalMonth: Math.round(expMonth * 100) / 100,
    barLabels: ["Income", "Expenses", "Savings", "Leftover"],
    barValues: [spendable, expMonth, savings, leftoverMonth].map((n) => Math.round(n * 100) / 100),
    barColors: ["#7eb0ff", "#ff6b63", "#3dcc6e", leftoverMonth >= 0 ? "#3dcc6e" : "#ff6b63"],
    catLabels: Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k),
    catValues: Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([, v]) => Math.round(v * 100) / 100),
    history: periodKeys.length > 1 ? history : [],
    outlook: (() => {
      const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const startKey = periodKeys.length ? periodKeys[periodKeys.length - 1] : "";
      const match = /^(\d{4})-(\d{2})/.exec(startKey);
      let y = new Date().getFullYear();
      let m = new Date().getMonth();
      if (match) { y = Number(match[1]); m = Number(match[2]) - 1; }
      const labels: string[] = [];
      const savingsPath: number[] = [];
      const leftoverPath: number[] = [];
      const goalPath: number[] = [];
      for (let i = 0; i < 13; i++) {
        const d = new Date(y, m + i, 1);
        labels.push(names[d.getMonth()] + " " + String(d.getFullYear()).slice(2));
        savingsPath.push(Math.round((balance + savings * i) * 100) / 100);
        leftoverPath.push(Math.round(leftoverMonth * i * 100) / 100);
        goalPath.push(Math.round(goal * 100) / 100);
      }
      return { labels, savingsPath, leftoverPath, goalPath, leftover: leftoverMonth };
    })()
  }).replace(/</g, "\\u003c");

  const rows = expenses.map((e: any) => {
    const daily = toDaily(Number(e.amount) || 0, e.frequency);
    const cat = detectCategory(e.name, e.categoryOverride);
    const paidMark = e.paid ? '<div class="paid-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>' : "";
    return `<tr class="${e.paid ? "paid" : ""}">
      <td><div class="icon">${cat.icon}</div></td>
      <td>${esc(e.name || "")}</td>
      <td>${paidMark}</td>
      <td class="cat">${esc(cat.label)}</td>
      <td>${esc(FREQ_LABELS[e.frequency] || e.frequency || "")}</td>
      <td class="num">${money(Number(e.amount) || 0)}</td>
      <td class="num">${money(project(daily, "day"))}</td>
      <td class="num">${money(project(daily, "week"))}</td>
      <td class="num">${money(project(daily, "month"))}</td>
      <td class="num">${money(project(daily, "year"))}</td>
    </tr>`;
  }).join("");

  const purchaseRows = purchases.map((p: any) => {
    const cat = detectCategory(p.name, p.categoryOverride);
    return `<tr><td><div class="icon">${cat.icon}</div></td><td class="purchase">${esc(p.name || "")}</td><td class="cat">${esc(cat.label)}</td><td class="num">${money(Number(p.amount) || 0)}</td></tr>`;
  }).join("");

  const ytdBlock = periodKeys.length ? `
    <div class="section"><h3>${periodKeys.length > 1 ? "Year to date" : "Saved period"}</h3><div class="pad">
      <div class="cards">
        <div class="card"><div class="label">Income</div><div class="value">${money(ytdIncome)}</div></div>
        <div class="card"><div class="label">Expenses</div><div class="value">${money(ytdExpenses)}</div></div>
        <div class="card"><div class="label">Savings</div><div class="value">${money(ytdSavings)}</div></div>
        <div class="card"><div class="label">Leftover</div><div class="value ${ytdLeft >= 0 ? "green" : "red"}">${money(ytdLeft)}</div></div>
      </div>
    </div></div>` : "";

  const histCard = history.length > 1 ? `<div class="chart-card wide"><h3>Period trend</h3><div class="chart-stage bars line"><canvas id="histChart"></canvas></div></div>` : "";
  const superHtml = superTotal > 0 ? `<div class="super-note"><span>+${money(Math.round(superTotal)).replace(/\.00$/, "")} super</span><span>${money(Math.round(gross + superTotal)).replace(/\.00$/, "")} total</span></div>` : "";

  return new Response(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Budget — Daniel Clancy</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;500;600;700&family=Source+Sans+3:wght@600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>${PAGE_CSS}</style>
</head><body>
<div class="wrap">
<header id="hdr">
  <div class="brand">
    <div class="logo"><img src="${LOGO}" alt="DC"></div>
    <div class="identity"><h1>Daniel Clancy</h1><div class="role">Budget</div></div>
  </div>
  <div class="page-title">Budget</div>
  <div class="slim-cards">
    <div class="slim-card gross"><span class="lbl">Gross</span><span class="val">$${Math.round(gross).toLocaleString("en-AU")}</span>${superHtml}</div>
    <div class="slim-card"><span class="lbl">Net</span><span class="val">${money(income)}</span></div>
    <div class="slim-card"><span class="lbl">Phone</span><span class="val">${money(phone)}</span></div>
  </div>
</header>
<div class="cards">
  <div class="card"><div class="label">Spendable / month</div><div class="value">${money(spendable)}</div></div>
  <div class="card"><div class="label">Expenses / month</div><div class="value">${money(expMonth)}</div></div>
  <div class="card"><div class="label">Savings / month</div><div class="value">${money(savings)}</div></div>
  <div class="card"><div class="label">Leftover / month</div><div class="value ${leftoverMonth >= 0 ? "green" : "red"}">${money(leftoverMonth)}</div>${purchaseTotal > 0 ? `<div class="sub" style="color:${afterPurchases >= 0 ? "#3dcc6e" : "#ff6b63"}">${money(afterPurchases)} after purchases</div>` : ""}</div>
</div>
<div class="section"><h3>Charts</h3><div class="pad"><div class="charts">
  <div class="chart-card"><h3>Expense mix</h3><div class="chart-stage"><canvas id="pieChart"></canvas></div></div>
  <div class="chart-card"><h3>Monthly allocation</h3><div class="chart-stage bars"><canvas id="barChart"></canvas></div></div>
  <div class="chart-card wide"><h3>12-month outlook</h3><div class="chart-stage bars line"><canvas id="lineChart"></canvas></div></div>
  <div class="chart-card wide"><h3>Spend by category</h3><div class="chart-stage bars tall"><canvas id="catChart"></canvas></div></div>
  ${histCard}
</div></div></div>
<div class="section"><h3>Insights</h3><div class="pad"><div class="insight-cards">${cards}</div></div></div>
${ytdBlock}
<div class="table-wrap"><table>
  <thead><tr><th></th><th>Expense</th><th></th><th>Category</th><th>Frequency</th><th>Amount</th><th>Day</th><th>Week</th><th>Month</th><th>Year</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="10" style="color:#8b97a6">No expenses in this share</td></tr>'}</tbody>
</table></div>
${purchases.length ? `<div class="section"><h3 style="color:#f0a05a">One-off purchases</h3><div class="pad"><div class="table-wrap"><table>
  <thead><tr><th></th><th>Purchase</th><th>Category</th><th>Amount</th></tr></thead>
  <tbody>${purchaseRows}</tbody>
</table></div></div></div>` : ""}
<div class="note">Shared budget · View only</div>
</div>
<script type="application/json" id="bd">${chartJson}</script>
<script>${CHART_BOOT}</script>
<script>
function setD(m){
  document.body.className = m === "medium" ? "" : "density-" + m;
  document.querySelectorAll(".density-toggle button").forEach(function (b) { b.classList.toggle("active", b.dataset.d === m); });
}
window.addEventListener("scroll", function () {
  var h = document.getElementById("hdr");
  if (h) h.classList.toggle("slim", window.scrollY > 40);
}, { passive: true });
</script>
<div class="density-toggle">
  <button data-d="compact" onclick="setD('compact')">S</button>
  <button data-d="medium" class="active" onclick="setD('medium')">M</button>
  <button data-d="large" onclick="setD('large')">L</button>
</div>
</body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
};
