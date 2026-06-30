import { useEffect, useMemo, useState } from "react";

export const CURRENCY_OPTIONS = [
  { code: "AUD", label: "Australian dollar" },
  { code: "USD", label: "United States dollar" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "NZD", label: "New Zealand dollar" },
  { code: "GBP", label: "British pound" },
  { code: "EUR", label: "Euro" },
  { code: "JPY", label: "Japanese yen" },
  { code: "CHF", label: "Swiss franc" },
  { code: "SGD", label: "Singapore dollar" },
  { code: "HKD", label: "Hong Kong dollar" },
  { code: "KRW", label: "South Korean won" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

export type CurrencyRatesState = {
  ok: boolean;
  rates: Record<string, number>;
  message: string;
};

export function useCurrencyRates() {
  const [state, setState] = useState<CurrencyRatesState>({ ok: false, rates: { AUD: 1 }, message: "Loading conversion rates..." });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/merch/currency-rates", { headers: { accept: "application/json" }, cache: "no-store", signal: controller.signal })
      .then((response) => response.json().then((payload) => ({ response, payload })).catch(() => ({ response, payload: null })))
      .then(({ response, payload }) => {
        if (!response.ok || !payload?.ok) {
          setState({ ok: false, rates: { AUD: 1 }, message: payload?.message || "Conversion unavailable." });
          return;
        }
        setState({ ok: true, rates: { AUD: 1, ...(payload.rates || {}) }, message: payload.disclaimer || "" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ ok: false, rates: { AUD: 1 }, message: "Conversion unavailable." });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function useConvertedAmount(amount: number | null | undefined, fromCurrency: string | undefined, toCurrency: string, rates: CurrencyRatesState) {
  return useMemo(() => convertAmount(amount, fromCurrency, toCurrency, rates), [amount, fromCurrency, toCurrency, rates]);
}

export function convertAmount(amount: number | null | undefined, fromCurrency: string | undefined, toCurrency: string, rates: CurrencyRatesState) {
  if (!rates.ok || !Number.isFinite(Number(amount))) return null;
  const source = normalizeCurrency(fromCurrency || "AUD");
  const target = normalizeCurrency(toCurrency || "USD");
  const sourceRate = rates.rates[source];
  const targetRate = rates.rates[target];
  if (!sourceRate || !targetRate) return null;
  const audAmount = Number(amount) / sourceRate;
  return audAmount * targetRate;
}

export function formatMoney(amount: number | null | undefined, currency = "AUD") {
  if (!Number.isFinite(Number(amount))) return "Price pending";
  const code = normalizeCurrency(currency);
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: code }).format(Number(amount));
}

export function CurrencyFlag({ code, className = "currency-flag" }: { code?: string; className?: string }) {
  const normalized = normalizeCurrency(code);
  const title = `${normalized} flag`;
  return (
    <svg className={className} viewBox="0 0 32 22" role="img" aria-label={title} focusable="false">
      <FlagPattern code={normalized} />
    </svg>
  );
}

export function CurrencySelect({ value, onChange, label = "Converted currency" }: { value: string; onChange: (value: CurrencyCode) => void; label?: string }) {
  return (
    <label className="currency-select">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as CurrencyCode)}>
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code} - {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PriceWithFlag({ amount, currency = "AUD", text }: { amount?: number | null; currency?: string; text?: string }) {
  const code = normalizeCurrency(currency);
  return (
    <span className="price-with-flag">
      <CurrencyFlag code={code} />
      <span>{text || `${formatMoney(amount, code)} ${code}`}</span>
    </span>
  );
}

function FlagPattern({ code }: { code: string }) {
  if (code === "USD") return <StripeFlag colors={["#b22234", "#fff"]} canton="#3c3b6e" />;
  if (code === "CAD") return <ThreeBand left="#d52b1e" middle="#fff" right="#d52b1e" mark="#d52b1e" />;
  if (code === "NZD") return <UnionStyle base="#00247d" stars="#cc142b" />;
  if (code === "GBP") return <UnionStyle base="#012169" stars="#c8102e" />;
  if (code === "EUR") return <CircleStars base="#003399" mark="#ffcc00" />;
  if (code === "JPY") return <CircleFlag base="#fff" mark="#bc002d" />;
  if (code === "CHF") return <CrossFlag base="#d52b1e" mark="#fff" />;
  if (code === "SGD") return <TwoBand top="#ef3340" bottom="#fff" mark="#fff" />;
  if (code === "HKD") return <CircleFlag base="#de2910" mark="#fff" />;
  if (code === "KRW") return <CircleFlag base="#fff" mark="#c60c30" second="#003478" />;
  return <UnionStyle base="#012169" stars="#fff" />;
}

function UnionStyle({ base, stars }: { base: string; stars: string }) {
  return (
    <>
      <rect width="32" height="22" fill={base} />
      <path d="M0 0 14 9M14 0 0 9M0 9h14V0" stroke="#fff" strokeWidth="2.2" />
      <path d="M0 0 14 9M14 0 0 9" stroke="#c8102e" strokeWidth="1.1" />
      <path d="M0 4.5h14M7 0v9" stroke="#fff" strokeWidth="3" />
      <path d="M0 4.5h14M7 0v9" stroke="#c8102e" strokeWidth="1.5" />
      {[20, 25, 22, 28].map((x, index) => <circle key={x} cx={x} cy={[5, 8, 14, 16][index]} r="1.4" fill={stars} />)}
    </>
  );
}

function StripeFlag({ colors, canton }: { colors: [string, string]; canton: string }) {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => <rect key={index} y={index * 3.2} width="32" height="3.2" fill={colors[index % 2]} />)}
      <rect width="14" height="10.8" fill={canton} />
    </>
  );
}

function ThreeBand({ left, middle, right, mark }: { left: string; middle: string; right: string; mark: string }) {
  return (
    <>
      <rect width="10" height="22" fill={left} />
      <rect x="10" width="12" height="22" fill={middle} />
      <rect x="22" width="10" height="22" fill={right} />
      <path d="M16 5 18 11 16 17 14 11Z" fill={mark} />
    </>
  );
}

function CircleStars({ base, mark }: { base: string; mark: string }) {
  return (
    <>
      <rect width="32" height="22" fill={base} />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return <circle key={index} cx={16 + Math.cos(angle) * 6} cy={11 + Math.sin(angle) * 4} r="0.8" fill={mark} />;
      })}
    </>
  );
}

function CircleFlag({ base, mark, second }: { base: string; mark: string; second?: string }) {
  return (
    <>
      <rect width="32" height="22" fill={base} />
      <circle cx="16" cy="11" r="5.4" fill={mark} />
      {second ? <path d="M10.6 11a5.4 5.4 0 0 0 10.8 0 5.4 5.4 0 0 1-10.8 0Z" fill={second} /> : null}
    </>
  );
}

function CrossFlag({ base, mark }: { base: string; mark: string }) {
  return (
    <>
      <rect width="32" height="22" fill={base} />
      <rect x="13" y="5" width="6" height="12" fill={mark} />
      <rect x="10" y="8" width="12" height="6" fill={mark} />
    </>
  );
}

function TwoBand({ top, bottom, mark }: { top: string; bottom: string; mark: string }) {
  return (
    <>
      <rect width="32" height="11" fill={top} />
      <rect y="11" width="32" height="11" fill={bottom} />
      <circle cx="9" cy="5.5" r="3.4" fill={mark} />
      <circle cx="10.5" cy="5.5" r="3.2" fill={top} />
    </>
  );
}

function normalizeCurrency(value?: string) {
  const code = String(value || "AUD").toUpperCase();
  return CURRENCY_OPTIONS.some((option) => option.code === code) ? code : "AUD";
}
