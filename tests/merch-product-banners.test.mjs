import test from "node:test";
import assert from "node:assert/strict";

import { publicProducts } from "../functions/_shared/printful-products.js";

function baseProduct(overrides = {}) {
  return {
    id: "123",
    printfulProductId: "123",
    externalId: "",
    slug: "signature-tee",
    title: "Signature Tee",
    description: "Base Printful copy.",
    category: "All Products",
    categorySlug: "all",
    categories: [{ label: "All Products", slug: "all", source: "system", enabled: true, locked: true }],
    thumbnailUrl: "https://cdn.example.test/signature-tee.webp",
    images: ["https://cdn.example.test/signature-tee.webp"],
    status: "synced",
    availability: "available",
    priceRange: null,
    variantCount: 0,
    imageCount: 1,
    variants: [],
    raw: { id: "123", name: "Signature Tee" },
    ...overrides,
  };
}

test("public merch products resolve enabled Admin banner assignments", () => {
  const products = publicProducts(
    [baseProduct()],
    [
      {
        productId: "123",
        printfulProductId: "123",
        slugOverride: "signature-tee",
        banners: [{ label: "Limited", slug: "limited", enabled: true, theme: "gold", sortOrder: 4 }],
      },
    ],
    {
      banners: [{ label: "LIMITED", slug: "limited", enabled: true, theme: "red", sortOrder: 1 }],
    }
  );

  assert.equal(products.length, 1);
  assert.deepEqual(products[0].banners, [{ label: "LIMITED", slug: "limited", enabled: true, sortOrder: 1, theme: "red" }]);
});

test("public merch products filter disabled registry and assignment banners", () => {
  const [product] = publicProducts(
    [baseProduct()],
    [
      {
        productId: "123",
        printfulProductId: "123",
        slugOverride: "signature-tee",
        banners: [
          { label: "LIMITED", slug: "limited", enabled: true, theme: "gold" },
          { label: "DRAFT", slug: "draft", enabled: false, theme: "neutral" },
        ],
      },
    ],
    {
      banners: [{ label: "LIMITED", slug: "limited", enabled: false, theme: "gold" }],
    }
  );

  assert.deepEqual(product.banners, []);
});

test("public merch products keep safe ad-hoc banner labels without registry rows", () => {
  const [product] = publicProducts(
    [baseProduct()],
    [
      {
        productId: "123",
        printfulProductId: "123",
        slugOverride: "signature-tee",
        banners: [{ label: "New", slug: "new", enabled: true, theme: "green" }],
      },
    ],
    { banners: [] }
  );

  assert.deepEqual(product.banners, [{ label: "NEW", slug: "new", enabled: true, sortOrder: 1, theme: "green" }]);
});
