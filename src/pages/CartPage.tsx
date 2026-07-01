import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { CurrencyFlag, CurrencySelect, PriceWithFlag, convertAmount, formatMoney, useCurrencyRates, type CurrencyCode } from "../lib/currency";
import {
  clearCart,
  estimateShipping,
  fetchMerchOrderStatus,
  loadCart,
  markMerchCheckoutCanceled,
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
  name: "",
  email: "",
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
  const [convertedCurrency, setConvertedCurrency] = useState<CurrencyCode>("USD");
  const [calculatorAmount, setCalculatorAmount] = useState("50");
  const rates = useCurrencyRates();

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
  const subtotalConverted = convertAmount(summary ? summary.subtotalAmount / 100 : null, summary?.currency || "AUD", convertedCurrency, rates);
  const calculatorConverted = convertAmount(Number.parseFloat(calculatorAmount), "AUD", convertedCurrency, rates);

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
      const checkout = await startStripeMerchCheckout(items, recipient, selectedShipping);
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
                      <small><PriceWithFlag amount={item.unitAmount / 100} currency={item.currency} text={`${formatMoney(item.unitAmount / 100, item.currency)} ${item.currency}`} /> each</small>
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
                <span>Recipient name</span>
                <input className="input" value={recipient.name} onChange={(event) => updateRecipient("name", event.target.value)} />
              </label>
              <label>
                <span>Email</span>
                <input className="input" type="email" value={recipient.email} onChange={(event) => updateRecipient("email", event.target.value)} />
              </label>
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
              <strong><PriceWithFlag amount={summary ? summary.subtotalAmount / 100 : 0} currency={summary?.currency || "AUD"} text={summary?.subtotalText ? `${summary.subtotalText} ${summary.currency}` : "$0.00 AUD"} /></strong>
              <small>
                {subtotalConverted === null ? (
                  "Conversion unavailable."
                ) : (
                  <>Approx. <PriceWithFlag amount={subtotalConverted} currency={convertedCurrency} text={`${formatMoney(subtotalConverted, convertedCurrency)} ${convertedCurrency}`} /></>
                )}
              </small>
            </div>
            <div className="currency-tools currency-tools--cart">
              <CurrencySelect value={convertedCurrency} onChange={setConvertedCurrency} />
              <label className="currency-calculator">
                <span><CurrencyFlag code="AUD" /> Convert custom AUD amount</span>
                <input className="input" inputMode="decimal" value={calculatorAmount} onChange={(event) => setCalculatorAmount(event.target.value)} />
                <strong>{calculatorConverted === null ? "Unavailable" : <PriceWithFlag amount={calculatorConverted} currency={convertedCurrency} text={`${formatMoney(calculatorConverted, convertedCurrency)} ${convertedCurrency}`} />}</strong>
              </label>
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
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Checking paid order status...");
  const [title, setTitle] = useState("Payment return received");

  useEffect(() => {
    clearCart();
    const sessionId = searchParams.get("session_id") || "";
    if (!sessionId) {
      setTitle("Payment return received");
      setMessage("No checkout session id was returned, so live order status cannot be shown here.");
      return;
    }
    const controller = new AbortController();
    fetchMerchOrderStatus({ sessionId }, controller.signal)
      .then((order) => {
        setTitle(order.status === "printful_confirmed" ? "Payment received" : "Payment status received");
        setMessage(order.message);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setTitle("Payment return received");
        setMessage(error instanceof Error ? error.message : "Order status is unavailable.");
      });
    return () => controller.abort();
  }, [searchParams]);
  return <ShopStatusPage title={title} message={message} />;
}

export function ShopCancelPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Your cart is still stored locally on this device. You can return to checkout when ready.");

  useEffect(() => {
    const intentId = searchParams.get("intent_id") || "";
    if (!intentId) return;
    const controller = new AbortController();
    markMerchCheckoutCanceled(intentId, controller.signal)
      .then((order) => setMessage(order.message || "Checkout was canceled. No fulfillment order was confirmed."))
      .catch(() => {
        if (!controller.signal.aborted) {
          setMessage("Checkout was canceled. Local/dev order storage may be unavailable, so no live order state was updated.");
        }
      });
    return () => controller.abort();
  }, [searchParams]);

  return <ShopStatusPage title="Checkout canceled" message={message} />;
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
