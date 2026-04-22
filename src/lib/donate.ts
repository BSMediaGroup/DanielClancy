export const DONATION_PRESETS = [5, 10, 25, 50, 100, 250] as const;

export const DONATION_MIN_USD = 5;
export const DONATION_MAX_USD = 2500;
export const DONATION_CURRENCY = "USD";

export type DonateAvailabilityMode = "live" | "test" | "unavailable";
export type DonateAvailabilityState = "ready" | "unavailable";
export type DonateAmountKind = "preset" | "custom";

export type DonateAvailabilityResponse = {
  available: boolean;
  state: DonateAvailabilityState;
  mode: DonateAvailabilityMode;
  currency: string;
  minAmount: number;
  maxAmount: number;
  presetAmounts: number[];
  message: string;
  walletMessage: string;
  deferredPaymentPaths: string[];
};

export type DonateSessionRequest = {
  amount: number;
  kind: DonateAmountKind;
};

export type DonateSessionResponse = {
  url: string;
};

export function formatDonationAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: DONATION_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
