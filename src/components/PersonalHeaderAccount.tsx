import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";
import { fetchCustomerMe, logoutCustomer, type CustomerProfile } from "../lib/customerAccount";
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
  to: string;
  label: string;
  icon: MenuIconName;
};

const loggedOutItems: AccountMenuItem[] = [
  { to: "/account/login", label: "Sign in / Create account", icon: "login" },
  { to: "/account", label: "Account overview", icon: "account" },
  { to: "/cart", label: "View cart", icon: "cart" },
  { to: "/account/orders", label: "Orders / purchase history", icon: "orders" },
  { to: "/contact", label: "Help / contact", icon: "contact" },
];

const loggedInItems: AccountMenuItem[] = [
  { to: "/account", label: "Account overview", icon: "account" },
  { to: "/account/profile", label: "Profile", icon: "profile" },
  { to: "/account/orders", label: "Orders / purchase history", icon: "orders" },
  { to: "/account/addresses", label: "Delivery addresses", icon: "address" },
  { to: "/account/preferences", label: "Preferences", icon: "preferences" },
  { to: "/account/payments", label: "Payment methods", icon: "payments" },
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

export function PersonalHeaderAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
      navigate("/account/login");
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Logout failed. Try again shortly.");
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className={`account-menu${isOpen ? " account-menu--open" : ""}`} ref={rootRef}>
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
            <Link className="account-menu__item" key={item.to} role="menuitem" to={item.to} onClick={() => setIsOpen(false)}>
              <MenuIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
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
    </div>
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
  if (!customer) return "Account";
  const displayName = customer.displayName?.trim();
  if (displayName) return displayName;
  const emailPrefix = customer.email?.split("@")[0]?.trim();
  return emailPrefix || "Customer";
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
