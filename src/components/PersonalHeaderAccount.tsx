import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";
import { fetchCustomerMe, logoutCustomer, startCustomerLogin, type CustomerProfile } from "../lib/customerAccount";
import { cartCount, loadCart } from "../lib/merchCart";

type MenuIconName =
  | "account"
  | "address"
  | "cart"
  | "contact"
  | "login"
  | "logout"
  | "orders"
  | "payments"
  | "preferences"
  | "profile";

type AccountMenuItem = {
  to?: string;
  label: string;
  icon: MenuIconName;
  action?: "login";
};

const loggedOutItems: AccountMenuItem[] = [
  { label: "Login", icon: "login", action: "login" },
  { to: "/account", label: "Account", icon: "account" },
  { to: "/cart", label: "Cart", icon: "cart" },
  { to: "/shop", label: "Shop", icon: "cart" },
  { to: "/account/orders", label: "Orders / Purchase history", icon: "orders" },
  { to: "/contact", label: "Contact / help", icon: "contact" },
];

const loggedInItems: AccountMenuItem[] = [
  { to: "/account", label: "Account overview", icon: "account" },
  { to: "/account/profile", label: "Profile", icon: "profile" },
  { to: "/account/orders", label: "Orders", icon: "orders" },
  { to: "/account/addresses", label: "Addresses", icon: "address" },
  { to: "/account/preferences", label: "Preferences", icon: "preferences" },
  { to: "/account/payments", label: "Payments", icon: "payments" },
  { to: "/cart", label: "Cart", icon: "cart" },
];

export function PersonalHeaderCartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => {
      try {
        setCount(cartCount(loadCart()));
      } catch {
        setCount(0);
      }
    };

    refreshCount();
    window.addEventListener("danielclancy:cart-updated", refreshCount);
    window.addEventListener("storage", refreshCount);
    window.addEventListener("focus", refreshCount);

    return () => {
      window.removeEventListener("danielclancy:cart-updated", refreshCount);
      window.removeEventListener("storage", refreshCount);
      window.removeEventListener("focus", refreshCount);
    };
  }, []);

  const countLabel = count > 99 ? "99+" : String(count);
  const ariaLabel = count > 0 ? `View cart, ${count} item${count === 1 ? "" : "s"}` : "View cart";

  return (
    <Link aria-label={ariaLabel} className="personal-cart-button" to="/cart">
      <span className="personal-cart-button__icon" aria-hidden="true">
        <CartGlyph />
      </span>
      {count > 0 ? <span className="personal-cart-button__badge">{countLabel}</span> : null}
    </Link>
  );
}

export function PersonalHeaderAccount({ surface = "personal" }: { surface?: "personal" | "watch" } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshSession = useCallback((signal?: AbortSignal) => {
    return fetchCustomerMe(signal)
      .then((session) => {
        setCustomer(session.authenticated ? session.customer : null);
        setSessionChecked(true);
      })
      .catch(() => {
        setCustomer(null);
        setSessionChecked(true);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshSession(controller.signal);
    return () => controller.abort();
  }, [refreshSession]);

  useEffect(() => {
    const refreshOnSignal = () => {
      void refreshSession();
    };

    window.addEventListener("focus", refreshOnSignal);
    window.addEventListener("danielclancy:customer-session-updated", refreshOnSignal);
    return () => {
      window.removeEventListener("focus", refreshOnSignal);
      window.removeEventListener("danielclancy:customer-session-updated", refreshOnSignal);
    };
  }, [refreshSession]);

  useEffect(() => {
    setIsOpen(false);
    setError("");
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const signedIn = Boolean(customer);
  const label = resolveCustomerLabel(customer);
  const identity = customer?.email || (sessionChecked ? "Not signed in" : "Checking session");
  const initials = resolveCustomerInitials(customer);
  const avatarSrc = customer?.avatarUrl || "";
  const items = signedIn ? loggedInItems : loggedOutItems;

  async function handleLogout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setError("");
    try {
      await logoutCustomer();
      setCustomer(null);
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent("danielclancy:customer-session-updated"));
      if (location.pathname.startsWith("/account")) {
        navigate("/account/login");
      }
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Logout failed. Try again shortly.");
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className={`account-menu account-menu--${surface}${isOpen ? " account-menu--open" : ""}`} ref={rootRef}>
      <button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={signedIn ? `Open customer account menu for ${label}` : "Open customer account menu"}
        className="account-menu__trigger"
        type="button"
        onClick={() => {
          setError("");
          setIsOpen((current) => !current);
        }}
      >
        <AccountAvatar avatarSrc={avatarSrc} initials={initials} signedIn={signedIn} />
        <span className="account-menu__trigger-copy">
          <span className="account-menu__label">{label}</span>
          <span className="account-menu__identity">{identity}</span>
        </span>
      </button>

      <div className="account-menu__panel" hidden={!isOpen} id={menuId} role="menu" aria-label="Customer account menu">
        <div className="account-menu__overview">
          <AccountAvatar avatarSrc={avatarSrc} initials={initials} signedIn={signedIn} large />
          <div className="account-menu__overview-copy">
            <span>{signedIn ? "Signed in" : "Customer account"}</span>
            <strong>{label}</strong>
            <small>{identity}</small>
          </div>
        </div>

        <div className="account-menu__items">
          {items.map((item) => (
            item.action === "login" ? (
              <button
                className="account-menu__item"
                key={item.label}
                role="menuitem"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setLoginOpen(true);
                }}
              >
                <MenuIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ) : (
              <Link className="account-menu__item" key={item.to} role="menuitem" to={item.to || "/account"} onClick={() => setIsOpen(false)}>
                <MenuIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </div>

        {signedIn ? (
          <>
            <div className="account-menu__divider" role="separator" aria-hidden="true" />
            <button className="account-menu__item account-menu__item--logout" disabled={logoutBusy} role="menuitem" type="button" onClick={handleLogout}>
              <MenuIcon name="logout" />
              <span>{logoutBusy ? "Logging out..." : "Logout"}</span>
            </button>
          </>
        ) : null}

        {error ? <p className="account-menu__error" role="status">{error}</p> : null}
      </div>
      <CustomerLoginModal open={loginOpen} returnTo={location.pathname || "/account"} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

export function CustomerLoginModal({
  open,
  returnTo = "/account",
  onClose,
}: {
  open: boolean;
  returnTo?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="customer-login-modal-title">
      <button className="login-modal__scrim" type="button" aria-label="Close login dialog" onClick={onClose} />
      <CustomerLoginPanel
        id="customer-login-modal-title"
        returnTo={returnTo}
        onClose={onClose}
      />
    </div>
  );
}

export function CustomerLoginPanel({
  id = "customer-login-title",
  returnTo = "/account",
  onClose,
}: {
  id?: string;
  returnTo?: string;
  onClose?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Enter your email to request a secure login link.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await startCustomerLogin(email, safeReturnTo(returnTo));
      setStatus(response.message || "Check your email for the DanielClancy.net login link.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login link could not be requested.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login-modal__panel" aria-labelledby={id}>
      {onClose ? (
        <button className="login-modal__close" type="button" aria-label="Close login dialog" onClick={onClose}>
          x
        </button>
      ) : null}
      <header className="login-modal__header">
        <span className="login-modal__brand-mark" aria-hidden="true">
          <img alt="" src={shellAssets.danielLogo} />
        </span>
        <h2 id={id}>Login to DanielClancy.net</h2>
        <p>Customer sessions use a secure email link and a server-managed session cookie.</p>
      </header>

      <form className="login-modal__form" onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button className="button" type="submit" disabled={busy}>{busy ? "Sending..." : "Send login link"}</button>
      </form>

      <div className={`login-modal__status${error ? " login-modal__status--error" : ""}`} role="status" aria-live="polite">
        <strong>{error ? "Login failed" : "Passwordless login"}</strong>
        <span>{error || status}</span>
      </div>

      <Link className="button button--ghost login-modal__admin-link" to="/account">
        Account overview
      </Link>
      <p className="login-modal__legal-links">
        <Link to="/privacy">Privacy</Link>
        <span aria-hidden="true">/</span>
        <Link to="/terms">Terms</Link>
      </p>
    </section>
  );
}

function AccountAvatar({ avatarSrc, initials, signedIn, large = false }: { avatarSrc: string; initials: string; signedIn: boolean; large?: boolean }) {
  const className = `account-menu__avatar${large ? " account-menu__avatar--large" : ""}`;

  if (avatarSrc) {
    return (
      <span className={className}>
        <img alt="" className="account-menu__avatar-image" src={avatarSrc} />
      </span>
    );
  }

  if (signedIn) {
    return <span className={`${className} account-menu__avatar--initials`} aria-hidden="true">{initials}</span>;
  }

  return (
    <span className={className}>
      <img alt="" className="account-menu__avatar-image account-menu__avatar-image--icon" src={shellAssets.profileIcon} />
    </span>
  );
}

function resolveCustomerLabel(customer: CustomerProfile | null) {
  if (!customer) return "MORE";
  const displayName = customer.displayName?.trim();
  if (displayName) return displayName;
  const emailPrefix = customer.email?.split("@")[0]?.trim();
  return emailPrefix || "Customer";
}

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function resolveCustomerInitials(customer: CustomerProfile | null) {
  const source = resolveCustomerLabel(customer);
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase() || "DC";
}

function MenuIcon({ name }: { name: MenuIconName }) {
  return (
    <span className="account-menu__item-icon" aria-hidden="true">
      <IconGlyph name={name} />
    </span>
  );
}

function CartGlyph() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M7.1 20.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm10 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM3.2 4.1h2.2l2 9.7c.2.8.9 1.4 1.7 1.4h7.6c.8 0 1.5-.5 1.7-1.2l1.8-6.2H7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function IconGlyph({ name }: { name: MenuIconName }) {
  if (name === "cart") return <CartGlyph />;
  if (name === "logout") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M10 6.5V5.2c0-.9.7-1.7 1.7-1.7h5.1c.9 0 1.7.7 1.7 1.7v13.6c0 .9-.7 1.7-1.7 1.7h-5.1c-.9 0-1.7-.7-1.7-1.7v-1.3M14 12H4m0 0 3-3m-3 3 3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "address") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 21s6.5-5.2 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.8 12 21 12 21Zm0-8.6a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "orders") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M7.2 3.8h9.6l2 3.9v12H5.2v-12l2-3.9Zm-2 3.9h13.6M9 11.2h6M9 15.2h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "payments") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M4 7.2c0-.9.7-1.6 1.6-1.6h12.8c.9 0 1.6.7 1.6 1.6v9.6c0 .9-.7 1.6-1.6 1.6H5.6c-.9 0-1.6-.7-1.6-1.6V7.2Zm0 3.1h16M7.2 15.2h3.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "preferences") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M4.5 7h15M7 7v10m10-10v10M4.5 17h15M12 4v16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "contact") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M4.5 6.5c0-1 .8-1.8 1.8-1.8h11.4c1 0 1.8.8 1.8 1.8v7.6c0 1-.8 1.8-1.8 1.8h-6.1L7.3 20v-4.1h-1c-1 0-1.8-.8-1.8-1.8V6.5Zm4 2.8h7M8.5 12h4.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "login") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M14 6.5V5.2c0-.9-.7-1.7-1.7-1.7H7.2c-.9 0-1.7.7-1.7 1.7v13.6c0 .9.7 1.7 1.7 1.7h5.1c.9 0 1.7-.7 1.7-1.7v-1.3M10 12h10m0 0-3-3m3 3-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Zm-7 7.3c.8-3.6 3.3-5.5 7-5.5s6.2 1.9 7 5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
