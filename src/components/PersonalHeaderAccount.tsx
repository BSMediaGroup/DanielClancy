import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";
import { fetchCustomerMe, type CustomerProfile } from "../lib/customerAccount";

export function PersonalHeaderAccount() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCustomerMe()
      .then((session) => {
        if (!cancelled && session.authenticated) setCustomer(session.customer);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const label = customer?.displayName || customer?.email || "Account";
  const avatarSrc = customer?.avatarUrl || shellAssets.profileIcon;
  const usesIconAvatar = !customer?.avatarUrl;

  return (
    <div className="account-menu">
      <Link
        aria-label={customer ? `Open customer account for ${label}` : "Open customer account"}
        className="account-menu__trigger"
        to="/account"
      >
        <span className="account-menu__avatar">
          <img
            alt=""
            className={usesIconAvatar ? "account-menu__avatar-image account-menu__avatar-image--icon" : "account-menu__avatar-image"}
            src={avatarSrc}
          />
        </span>
        <span className="account-menu__label">{label}</span>
      </Link>
    </div>
  );
}
