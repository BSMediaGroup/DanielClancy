type PayPalButtonsActions = {
  order: {
    capture: () => Promise<unknown>;
  };
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement | string) => Promise<void>;
  close?: () => Promise<void>;
};

type PayPalNamespace = {
  Buttons: (options: {
    style?: Record<string, string | number | boolean>;
    createOrder?: () => Promise<string>;
    onApprove?: (data: { orderID: string }, actions: PayPalButtonsActions) => Promise<void>;
    onCancel?: (data: { orderID?: string }) => void;
    onError?: (error: unknown) => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

export {};
