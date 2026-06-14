import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { shellAssets, socialIcons } from "../content/brandAssets";

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

type AuthMode = "signin" | "signup";

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
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sign in or create an account for DanielClancy.net. Admin access is restricted.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = getAccountState(session);
  const usesIconAvatar = !account.isLoggedIn || !account.avatarSrc;
  const avatarSrc = account.isLoggedIn
    ? account.avatarSrc || shellAssets.profileIcon
    : shellAssets.keyIcon;
  const oauthLinks = useMemo(
    () => [
      { provider: "github", icon: socialIcons.github, signinLabel: "Continue with GitHub", signupLabel: "Sign up with GitHub", href: `${AUTH_ORIGIN}/api/auth/oauth/github/start` },
      { provider: "google", icon: socialIcons.google, signinLabel: "Continue with Google", signupLabel: "Sign up with Google", href: `${AUTH_ORIGIN}/api/auth/oauth/google/start` },
      { provider: "twitter", icon: socialIcons.x, signinLabel: "Continue with Twitter/X", signupLabel: "Sign up with Twitter/X", href: `${AUTH_ORIGIN}/api/auth/oauth/twitter/start` },
    ],
    [],
  );

  const heading = mode === "signin" ? "Sign in" : "Create account";
  const emailToggleLabel = mode === "signin" ? "Use email instead" : "Use email signup";

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
    if (mode === "signup") {
      setIsSubmitting(true);
      setStatus("Email signup is not available yet.");
      try {
        const response = await fetch(`${AUTH_ORIGIN}/api/auth/signup`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const payload = await response.json().catch(() => null);
        setStatus(payload?.message || "Email signup is not available yet.");
        if (response.ok && payload?.session) setSession(payload.session);
      } catch {
        setStatus("Email signup is not available yet.");
      } finally {
        setIsSubmitting(false);
        setPassword("");
      }
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
        setStatus("Sign in failed. Check the email/password pair and try again.");
        return;
      }
      setSession(payload.session);
      setStatus(
        payload.session.is_admin
          ? "Signed in with an admin session. Open the admin dashboard when ready."
          : "Signed in as a regular public account. Admin dashboard access still requires explicit admin authority."
      );
      setPassword("");
    } catch {
      setStatus("Sign in is not reachable right now. Try again later.");
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

  const loginModal =
    isModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
            <button className="login-modal__scrim" type="button" aria-label="Close login" onClick={() => setIsModalOpen(false)} />
            <section className="login-modal__panel">
              <button className="login-modal__close" type="button" aria-label="Close login" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
              <div className="login-modal__header">
                <span className="login-modal__brand-mark" aria-hidden="true">
                  <img src={shellAssets.logoWebp} alt="" />
                </span>
                <p className="kicker">DanielClancy.net account</p>
                <h2 id="login-modal-title">{heading}</h2>
                <p>
                  {mode === "signin"
                    ? "Sign in or create an account for DanielClancy.net. Admin access is restricted."
                    : "Create an account for DanielClancy.net. Admin access is restricted."}
                </p>
              </div>

              <div className="login-modal__tabs" role="tablist" aria-label="Account mode">
                <button
                  className={mode === "signin" ? "login-modal__tab login-modal__tab--active" : "login-modal__tab"}
                  type="button"
                  aria-pressed={mode === "signin"}
                  onClick={() => {
                    setMode("signin");
                    setStatus("Sign in or create an account for DanielClancy.net. Admin access is restricted.");
                  }}
                >
                  Sign in
                </button>
                <button
                  className={mode === "signup" ? "login-modal__tab login-modal__tab--active" : "login-modal__tab"}
                  type="button"
                  aria-pressed={mode === "signup"}
                  onClick={() => {
                    setMode("signup");
                    setStatus("Create an account for DanielClancy.net. Admin access is restricted.");
                  }}
                >
                  Create account
                </button>
              </div>

              <div className="login-modal__providers">
                {oauthLinks.map((link) => (
                  <a key={link.provider} className="button button--secondary login-modal__provider" href={link.href}>
                    <img className="login-modal__provider-icon" src={link.icon} alt="" />
                    <span>{mode === "signin" ? link.signinLabel : link.signupLabel}</span>
                  </a>
                ))}
              </div>

              <div className="login-modal__divider"><span>or</span></div>

              <div className="login-modal__email">
                <button
                  className="login-modal__email-toggle"
                  type="button"
                  aria-expanded={isEmailOpen}
                  onClick={() => setIsEmailOpen((value) => !value)}
                >
                  <span>{emailToggleLabel}</span>
                  <span aria-hidden="true">{isEmailOpen ? "-" : "+"}</span>
                </button>
                {isEmailOpen ? (
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
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      />
                    </label>
                    <button className="button button--primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Working..." : mode === "signin" ? "Sign in with email" : "Request email signup"}
                    </button>
                    {mode === "signup" ? (
                      <p className="login-modal__inline-note">Email signup is not available yet.</p>
                    ) : null}
                  </form>
                ) : null}
              </div>

              <div className="login-modal__status" role="status" aria-live="polite">
                {session?.authenticated ? (
                  <>
                    <strong>{session.email || session.display_name || "Signed in"}</strong>
                    <span>
                      {session.is_admin ? "Admin session" : "Regular public session"}
                      {session.provider ? ` via ${session.provider}` : ""}
                    </span>
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
              <p className="login-modal__note">Admin access is restricted.</p>
            </section>
          </div>,
          document.body,
        )
      : null;

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

      {loginModal}
    </>
  );
}
