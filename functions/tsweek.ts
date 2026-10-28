// functions/tsweek.ts
export const onRequest: PagesFunction<{ TSWEEK_PASSWORD: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Allow the login POST
  if (request.method === "POST") {
    const form = await request.formData();
    const password = form.get("password")?.toString() || "";
    if (password === env.TSWEEK_PASSWORD) {
      // Set a simple signed cookie (or just a long-lived one for this use case)
      const headers = new Headers();
      headers.set("Set-Cookie", `tsweek_auth=1; Path=/tsweek; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
      headers.set("Location", "/tsweek");
      return new Response(null, { status: 302, headers });
    }
    return new Response("Wrong password", { status: 401 });
  }

  // Check cookie
  const cookie = request.headers.get("Cookie") || "";
  if (!cookie.includes("tsweek_auth=1")) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Timesheet Login</title>
      <style>
        body { background:#07090d; color:#f0f3f6; font-family:system-ui; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
        form { background:#161b22; padding:32px; border-radius:12px; border:1px solid #2a3038; }
        input { background:#0d1117; border:1px solid #2a3038; color:#fff; padding:10px 12px; border-radius:6px; width:220px; }
        button { background:#5b9cf5; color:#fff; border:none; padding:10px 18px; border-radius:6px; margin-top:12px; cursor:pointer; width:100%; }
      </style>
      </head>
      <body>
        <form method="POST">
          <h2 style="margin:0 0 16px">Timesheet</h2>
          <input type="password" name="password" placeholder="Password" autofocus required>
          <button type="submit">Unlock</button>
        </form>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }

  // Authenticated — serve the static HTML
  return context.next();
};