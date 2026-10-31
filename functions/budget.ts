// functions/budget.ts
export const onRequest: PagesFunction<{ BUDGET_SECRET: string }> = async (context) => {
  const { request, env } = context;

  if (request.method === "POST") {
    const form = await request.formData();
    const password = form.get("password")?.toString() || "";
    if (password === env.BUDGET_SECRET) {
      const headers = new Headers();
      headers.set("Set-Cookie", `budget_auth=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
      headers.set("Location", "/budget");
      return new Response(null, { status: 302, headers });
    }
    return new Response("Wrong password", { status: 401 });
  }

  const url = new URL(request.url);
  const forceLogin = url.searchParams.get("login") === "1";
  const cookie = request.headers.get("Cookie") || "";
  if (forceLogin || !cookie.includes("budget_auth=1")) {
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Budget Login</title>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600&family=Source+Sans+3:wght@650&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{background:#07090d;color:#f0f3f6;font-family:Blinker,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  form{background:#161b22;padding:36px 32px;border-radius:16px;border:1px solid #2a3038;text-align:center;width:320px;max-width:90vw}
  h2{font-family:"Source Sans 3",sans-serif;font-weight:650;font-size:1.4rem;margin:0 0 20px}
  input{background:#0d1117;border:1px solid #2a3038;color:#f0f3f6;padding:12px 14px;border-radius:8px;width:100%;font-family:inherit;font-size:1rem}
  input:focus{outline:none;border-color:#5b9cf5}
  button{background:#5b9cf5;color:#fff;border:none;padding:12px 18px;border-radius:8px;margin-top:14px;cursor:pointer;width:100%;font-family:inherit;font-weight:600}
  button:hover{filter:brightness(1.08)}
</style>
</head>
<body>
  <form method="POST">
    <h2>Budget</h2>
    <input type="password" name="password" placeholder="Password" autofocus required>
    <button type="submit">Unlock</button>
  </form>
</body>
</html>`, { headers: { "Content-Type": "text/html" } });
  }

  return context.next();
};
