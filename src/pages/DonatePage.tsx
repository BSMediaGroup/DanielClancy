import { useEffect, useState } from "react";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets, socialIcons } from "../content/brandAssets";
import {
  DONATION_MAX_USD,
  DONATION_MIN_USD,
  DONATION_PRESETS,
  formatDonationAmount,
  type DonateAvailabilityResponse,
  type DonateAmountKind,
  type DonateSessionResponse,
} from "../lib/donate";

type DonateStatus = "loading" | "ready" | "unavailable";
type CheckoutStatus = "idle" | "submitting" | "error";

const DEFAULT_AMOUNT = DONATION_PRESETS[2];
const GENERIC_ERROR =
  "Secure checkout could not be started right now. Please try again in a moment.";

function readDonationState() {
  if (typeof window === "undefined") {
    return {
      banner: "",
      sessionId: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const donationState = params.get("donation");

  return {
    banner:
      donationState === "success"
        ? "Thank you. Your secure donation has been submitted."
        : donationState === "cancel"
          ? "Your checkout was cancelled before payment was completed."
          : "",
    sessionId: params.get("session_id") || "",
  };
}

export function DonatePage() {
  const [{ banner, sessionId }] = useState(readDonationState);
  const [availability, setAvailability] = useState<DonateAvailabilityResponse | null>(null);
  const [donateStatus, setDonateStatus] = useState<DonateStatus>("loading");
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_AMOUNT);
  const [customAmount, setCustomAmount] = useState("");
  const [amountKind, setAmountKind] = useState<DonateAmountKind>("preset");
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        const response = await fetch("/api/donate/session", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data = (await response.json()) as DonateAvailabilityResponse;
        setAvailability(data);
        setDonateStatus(data.available ? "ready" : "unavailable");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setDonateStatus("unavailable");
        setAvailability({
          available: false,
          state: "unavailable",
          mode: "unavailable",
          currency: "USD",
          minAmount: DONATION_MIN_USD,
          maxAmount: DONATION_MAX_USD,
          presetAmounts: [...DONATION_PRESETS],
          message:
            "Secure card checkout is temporarily unavailable. Please check back shortly.",
          walletMessage:
            "Apple Pay or Google Pay may appear inside Stripe Checkout when supported.",
          deferredPaymentPaths: ["PayPal"],
        });
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, []);

  const effectiveAmount =
    amountKind === "custom"
      ? Number.isFinite(Number(customAmount))
        ? Number(customAmount)
        : 0
      : selectedAmount;

  const amountSummary = effectiveAmount >= DONATION_MIN_USD ? formatDonationAmount(effectiveAmount) : "";
  const customAmountValid =
    effectiveAmount >= DONATION_MIN_USD && effectiveAmount <= DONATION_MAX_USD;
  const checkoutEnabled =
    donateStatus === "ready" &&
    checkoutStatus !== "submitting" &&
    ((amountKind === "preset" && selectedAmount >= DONATION_MIN_USD) ||
      (amountKind === "custom" && customAmountValid));

  async function startCheckout() {
    if (!checkoutEnabled) {
      return;
    }

    setCheckoutStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/donate/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(effectiveAmount),
          kind: amountKind,
        }),
      });

      const data = (await response.json()) as Partial<DonateSessionResponse> & { message?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.message || GENERIC_ERROR);
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutStatus("error");
      setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR);
    }
  }

  return (
    <>
      <Seo
        title="Donate"
        description="Secure Stripe-backed support page for Daniel Clancy content creation and independent design work."
        path="/donate"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--donate">
        <div className="container hero-split hero-split--personal">
          <div className="hero-copy">
            <p className="kicker">Support</p>
            <h1>Support Daniel&apos;s content creation and independent design work through secure Stripe Checkout.</h1>
            <p className="hero-copy__lead">
              Choose a one-time amount, continue to Stripe&apos;s hosted payment page, and complete the donation without exposing card details to the public site.
            </p>

            <div className="logo-row">
              <span className="logo-pill">
                <img alt="" src={socialIcons.payments} />
                <small>Stripe Checkout</small>
              </span>
              <span className="logo-pill">
                <img alt="" src={socialIcons.apple} />
                <small>Wallets when available</small>
              </span>
            </div>

            {banner ? (
              <p className={`form-status ${banner.includes("Thank you") ? "form-status--success" : ""}`}>
                {banner}
                {sessionId ? ` Reference: ${sessionId}.` : ""}
              </p>
            ) : null}
          </div>

          <article className="surface surface--glow donate-panel">
            <p className="kicker">Secure payment</p>
            <h2>{availability?.mode === "live" ? "Live card donations are available now." : "Secure donation flow ready."}</h2>
            <p>
              {availability?.message ||
                "Checking the live checkout runtime now."}
            </p>

            <div className="donate-amounts" role="group" aria-label="Donation amounts">
              {(availability?.presetAmounts || DONATION_PRESETS).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`filter-chip donate-amount-chip ${amountKind === "preset" && selectedAmount === amount ? "filter-chip--active" : ""}`}
                  onClick={() => {
                    setAmountKind("preset");
                    setSelectedAmount(amount);
                    setCheckoutStatus("idle");
                    setErrorMessage("");
                  }}
                  disabled={donateStatus !== "ready"}
                >
                  {formatDonationAmount(amount)}
                </button>
              ))}
              <button
                type="button"
                className={`filter-chip donate-amount-chip ${amountKind === "custom" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setAmountKind("custom");
                  setCheckoutStatus("idle");
                  setErrorMessage("");
                }}
                disabled={donateStatus !== "ready"}
              >
                Custom amount
              </button>
            </div>

            <label className="donate-custom-field">
              <span>Custom amount (USD)</span>
              <input
                inputMode="decimal"
                type="number"
                min={DONATION_MIN_USD}
                max={DONATION_MAX_USD}
                step="1"
                placeholder={`${DONATION_MIN_USD}`}
                value={customAmount}
                onChange={(event) => {
                  setAmountKind("custom");
                  setCustomAmount(event.target.value);
                  setCheckoutStatus("idle");
                  setErrorMessage("");
                }}
                disabled={donateStatus !== "ready"}
              />
            </label>

            <div className="archive-summary donate-summary">
              <article>
                <span>Selected amount</span>
                <strong>{amountSummary || "Choose an amount"}</strong>
              </article>
              <article>
                <span>Range</span>
                <strong>
                  {formatDonationAmount(availability?.minAmount || DONATION_MIN_USD)} to{" "}
                  {formatDonationAmount(availability?.maxAmount || DONATION_MAX_USD)}
                </strong>
              </article>
              <article>
                <span>Payment path</span>
                <strong>{availability?.mode === "live" ? "Live Stripe" : donateStatus === "ready" ? "Stripe preview" : "Fallback state"}</strong>
              </article>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={startCheckout}
                disabled={!checkoutEnabled}
              >
                {checkoutStatus === "submitting"
                  ? "Opening secure checkout"
                  : amountSummary
                    ? `Continue with ${amountSummary}`
                    : "Continue to secure payment"}
              </button>
              <p className="form-status">
                Stripe hosts the payment page. Card details never touch this site directly.
              </p>
              {amountKind === "custom" && !customAmountValid && customAmount ? (
                <p className="form-status form-status--error">
                  Choose a custom amount between {formatDonationAmount(DONATION_MIN_USD)} and{" "}
                  {formatDonationAmount(DONATION_MAX_USD)}.
                </p>
              ) : null}
              {checkoutStatus === "error" ? (
                <p className="form-status form-status--error">{errorMessage || GENERIC_ERROR}</p>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <Section
        eyebrow="Support flow"
        title="A clean hosted checkout path with graceful fallback behavior."
        intro="The page keeps the current DanielClancy visual language while moving real payment handling to Cloudflare Pages Functions and Stripe-hosted checkout."
      >
        <div className="project-grid donate-detail-grid">
          <article className="surface">
            <div className="icon-heading">
              <img alt="" src={socialIcons.payments} />
              <h3>Card payments</h3>
            </div>
            <p>
              One-time support now routes through Stripe Checkout from a server-side session created inside the Cloudflare Pages runtime.
            </p>
            <span className="status-pill">
              {availability?.mode === "live" ? "Live now" : donateStatus === "ready" ? "Preview-ready" : "Temporarily unavailable"}
            </span>
          </article>

          <article className="surface">
            <div className="icon-heading">
              <img alt="" src={socialIcons.apple} />
              <h3>Wallet presentation</h3>
            </div>
            <p>{availability?.walletMessage || "Wallet options appear only when Stripe Checkout offers them."}</p>
            <span className="status-pill">Device dependent</span>
          </article>

          <article className="surface">
            <div className="icon-heading">
              <img alt="" src={socialIcons.locals} />
              <h3>Deferred paths</h3>
            </div>
            <p>
              PayPal remains a later milestone, so this page avoids non-working wallet buttons and keeps the integration seam clean for a future phase.
            </p>
            <span className="status-pill">PayPal later</span>
          </article>
        </div>

        <div className="two-column-grid donate-fallback-grid">
          <article className="surface">
            <p className="kicker">Checkout readiness</p>
            <h3>{donateStatus === "ready" ? "The page can start a secure Stripe session." : "The page is showing its public-safe fallback state."}</h3>
            <p>
              {availability?.message ||
                "Checkout availability is being checked."}
            </p>
          </article>

          <article className="surface">
            <p className="kicker">Public wording</p>
            <h3>No fake buttons, no raw runtime errors.</h3>
            <p>
              When Stripe is unavailable, the amount chooser stays visible for context, the primary action disables cleanly, and the page keeps professional public copy instead of exposing internal configuration detail.
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}
