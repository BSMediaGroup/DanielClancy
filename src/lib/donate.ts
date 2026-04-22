export const DONATION_PRESETS = [5, 10, 25, 50, 100, 250] as const;

export const DONATION_MIN_USD = 5;
export const DONATION_MAX_USD = 2500;
export const DONATION_CURRENCY = "USD";

export type DonateAvailabilityMode = "live" | "test" | "unavailable";
export type DonateAmountKind = "preset" | "custom";
export type DonationProvider = "stripe" | "paypal";

export type DonateProviderAvailability = {
  available: boolean;
  mode: DonateAvailabilityMode;
  message: string;
  methods: string[];
};

export type DonateStripeAvailability = DonateProviderAvailability & {
  walletMessage: string;
};

export type DonatePayPalAvailability = DonateProviderAvailability & {
  clientId?: string;
  appName?: string;
};

export type DonateAvailabilityResponse = {
  currency: string;
  minAmount: number;
  maxAmount: number;
  presetAmounts: number[];
  stripe: DonateStripeAvailability;
  paypal: DonatePayPalAvailability;
};

export type DonateSessionRequest = {
  amount: number;
  kind: DonateAmountKind;
};

export type DonateSessionResponse = {
  url: string;
};

export type DonatePayPalOrderResponse = {
  id: string;
  approvalUrl: string;
};

export type DonatePayPalCaptureResponse = {
  id: string;
  status: string;
  orderId: string;
  amount: string;
  currency: string;
};

export function formatDonationAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: DONATION_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isDonationAmountValid(amount: number) {
  return Number.isInteger(amount) && amount >= DONATION_MIN_USD && amount <= DONATION_MAX_USD;
}
