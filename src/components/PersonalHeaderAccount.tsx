import { useEffect, useMemo, useState, type FormEvent } from "react";
import { shellAssets } from "../content/brandAssets";

type AccountState =
  | {
      isLoggedIn: false;
    }
  | {
      isLoggedIn: true;
      username: string;
      avatarSrc?: string | null;
    };

type AuthSession = {
  authenticated?: boolean;
  email?: string;
  display_name?: string;
  provider?: string;
  account_type?: string;
  is_admin?: boolean;
};

const AUTH_ORIGIN =
  (import.meta.env.VITE_DC_AUTH_ORIGIN as string | undefined)?.replace(/\/+$/, "") ||
  "https://admin.danielclancy.net";

function getAccountState(session: AuthSession | null): AccountState {
  if (!session?.authenticated) return { isLoggedIn: false };
  return {
    isLoggedIn: true,
    username: session.display_name || session.email || "Signed in",
    avatarSrc: null
  };
}

export function PersonalHeaderAccount() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Account-aware public content is planned. Admin access is restricted.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = getAccountState(session);
  const usesIconAvatar = !account.isLoggedIn || !account.avatarSrc;
  const avatarSrc = account.isLoggedIn
    ? account.avatarSrc || shellAssets.profileIcon
    : shellAssets.keyIcon;
  const oauthLinks = useMemo(
    () => [
      { label: "Continue with GitHub", href: `${AUTH_ORIGIN}/api/auth/oauth/github/start` },
      { label: "Continue with Google", href: `${AUTH_ORIGIN}/api/auth/oauth/google/start` },
      { label: "Continue with Twitter/X", href: `${AUTH_ORIGIN}/api/auth/oauth/twitter/start` },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`${AUTH_ORIGIN}/api/auth/session`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled) setSession(payload?.session || null);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isModalOpen]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setStatus("Enter both email and password to continue.");
      return;
    }
    setIsSubmitting(true);
    setStatus("Checking server-side admin credentials...");
    try {
      const response = await fetch(`${AUTH_ORIGIN}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.session) {
        setStatus("Sign in failed. Check the email/password pair and Cloudflare auth configuration.");
        return;
      }
      setSession(payload.session);
      setStatus("Signed in. Admin dashboard access still requires an admin session on the admin origin.");
      setPassword("");
    } catch {
      setStatus("Auth endpoint is not reachable yet. Cloudflare Pages/DNS setup may still be pending.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${AUTH_ORIGIN}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // The local UI can still clear its non-authoritative session preview.
    }
    setSession(null);
    setStatus("Signed out locally. Server cookie logout is handled by the auth endpoint when reachable.");
  }

  return (
    <>
      <div className="account-menu">
        <button
        aria-label={account.isLoggedIn ? `Open account menu for ${account.username}` : "Open personal studio account menu"}
        className="account-menu__trigger"
          type="button"
          onClick={() => setIsModalOpen(true)}
      >
        <span className="account-menu__avatar">
          <img
            alt=""
            className={usesIconAvatar ? "account-menu__avatar-image account-menu__avatar-image--icon" : "account-menu__avatar-image"}
            src={avatarSrc}
          />
        </span>
        {account.isLoggedIn ? <span className="account-menu__label">{account.username}</span> : null}
        </button>
      </div>

      {isModalOpen ? (
        <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
          <button className="login-modal__scrim" type="button" aria-label="Close login" onClick={() => setIsModalOpen(false)} />
          <section className="login-modal__panel">
            <button className="login-modal__close" type="button" aria-label="Close login" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            <div className="login-modal__header">
              <p className="kicker">DanielClancy.net account</p>
              <h2 id="login-modal-title">Sign in</h2>
              <p>
                Public account-aware content is planned. Admin dashboard access is restricted to
                explicitly approved admin sessions.
              </p>
            </div>

            <div className="login-modal__providers">
              {oauthLinks.map((link) => (
                <a key={link.label} className="button button--secondary" href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>

            <form className="login-modal__form" onSubmit={handleEmailLogin}>
              <label>
                <span>Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
              </label>
              <label>
                <span>Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                />
              </label>
              <button className="button button--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="login-modal__status" role="status" aria-live="polite">
              {session?.authenticated ? (
                <>
                  <strong>{session.email || session.display_name || "Signed in"}</strong>
                  <span>{session.is_admin ? "Admin session" : "Regular public session"}</span>
                  <button className="button button--ghost" type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <span>{status}</span>
              )}
            </div>

            <a className="button button--ghost login-modal__admin-link" href="https://admin.danielclancy.net">
              Admin Dashboard
            </a>
            <p className="login-modal__note">
              OAuth buttons require Cloudflare env vars and provider redirect URIs before live testing.
              Manual admin passwords are checked only by the server-side Pages Function.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
