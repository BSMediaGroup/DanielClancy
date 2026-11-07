// functions/tsweek.ts
export const onRequest: PagesFunction<{ TSWEEK_PASSWORD: string }> = async (context) => {
  const { request, env } = context;

  if (request.method === "POST") {
    const form = await request.formData();
    const password = form.get("password")?.toString() || "";
    const expected = env.TSWEEK_PASSWORD || "";
    if (expected && (password === expected || password.trim() === expected.trim())) {
      const headers = new Headers();
      headers.set("Set-Cookie", `tsweek_auth=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
      headers.set("Location", "/tsweek");
      return new Response(null, { status: 302, headers });
    }
    const headers = new Headers();
    headers.set("Location", "/tsweek?login=1&e=1");
    return new Response(null, { status: 302, headers });
  }

  const url = new URL(request.url);
  const forceLogin = url.searchParams.get("login") === "1";
  const wrong = url.searchParams.get("e") === "1";
  const cookie = request.headers.get("Cookie") || "";
  const authed = cookie.includes("tsweek_auth=1");
  if (forceLogin || !authed) {
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Timesheet Login</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&family=Source+Sans+3:wght@650;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f4f7fb;
    font-family: "Blinker", "Segoe UI", sans-serif;
    background:
      radial-gradient(900px 420px at 15% -10%, rgba(90,140,220,.2), transparent 60%),
      radial-gradient(700px 380px at 100% 0%, rgba(124,92,196,.12), transparent 55%),
      #07090d;
  }
  form {
    width: min(380px, 92vw);
    text-align: left;
    padding: 28px 26px 24px;
    border-radius: 18px;
    border: 1px solid rgba(186,206,230,.16);
    background:
      linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.012) 40%, transparent),
      #121820;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 24px 60px rgba(0,0,0,.5);
  }
  img { width: 52px; height: 52px; display: block; margin-bottom: 14px; }
  .kicker { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: #8b97a6; margin-bottom: 6px; }
  h2 {
    font-family: "Source Sans 3", "Segoe UI", sans-serif;
    font-weight: 800;
    font-size: 1.45rem;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
  }
  p { margin: 0 0 16px; color: #8b97a6; font-size: .9rem; }
  .err { color: #ff6b63; font-size: .85rem; margin: -8px 0 12px; }
  input {
    background: #0c1016;
    border: 1px solid rgba(176,196,220,.16);
    color: #f4f7fb;
    padding: 12px 14px;
    border-radius: 10px;
    width: 100%;
    font-family: inherit;
    font-size: 1rem;
  }
  input:focus { outline: none; border-color: #7eb0ff; box-shadow: 0 0 0 3px rgba(126,176,255,.22); }
  button {
    background: linear-gradient(180deg, #9ec2ff, #4f86ee);
    color: #fff;
    border: 1px solid rgba(190,214,255,.7);
    padding: 12px 18px;
    border-radius: 10px;
    margin-top: 14px;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    font-weight: 650;
    font-size: .95rem;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(79,134,238,.28);
  }
  button:hover { filter: brightness(1.06); }
</style>
</head>
<body>
  <form method="POST">
    <img src="https://raw.githubusercontent.com/BSMediaGroup/DanielClancy/refs/heads/main/assets/logos/logomatteblue.webp" alt="">
    <div class="kicker">Greg Natale Design</div>
    <h2>Timesheet</h2>
    <p>Sign in to the global ledger.</p>
    ${wrong ? '<div class="err">Incorrect password.</div>' : ""}
    <input type="password" name="password" placeholder="Password" autofocus required>
    <button type="submit">Unlock</button>
  </form>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
  }

  return context.next();
};
