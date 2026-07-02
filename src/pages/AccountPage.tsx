import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CustomerLoginPanel } from "../components/PersonalHeaderAccount";
import { Seo } from "../components/Seo";
import {
  deleteCustomerAddress,
  fetchCustomerMe,
  fetchCustomerOrders,
  logoutCustomer,
  notifyCustomerSessionUpdated,
  openStripeCustomerPortal,
  saveCustomerAddress,
  updateCustomerPreferences,
  updateCustomerProfile,
  type CustomerAddress,
  type CustomerOrder,
  type CustomerProfile,
  type CustomerSessionResponse,
} from "../lib/customerAccount";

const blankAddress: Partial<CustomerAddress> = {
  label: "",
  name: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  postalCode: "",
  countryCode: "US",
  phone: "",
  isDefault: false,
};

const protectedAccountPaths: Record<string, string> = {
  "Delivery addresses": "/account/addresses",
  Orders: "/account/orders",
  Payments: "/account/payments",
  Preferences: "/account/preferences",
  Profile: "/account/profile",
};

function useCustomerSession() {
  const location = useLocation();
  const [session, setSession] = useState<CustomerSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void fetchCustomerMe(controller.signal)
      .then(setSession)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [location.pathname]);

  useEffect(() => {
    const refresh = (event?: Event) => {
      const detail = (event as CustomEvent<{ customer?: CustomerProfile | null }> | undefined)?.detail;
      if (detail && Object.prototype.hasOwnProperty.call(detail, "customer")) {
        setSession({ ok: true, authenticated: Boolean(detail.customer), customer: detail.customer || null });
        setLoading(false);
      }
      void fetchCustomerMe().then(setSession).finally(() => setLoading(false));
    };
    window.addEventListener("danielclancy:customer-session-updated", refresh);
    return () => window.removeEventListener("danielclancy:customer-session-updated", refresh);
  }, []);

  return { session, customer: session?.customer || null, loading };
}

export function AccountPage() {
  const { session, customer, loading } = useCustomerSession();
  const recentAddresses = customer?.addresses.slice(0, 2) || [];
  return (
    <>
      <Seo title="Account" description="DanielClancy.net customer account." path="/account" noIndex />
      <AccountHero title={customer ? "Your account" : "Customer account"} intro="Manage shop profile details, delivery addresses, order history, preferences, and secure Stripe payment settings." />
      <section className="account-section">
        <div className="container account-grid">
          {loading ? <AccountNotice title="Checking account" message="Loading customer session state..." /> : null}
          {!loading && !customer ? <LoginRequired session={session} /> : null}
          {customer ? (
            <>
              <AccountCard title="Profile" action={<Link to="/account/profile">Edit profile</Link>}>
                <AccountIdentity customer={customer} />
              </AccountCard>
              <AccountCard title="Recent orders" action={<Link to="/account/orders">View orders</Link>}>
                <RecentOrders />
              </AccountCard>
              <AccountCard title="Delivery addresses" action={<Link to="/account/addresses">Manage addresses</Link>}>
                {recentAddresses.length ? recentAddresses.map((address) => <AddressSummary address={address} key={address.id} />) : <p>No saved delivery addresses yet.</p>}
              </AccountCard>
              <AccountCard title="Preferences" action={<Link to="/account/preferences">Update preferences</Link>}>
                <p>{customer.marketingOptIn ? "Marketing and product updates are enabled." : "Marketing and product updates are off."}</p>
                <p>Order updates: {customer.contactPreferences.orderUpdates ? "enabled" : "off"}</p>
              </AccountCard>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}

export function AccountLoginPage() {
  const location = useLocation();
  const returnTo = safeReturnTo(location.state && typeof location.state === "object" && "returnTo" in location.state ? String(location.state.returnTo) : "/account");

  return (
    <>
      <Seo title="Account Login" description="Customer login for DanielClancy.net." path="/account/login" noIndex />
      <AccountHero title="Login to your customer account" intro="Use the same OAuth or manual email/password login panel as the Personal Studio header. Sessions are stored server-side in HttpOnly cookies." />
      <section className="account-section">
        <div className="container account-narrow">
          <CustomerLoginPanel returnTo={returnTo} />
        </div>
      </section>
    </>
  );
}

export function AccountProfilePage() {
  const { session, customer, loading } = useCustomerSession();
  const [form, setForm] = useState({ displayName: "", avatarUrl: "", phone: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (customer) setForm({ displayName: customer.displayName || "", avatarUrl: customer.avatarUrl || "", phone: customer.phone || "" });
  }, [customer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await updateCustomerProfile(form);
      setForm({ displayName: response.customer.displayName || "", avatarUrl: response.customer.avatarUrl || "", phone: response.customer.phone || "" });
      notifyCustomerSessionUpdated(response.customer);
      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return <ProtectedAccountPage title="Profile" loading={loading} customer={customer} session={session}>
    <form className="account-panel account-form" onSubmit={handleSubmit}>
      <label><span>Email login identity</span><input className="input" value={customer?.email || ""} readOnly /></label>
      <label><span>Display name</span><input className="input" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
      <label><span>Avatar URL</span><input className="input" type="url" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://..." /></label>
      <label><span>Phone (optional)</span><input className="input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <button className="button" type="submit" disabled={busy}>{busy ? "Saving..." : "Save profile"}</button>
      <p className="form-status">{status || "Avatar uploads are not enabled on the public storefront yet; use a HTTPS image URL."}</p>
    </form>
  </ProtectedAccountPage>;
}

export function AccountPreferencesPage() {
  const { session, customer, loading } = useCustomerSession();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState({ marketingOptIn: false, marketing: false, productDrops: false, orderUpdates: true, newsletter: false });

  useEffect(() => {
    if (customer) setValues({ marketingOptIn: customer.marketingOptIn, ...customer.contactPreferences });
  }, [customer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await updateCustomerPreferences(values);
      setStatus("Preferences saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Preferences could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return <ProtectedAccountPage title="Preferences" loading={loading} customer={customer} session={session}>
    <form className="account-panel account-form" onSubmit={handleSubmit}>
      <Checkbox label="Marketing opt-in" checked={values.marketingOptIn} onChange={(checked) => setValues({ ...values, marketingOptIn: checked, marketing: checked })} />
      <Checkbox label="Product drop updates" checked={values.productDrops} onChange={(checked) => setValues({ ...values, productDrops: checked })} />
      <Checkbox label="Order update emails" checked={values.orderUpdates} onChange={(checked) => setValues({ ...values, orderUpdates: checked })} />
      <Checkbox label="Newsletter" checked={values.newsletter} onChange={(checked) => setValues({ ...values, newsletter: checked })} />
      <button className="button" type="submit" disabled={busy}>{busy ? "Saving..." : "Save preferences"}</button>
      {status ? <p className="form-status">{status}</p> : null}
    </form>
  </ProtectedAccountPage>;
}

export function AccountAddressesPage() {
  const { session, customer, loading } = useCustomerSession();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [draft, setDraft] = useState<Partial<CustomerAddress>>(blankAddress);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (customer) setAddresses(customer.addresses);
  }, [customer]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await saveCustomerAddress(draft);
      setAddresses(response.addresses);
      setDraft(blankAddress);
      setStatus("Address saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Address could not be saved.");
    }
  }

  async function handleDelete(id: string) {
    const response = await deleteCustomerAddress(id);
    setAddresses(response.addresses);
  }

  return <ProtectedAccountPage title="Delivery addresses" loading={loading} customer={customer} session={session}>
    <div className="account-grid account-grid--split">
      <div className="account-panel">
        <h2>Saved addresses</h2>
        {addresses.length ? addresses.map((address) => (
          <div className="account-address-row" key={address.id}>
            <AddressSummary address={address} />
            <div className="account-row-actions">
              <button className="button button--ghost" type="button" onClick={() => setDraft(address)}>Edit</button>
              <button className="button button--ghost" type="button" onClick={() => handleDelete(address.id)}>Delete</button>
            </div>
          </div>
        )) : <p>No saved delivery addresses yet.</p>}
      </div>
      <form className="account-panel account-form" onSubmit={handleSave}>
        <h2>{draft.id ? "Edit address" : "Add address"}</h2>
        <AddressInput label="Label" value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} />
        <AddressInput label="Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} required />
        <AddressInput label="Address line 1" value={draft.address1} onChange={(value) => setDraft({ ...draft, address1: value })} required />
        <AddressInput label="Address line 2" value={draft.address2} onChange={(value) => setDraft({ ...draft, address2: value })} />
        <AddressInput label="City" value={draft.city} onChange={(value) => setDraft({ ...draft, city: value })} required />
        <AddressInput label="Region / state" value={draft.region} onChange={(value) => setDraft({ ...draft, region: value })} />
        <AddressInput label="Postal code" value={draft.postalCode} onChange={(value) => setDraft({ ...draft, postalCode: value })} required />
        <AddressInput label="Country code" value={draft.countryCode} onChange={(value) => setDraft({ ...draft, countryCode: value.toUpperCase() })} required />
        <Checkbox label="Default delivery address" checked={Boolean(draft.isDefault)} onChange={(checked) => setDraft({ ...draft, isDefault: checked })} />
        <button className="button" type="submit">Save address</button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </div>
  </ProtectedAccountPage>;
}

export function AccountOrdersPage() {
  const { session, customer, loading } = useCustomerSession();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState("Loading order history...");

  useEffect(() => {
    if (!customer) return;
    const controller = new AbortController();
    fetchCustomerOrders(controller.signal)
      .then((payload) => {
        setOrders(payload.orders || []);
        setStatus(payload.orders?.length ? "Order history loaded." : "No linked merch orders yet.");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Order history is unavailable."));
    return () => controller.abort();
  }, [customer]);

  return <ProtectedAccountPage title="Orders" loading={loading} customer={customer} session={session}>
    <div className="account-panel">
      <p className="form-status">{status}</p>
      <div className="account-order-list">
        {orders.map((order) => <OrderRow order={order} key={order.id} />)}
      </div>
    </div>
  </ProtectedAccountPage>;
}

export function AccountPaymentsPage() {
  const { session, customer, loading } = useCustomerSession();
  const [status, setStatus] = useState("Payment methods are managed through Stripe-hosted customer tools.");
  const [busy, setBusy] = useState(false);

  async function handlePortal() {
    setBusy(true);
    try {
      const response = await openStripeCustomerPortal();
      window.location.assign(response.url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Stripe Customer Portal is not configured yet.");
    } finally {
      setBusy(false);
    }
  }

  return <ProtectedAccountPage title="Payments" loading={loading} customer={customer} session={session}>
    <div className="account-panel">
      <h2>Stripe payment methods</h2>
      <p>DanielClancy.net does not store card numbers, CVC values, or raw payment method payloads.</p>
      <p>{customer?.stripeCustomerMapped ? "A Stripe customer mapping exists for this account." : "A Stripe customer mapping will be created when checkout or the portal can safely do so."}</p>
      <button className="button" type="button" onClick={handlePortal} disabled={busy}>{busy ? "Opening..." : "Manage payment methods"}</button>
      <p className="form-status">{status}</p>
    </div>
  </ProtectedAccountPage>;
}

export function AccountLogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    logoutCustomer().finally(() => navigate("/account/login", { replace: true }));
  }, [navigate]);
  return <AccountHero title="Signing out" intro="Clearing the customer session cookie." />;
}

function ProtectedAccountPage({ title, loading, customer, session, children }: { title: string; loading: boolean; customer: CustomerProfile | null; session: CustomerSessionResponse | null; children: ReactNode }) {
  return (
    <>
      <Seo title={`Account ${title}`} description={`DanielClancy.net account ${title.toLowerCase()}.`} path={protectedAccountPaths[title] || "/account"} noIndex />
      <AccountHero title={title} intro="Customer account tools for the Personal Studio shop." />
      <section className="account-section"><div className="container">{loading ? <AccountNotice title="Checking account" message="Loading customer session state..." /> : customer ? children : <LoginRequired session={session} />}</div></section>
    </>
  );
}

function LoginRequired({ session }: { session: CustomerSessionResponse | null }) {
  const message = session?.message || "Login before managing this customer account page.";
  return <AccountNotice title={session?.requiredBinding ? "Configuration needed" : "Sign in required"} message={message} action={<Link className="button" to="/account/login">Sign in</Link>} />;
}

function AccountHero({ title, intro }: { title: string; intro: string }) {
  return <section className="account-hero"><div className="container account-hero__inner"><p className="kicker">Personal Studio account</p><h1>{title}</h1><p>{intro}</p><AccountNav /></div></section>;
}

function AccountNav() {
  const links = ["/account", "/account/profile", "/account/orders", "/account/addresses", "/account/preferences", "/account/payments"];
  return <nav className="account-tabs" aria-label="Account sections">{links.map((path) => <Link key={path} to={path}>{path === "/account" ? "Overview" : path.split("/").pop()}</Link>)}</nav>;
}

function AccountCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <article className="account-panel"><header className="account-panel__header"><h2>{title}</h2>{action}</header>{children}</article>;
}

function AccountIdentity({ customer }: { customer: CustomerProfile }) {
  return <div className="account-identity">{customer.avatarUrl ? <img src={customer.avatarUrl} alt="" /> : <span aria-hidden="true">{(customer.displayName || customer.email || "?").slice(0, 1).toUpperCase()}</span>}<div><strong>{customer.displayName || "Customer"}</strong><p>{customer.email}</p></div></div>;
}

function RecentOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetchCustomerOrders(controller.signal).then((payload) => setOrders(payload.orders.slice(0, 3))).catch(() => setOrders([]));
    return () => controller.abort();
  }, []);
  return orders.length ? <div className="account-order-list">{orders.map((order) => <OrderRow compact order={order} key={order.id} />)}</div> : <p>No linked merch orders yet.</p>;
}

function AddressSummary({ address }: { address: CustomerAddress }) {
  return <div className="account-address-summary"><strong>{address.label || address.name}{address.isDefault ? " · Default" : ""}</strong><span>{address.address1}{address.address2 ? `, ${address.address2}` : ""}</span><span>{address.city}, {address.region} {address.postalCode} · {address.countryCode}</span></div>;
}

function OrderRow({ order, compact = false }: { order: CustomerOrder; compact?: boolean }) {
  const items = order.items.map((item) => `${item.quantity}x ${item.title}`).join("; ");
  return <article className="account-order-row"><div><strong>{order.id}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></div><div><span>{order.status}</span>{compact ? null : <small>{items || order.message}</small>}</div></article>;
}

function AccountNotice({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <div className="account-panel account-notice"><h2>{title}</h2><p>{message}</p>{action}</div>;
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="account-checkbox"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function AddressInput({ label, value, onChange, required = false }: { label: string; value?: string; onChange: (value: string) => void; required?: boolean }) {
  return <label><span>{label}</span><input className="input" value={value || ""} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}
