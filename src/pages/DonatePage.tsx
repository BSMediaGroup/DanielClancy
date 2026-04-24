import { startTransition, useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import donationsSlideOne from "../../assets/backgrounds/heroslides/donations1.webp";
import donationsSlideTwo from "../../assets/backgrounds/heroslides/donations2.webp";
import donationsSlideThree from "../../assets/backgrounds/heroslides/donations3.webp";
import donationsSlideFour from "../../assets/backgrounds/heroslides/donations4.webp";
import appleIcon from "../../assets/icons/applecon.svg";
import debitCardIcon from "../../assets/icons/debitcardsingle.svg";
import googleIcon from "../../assets/icons/google.svg";
import mastercardIcon from "../../assets/icons/mastercard.svg";
import paypalIcon from "../../assets/icons/paypal.svg";
import stripeIcon from "../../assets/icons/stripeicon.svg";
import visaIcon from "../../assets/icons/visacond.svg";
import paymentsIcon from "../../assets/icons/ui/payments.svg";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import {
  DONATION_MAX_USD,
  DONATION_MIN_USD,
  DONATION_PRESETS,
  formatDonationAmount,
  isDonationAmountValid,
  type DonateAmountKind,
  type DonateAvailabilityResponse,
  type DonatePayPalCaptureResponse,
  type DonatePayPalOrderResponse,
  type DonateSessionResponse,
  type DonationProvider,
} from "../lib/donate";

type StripeCheckoutState = "idle" | "submitting" | "error";
type PayPalState = "idle" | "submitting" | "capturing" | "error";
type BannerTone = "success" | "neutral" | "error";

type DonateBanner = {
  tone: BannerTone;
  title: string;
  body: string;
  provider?: DonationProvider;
  reference?: string;
};

const DEFAULT_AMOUNT = DONATION_PRESETS[2];
const DONATE_HERO_SLIDES = [
  donationsSlideOne,
  donationsSlideTwo,
  donationsSlideThree,
  donationsSlideFour,
] as const;
const GENERIC_STRIPE_ERROR =
  "Secure card checkout could not be opened right now. Please try again in a moment.";
const GENERIC_PAYPAL_ERROR =
  "PayPal could not complete the donation right now. Please try again or choose card checkout.";

const FALLBACK_AVAILABILITY: DonateAvailabilityResponse = {
  currency: "USD",
  minAmount: DONATION_MIN_USD,
  maxAmount: DONATION_MAX_USD,
  presetAmounts: [...DONATION_PRESETS],
  stripe: {
    available: false,
    mode: "unavailable",
    message: "Secure card checkout is temporarily unavailable.",
    methods: ["Cards"],
    walletMessage:
      "Apple Pay and Google Pay only appear inside Stripe Checkout when your device, browser, and wallet setup support them.",
  },
  paypal: {
    available: false,
    mode: "unavailable",
    message: "PayPal is temporarily unavailable.",
    methods: ["PayPal"],
  },
};

function readDonationBanner(search: string): DonateBanner | null {
  const params = new URLSearchParams(search);
  const donationState = params.get("donation");
  const provider = params.get("provider");
  const normalizedProvider =
    provider === "paypal" || provider === "stripe" ? provider : undefined;
  const reference = params.get("session_id") || params.get("capture_id") || params.get("order_id") || "";
  const payPalToken = params.get("token") || params.get("order_id") || "";

  if (donationState === "success") {
    if (normalizedProvider === "paypal" && payPalToken && !params.get("capture_id")) {
      return {
        tone: "neutral",
        title: "Finalizing donation",
        body: "Your PayPal approval was received. Final confirmation is being completed now.",
        provider: normalizedProvider,
        reference: payPalToken,
      };
    }

    return {
      tone: "success",
      title: "Donation received",
      body:
        normalizedProvider === "paypal"
          ? "Your PayPal donation has been confirmed."
          : "Your secure donation has been submitted successfully.",
      provider: normalizedProvider,
      reference,
    };
  }

  if (donationState === "cancel") {
    return {
      tone: "neutral",
      title: "Donation cancelled",
      body: "The payment flow was cancelled before funds were captured.",
      provider: normalizedProvider,
    };
  }

  if (donationState === "error") {
    return {
      tone: "error",
      title: "Payment unavailable",
      body: "The donation flow could not be completed. Please try again.",
      provider: normalizedProvider,
    };
  }

  return null;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function DonatePage() {
  const customAmountId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const amountRef = useRef<number>(DEFAULT_AMOUNT);
  const handledPayPalTokenRef = useRef("");

  const [availability, setAvailability] = useState<DonateAvailabilityResponse | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_AMOUNT);
  const [customAmount, setCustomAmount] = useState("");
  const [amountKind, setAmountKind] = useState<DonateAmountKind>("preset");
  const [stripeState, setStripeState] = useState<StripeCheckoutState>("idle");
  const [stripeError, setStripeError] = useState("");
  const [payPalState, setPayPalState] = useState<PayPalState>("idle");
  const [payPalError, setPayPalError] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const banner = readDonationBanner(location.search);
  const amountValue = amountKind === "custom" ? Number(customAmount) : selectedAmount;
  const amountValid = isDonationAmountValid(amountValue);
  const amountLabel = amountValid ? formatDonationAmount(amountValue) : "Choose an amount";
  const customAmountTouched = customAmount.trim().length > 0;
  const config = availability || FALLBACK_AVAILABILITY;
  const stripeReady = config.stripe.available && pageReady;
  const payPalReady = config.paypal.available && pageReady;
  const searchParams = new URLSearchParams(location.search);
  const payPalReturnToken = searchParams.get("token") || searchParams.get("order_id") || "";
  const payPalCaptureId = searchParams.get("capture_id") || "";
  const isPayPalReturnCapture =
    searchParams.get("donation") === "success" &&
    searchParams.get("provider") === "paypal" &&
    Boolean(payPalReturnToken) &&
    !payPalCaptureId;

  amountRef.current = amountValue;

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        const response = await fetch("/api/payments/config", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Payment providers are unavailable.");
        }

        const payload = await readJson<DonateAvailabilityResponse>(response);
        setAvailability(payload);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setAvailability(FALLBACK_AVAILABILITY);
      } finally {
        setPageReady(true);
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isPayPalReturnCapture || !payPalReady) {
      return;
    }

    if (handledPayPalTokenRef.current === payPalReturnToken) {
      return;
    }

    handledPayPalTokenRef.current = payPalReturnToken;
    let cancelled = false;
    setPayPalState("capturing");
    setPayPalError("");

    void fetch("/api/payments/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        orderId: payPalReturnToken,
      }),
    })
      .then(async (response) => {
        const payload = await readJson<DonatePayPalCaptureResponse & { message?: string }>(response);

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.id) {
          throw new Error(payload.message || GENERIC_PAYPAL_ERROR);
        }

        setPayPalState("idle");
        startTransition(() => {
          navigate(
            `/donate?donation=success&provider=paypal&order_id=${encodeURIComponent(
              payload.orderId,
            )}&capture_id=${encodeURIComponent(payload.id)}`,
            { replace: true },
          );
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : GENERIC_PAYPAL_ERROR;
        setPayPalState("error");
        setPayPalError(message);
        startTransition(() => {
          navigate(
            `/donate?donation=error&provider=paypal&order_id=${encodeURIComponent(payPalReturnToken)}`,
            { replace: true },
          );
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isPayPalReturnCapture, navigate, payPalReady, payPalReturnToken]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroSlide((currentSlide) => (currentSlide + 1) % DONATE_HERO_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function startStripeCheckout() {
    if (!stripeReady || !amountValid) {
      return;
    }

    setStripeState("submitting");
    setStripeError("");

    try {
      const response = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          amount: amountValue,
          kind: amountKind,
        }),
      });

      const data = await readJson<Partial<DonateSessionResponse> & { message?: string }>(response);

      if (!response.ok || !data.url) {
        throw new Error(data.message || GENERIC_STRIPE_ERROR);
      }

      window.location.assign(data.url);
    } catch (error) {
      setStripeState("error");
      setStripeError(error instanceof Error ? error.message : GENERIC_STRIPE_ERROR);
    }
  }

  async function startPayPalCheckout() {
    if (!payPalReady || !amountValid || isPayPalReturnCapture) {
      return;
    }

    setPayPalState("submitting");
    setPayPalError("");

    try {
      const response = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          amount: amountRef.current,
          kind: amountKind,
        }),
      });

      const data = await readJson<DonatePayPalOrderResponse & { message?: string }>(response);

      if (!response.ok || !data.id || !data.approvalUrl) {
        throw new Error(data.message || GENERIC_PAYPAL_ERROR);
      }

      window.location.assign(data.approvalUrl);
    } catch (error) {
      setPayPalState("error");
      setPayPalError(error instanceof Error ? error.message : GENERIC_PAYPAL_ERROR);
    }
  }

  return (
    <>
      <Seo
        title="Donate"
        description="Support Daniel Clancy through a polished live donation flow with secure Stripe Checkout and PayPal."
        path="/donate"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--donate hero--donate-upgraded">
        <div className="donate-hero-slideshow" aria-hidden="true">
          {DONATE_HERO_SLIDES.map((slide, index) => (
            <div
              key={slide}
              className={`donate-hero-slide ${
                index === activeHeroSlide ? "donate-hero-slide--active" : ""
              }`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
        </div>
        <div className="donate-hero-scrim" aria-hidden="true" />
        <div className="container donate-hero-shell">
          <div className="donate-hero-copy">
            <p className="kicker">Support Daniel Clancy</p>
            <h1>Support Daniel Clancy&rsquo;s independent publishing and commentary.</h1>
            <p className="hero-copy__lead">
              Choose a one-time amount, then complete the handoff through live Stripe Checkout or
              PayPal. The public page stays polished while payment details and provider secrets
              remain server-side only.
            </p>

            <div className="donate-method-strip" aria-label="Supported payment methods">
              <span className="donate-method-pill">
                <img alt="" src={stripeIcon} />
                <small>Stripe</small>
              </span>
              <span className="donate-method-pill">
                <img alt="" src={paypalIcon} />
                <small>PayPal</small>
              </span>
              <span className="donate-method-pill">
                <img alt="" src={visaIcon} />
                <small>Visa</small>
              </span>
              <span className="donate-method-pill">
                <img alt="" src={mastercardIcon} />
                <small>Mastercard</small>
              </span>
            </div>

            <div className="donate-trust-rail">
              <article>
                <span>Wallets</span>
                <strong>Apple Pay and Google Pay only appear when Stripe Checkout supports them on the current device and browser.</strong>
              </article>
              <article>
                <span>Processing</span>
                <strong>Stripe handles card and wallet checkout. PayPal handles PayPal funding approval and capture.</strong>
              </article>
              <article>
                <span>Runtime</span>
                <strong>All secure payment operations run through Cloudflare Pages Functions.</strong>
              </article>
            </div>

            {banner ? (
              <div className={`donate-banner donate-banner--${banner.tone}`}>
                <p className="kicker">
                  {banner.provider === "paypal"
                    ? "PayPal"
                    : banner.provider === "stripe"
                      ? "Stripe"
                      : "Donation"}
                </p>
                <h2>{banner.title}</h2>
                <p>{banner.body}</p>
                {banner.reference ? <span>Reference: {banner.reference}</span> : null}
              </div>
            ) : null}
          </div>

          <article className="surface surface--glow donate-console">
            <div className="donate-console__header">
              <div>
                <p className="kicker">Donation amount</p>
                <h2>{amountLabel}</h2>
              </div>
              <span className="status-pill">
                {pageReady
                  ? config.stripe.mode === "live" || config.paypal.mode === "live"
                    ? "Live payments"
                    : "Provider check"
                  : "Loading"}
              </span>
            </div>

            <div className="donate-amount-grid" role="radiogroup" aria-label="Donation amount">
              {config.presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`donate-amount-card ${
                    amountKind === "preset" && selectedAmount === amount ? "donate-amount-card--active" : ""
                  }`}
                  aria-pressed={amountKind === "preset" && selectedAmount === amount}
                  onClick={() => {
                    setAmountKind("preset");
                    setSelectedAmount(amount);
                    setStripeState("idle");
                    setStripeError("");
                    setPayPalError("");
                  }}
                >
                  <strong>{formatDonationAmount(amount)}</strong>
                  <span>One-time support</span>
                </button>
              ))}

              <button
                type="button"
                className={`donate-amount-card ${
                  amountKind === "custom" ? "donate-amount-card--active" : ""
                }`}
                aria-pressed={amountKind === "custom"}
                onClick={() => {
                  setAmountKind("custom");
                  setStripeState("idle");
                  setStripeError("");
                  setPayPalError("");
                }}
              >
                <strong>Custom</strong>
                <span>Choose a whole-dollar amount</span>
              </button>
            </div>

            <label className="donate-custom-input" htmlFor={customAmountId}>
              <span>Custom amount in USD</span>
              <input
                id={customAmountId}
                inputMode="numeric"
                type="number"
                min={config.minAmount}
                max={config.maxAmount}
                step="1"
                placeholder={`${config.minAmount}`}
                value={customAmount}
                onChange={(event) => {
                  setAmountKind("custom");
                  setCustomAmount(event.target.value);
                  setStripeState("idle");
                  setStripeError("");
                  setPayPalError("");
                }}
              />
            </label>

            <div className="donate-console__summary">
              <article>
                <span>Donation</span>
                <strong>{amountLabel}</strong>
              </article>
              <article>
                <span>Availability</span>
                <strong>{pageReady ? "Stripe and PayPal status checked live." : "Checking providers."}</strong>
              </article>
              <article>
                <span>Settlement</span>
                <strong>One-time USD payment</strong>
              </article>
            </div>

            {amountKind === "custom" && customAmountTouched && !amountValid ? (
              <p className="form-status form-status--error">Choose a valid whole-dollar amount to continue.</p>
            ) : null}

            <section className="donate-provider-block">
              <div className="donate-provider-block__copy">
                <div className="icon-heading">
                  <img alt="" src={stripeIcon} />
                  <h3>Stripe Checkout</h3>
                </div>
                <p>{config.stripe.message}</p>
                <p className="form-status">{config.stripe.walletMessage}</p>
                <div className="donate-provider-icons" aria-hidden="true">
                  <img
                    alt=""
                    className="donate-provider-icon donate-provider-icon--manual-white"
                    src={paymentsIcon}
                  />
                  <img alt="" src={appleIcon} />
                  <img alt="" src={googleIcon} />
                  <img alt="" src={debitCardIcon} />
                </div>
              </div>

              <div className="donate-provider-block__actions">
                <button
                  type="button"
                  className="button button--primary donate-provider-button"
                  onClick={startStripeCheckout}
                  disabled={!stripeReady || !amountValid || stripeState === "submitting"}
                >
                  {stripeState === "submitting"
                    ? "Opening Stripe Checkout"
                    : `Donate ${amountValid ? amountLabel : "with Stripe"}`}
                </button>
                <span className="donate-provider-note">
                  Hosted checkout for cards, Apple Pay, and Google Pay when supported.
                </span>
                {stripeState === "error" ? (
                  <p className="form-status form-status--error">{stripeError || GENERIC_STRIPE_ERROR}</p>
                ) : null}
              </div>
            </section>

            <section className="donate-provider-block donate-provider-block--paypal">
              <div className="donate-provider-block__copy">
                <div className="icon-heading">
                  <img alt="" src={paypalIcon} />
                  <h3>PayPal</h3>
                </div>
                <p>
                  {config.paypal.available
                    ? "Continue securely on PayPal to approve the donation, then return here for confirmation."
                    : config.paypal.message}
                </p>
                <p className="form-status">
                  The site creates the order server-side and redirects to the official PayPal approval page.
                </p>
              </div>

              <div className="donate-provider-block__actions">
                <div className="donate-paypal-shell">
                  {payPalReady ? (
                    <>
                      <button
                        type="button"
                        className="button button--primary donate-provider-button donate-provider-button--paypal"
                        onClick={startPayPalCheckout}
                        disabled={!amountValid || payPalState === "submitting" || payPalState === "capturing"}
                      >
                        {payPalState === "submitting"
                          ? "Redirecting to PayPal"
                          : `Donate ${amountValid ? amountLabel : "with PayPal"}`}
                      </button>
                      {!amountValid ? (
                        <p className="form-status">Choose a valid amount to enable PayPal checkout.</p>
                      ) : null}
                    </>
                  ) : pageReady ? (
                    <p className="form-status">{config.paypal.message}</p>
                  ) : (
                    <p className="form-status">Loading PayPal availability.</p>
                  )}
                </div>
                <span className="donate-provider-note">
                  Secure approval opens on PayPal, then the site captures the approved order when you return.
                </span>
                {payPalState === "capturing" ? (
                  <p className="form-status">Finalizing the approved PayPal donation.</p>
                ) : null}
                {payPalState === "error" ? (
                  <p className="form-status form-status--error">{payPalError || GENERIC_PAYPAL_ERROR}</p>
                ) : null}
              </div>
            </section>
          </article>
        </div>
      </section>

      <Section
        eyebrow="Payment handling"
        title="A production-safe donation surface with truthful payment messaging."
        intro="The page presents only the payment methods that are really wired, keeps wallet claims conditional, and pushes all secure payment creation, capture, and webhook work into Cloudflare Pages Functions."
      >
        <div className="donate-details-layout">
          <article className="surface donate-detail-panel">
            <p className="kicker">What is live now</p>
            <h3>Stripe and PayPal are both wired as real providers.</h3>
            <ul className="bullet-list">
              <li>Preset donation amounts are selectable and visually stateful.</li>
              <li>Custom amount entry stays in whole dollars and validates on both client and server.</li>
              <li>Stripe launches hosted Checkout Sessions for one-time donations.</li>
              <li>PayPal creates and captures real orders through secure server endpoints.</li>
            </ul>
          </article>

          <article className="surface donate-detail-panel">
            <p className="kicker">Provider truth</p>
            <h3>No fake wallets, no dead buttons.</h3>
            <ul className="bullet-list">
              <li>Apple Pay and Google Pay are described only as Stripe Checkout options when supported.</li>
              <li>PayPal now uses a server-created order and official PayPal approval redirect instead of a browser-rendered smart button.</li>
              <li>Unavailable providers degrade to short public-safe messaging instead of broken controls.</li>
            </ul>
          </article>

          <article className="surface donate-detail-panel">
            <p className="kicker">Operational stance</p>
            <h3>Secrets remain server-side only.</h3>
            <ul className="bullet-list">
              <li>Checkout creation, OAuth, capture, and webhook verification all stay in Pages Functions.</li>
              <li>No secret keys or webhook secrets are read by the client bundle.</li>
              <li>Return-state messaging is short, public-facing, and safe for live traffic.</li>
            </ul>
          </article>
        </div>
      </Section>
    </>
  );
}
