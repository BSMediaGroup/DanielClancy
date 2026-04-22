import { getPaymentAvailability, json } from "./_shared.js";

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet(context) {
  return json(getPaymentAvailability(context.env));
}
