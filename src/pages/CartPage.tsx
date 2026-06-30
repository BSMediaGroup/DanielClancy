import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  clearCart,
  estimateShipping,
  loadCart,
  removeCartItem,
  saveCart,
  startStripeMerchCheckout,
  updateCartQuantity,
  validateCart,
  type MerchCartItem,
  type ServerCartSummary,
  type ShippingOption,
  type ShippingRecipient,
} from "../lib/merchCart";

const initialRecipient: ShippingRecipient = {
  country_code: "US",
  state_code: "",
  city: "",
  zip: "",
  address1: "",
  address2: "",
};

export function CartPage() {
  const [items, setItems] = useState<MerchCartItem[]>(() => loadCart());
  const [summary, setSummary] = useState<ServerCartSummary | null>(null);
  const [recipient, setRecipient] = useState<ShippingRecipient>(initialRecipient);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [status, setStatus] = useState("Validating cart...");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    saveCart(items);
    if (!items.length) {
      setSummary(null);
      setShippingOptions([]);
      setSelectedShippingId("");
      setStatus("Your cart is empty.");
      return;
    }
    const controller = new AbortController();
    validateCart(items, controller.signal)
      .then((cart) => {
        setSummary(cart);
        setStatus("Cart validated server-side.");
        setError("");
      })
      .catch((validationError) => {
        if (controller.signal.aborted) return;
        setSummary(null);
        setError(validationError instanceof Error ? validationError.message : "Cart validation failed.");
      });
    return () => controller.abort();
  }, [items]);

  const selectedShipping = useMemo(
    () => shippingOptions.find((option) => option.id === selectedShippingId) || null,
    [selectedShippingId, shippingOptions],
  );

  function updateRecipient(field: keyof ShippingRecipient, value: string) {
    setRecipient((current) => ({ ...current, [field]: value }));
    setShippingOptions([]);
    setSelectedShippingId("");
  }

  async function handleShippingEstimate() {
    setBusy(true);
    setError("");
    try {
      const options = await estimateShipping(items, recipient);
      setShippingOptions(options);
      setSelectedShippingId(options[0]?.id || "");
      setStatus(options.length ? "Shipping options returned by Printful." : "Printful returned no shipping options.");
    } catch (shippingError) {
      setShippingOptions([]);
      setError(shippingError instanceof Error ? shippingError.message : "Shipping estimate failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckout() {
    if (!selectedShipping) return;
    setBusy(true);
    setError("");
    try {
      const checkout = await startStripeMerchCheckout(items, selectedShipping);
      window.location.assign(checkout.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="Cart" description="DanielClancy.net merch cart." path="/cart" />
      <section className="shop-detail-hero shop-cart-hero">
        <div className="container shop-cart-layout">
          <div className="shop-cart-main">
            <p className="kicker">Merch cart</p>
            <h1>Review your selections.</h1>
            <p>Prices, titles, variants, and totals are recalculated by the server before checkout.</p>
            <div className="shop-cart-status" aria-live="polite">
              {error ? <span className="form-status form-status--error">{error}</span> : <span>{status}</span>}
            </div>
            {summary?.items.length ? (
              <div className="shop-cart-list">
                {summary.items.map((item) => (
                  <article className="shop-cart-item" key={`${item.productId}-${item.variantId}`}>
                    {item.image ? <img src={item.image} alt="" /> : <div className="shop-cart-image-empty" aria-hidden="true" />}
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.variantName}</span>
                      <small>{formatCents(item.unitAmount, item.currency)} each</small>
                    </div>
                    <input
                      className="input input--compact"
                      type="number"
                      min="1"
                      max="10"
                      value={item.quantity}
                      onChange={(event) => setItems((current) => updateCartQuantity(current, item.productId, item.variantId, Number(event.target.value)))}
                      aria-label={`Quantity for ${item.title}`}
                    />
                    <button className="button button--ghost" type="button" onClick={() => setItems((current) => removeCartItem(current, item.productId, item.variantId))}>
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="shop-empty-state">
                <h2>Your cart is empty.</h2>
                <p>Add a product variant from the shop before estimating shipping.</p>
                <Link className="button" to="/shop">Back to shop</Link>
              </div>
            )}
          </div>

          <aside className="shop-cart-panel">
            <h2>Shipping estimate</h2>
            <div className="shop-cart-fields">
              <label>
                <span>Country code</span>
                <input className="input" value={recipient.country_code} onChange={(event) => updateRecipient("country_code", event.target.value.toUpperCase())} />
              </label>
              <label>
                <span>State / province code</span>
                <input className="input" value={recipient.state_code} onChange={(event) => updateRecipient("state_code", event.target.value.toUpperCase())} />
              </label>
              <label>
                <span>City</span>
                <input className="input" value={recipient.city} onChange={(event) => updateRecipient("city", event.target.value)} />
              </label>
              <label>
                <span>Postal code</span>
                <input className="input" value={recipient.zip} onChange={(event) => updateRecipient("zip", event.target.value)} />
              </label>
              <label>
                <span>Address line 1</span>
                <input className="input" value={recipient.address1} onChange={(event) => updateRecipient("address1", event.target.value)} />
              </label>
            </div>
            <button className="button button--secondary" type="button" onClick={handleShippingEstimate} disabled={!summary || busy}>
              Estimate shipping
            </button>
            {shippingOptions.length ? (
              <div className="shop-shipping-options">
                {shippingOptions.map((option) => (
                  <label key={option.id} className="shop-shipping-option">
                    <input type="radio" checked={selectedShippingId === option.id} onChange={() => setSelectedShippingId(option.id)} />
                    <span>{option.name}</span>
                    <strong>{option.amountText}</strong>
                  </label>
                ))}
              </div>
            ) : null}
            <div className="shop-cart-total">
              <span>Subtotal</span>
              <strong>{summary?.subtotalText || "$0.00"}</strong>
            </div>
            <button className="button" type="button" onClick={handleCheckout} disabled={!selectedShipping || busy}>
              Continue to Stripe Checkout
            </button>
            <button className="button button--ghost" type="button" onClick={() => { clearCart(); setItems([]); }}>
              Clear cart
            </button>
          </aside>
        </div>
      </section>
    </>
  );
}

export function ShopSuccessPage() {
  useEffect(() => {
    clearCart();
  }, []);
  return <ShopStatusPage title="Payment received" message="Your payment was completed. Fulfillment status will be reconciled server-side after the merch order handoff is fully enabled." />;
}

export function ShopCancelPage() {
  return <ShopStatusPage title="Checkout canceled" message="Your cart is still stored locally on this device. You can return to checkout when ready." />;
}

function ShopStatusPage({ title, message }: { title: string; message: string }) {
  return (
    <>
      <Seo title={title} description={message} path="/shop" />
      <section className="shop-detail-hero shop-detail-hero--empty">
        <div className="container shop-detail-empty">
          <p className="kicker">Shop checkout</p>
          <h1>{title}</h1>
          <p>{message}</p>
          <Link className="button" to="/shop">Back to shop</Link>
        </div>
      </section>
    </>
  );
}

function formatCents(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
}
