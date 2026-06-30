import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import { fetchMerchProducts, productPath, type MerchFeed, type MerchProduct } from "../lib/merch";

const initialFeed: MerchFeed = {
  ok: false,
  configured: true,
  products: [],
};

export function ShopPage() {
  const [feed, setFeed] = useState<MerchFeed>(initialFeed);
  const [loading, setLoading] = useState(true);
  const featured = useMemo(() => feed.products.filter((product) => product.featured).slice(0, 3), [feed.products]);
  const leadProducts = featured.length ? featured : feed.products.slice(0, 3);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchMerchProducts(controller.signal)
      .then((result) => {
        setFeed(result);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFeed({
          ok: false,
          configured: true,
          error: "merch_products_unavailable",
          message: "Merch products are unavailable.",
          products: [],
        });
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const hasProducts = feed.products.length > 0;

  return (
    <>
      <Seo
        title="Shop"
        description="DanielClancy.net merch storefront powered by server-side Printful product data."
        path="/shop"
        image={shellAssets.professionalShare}
      />

      <section className="shop-hero">
        <div className="container shop-hero__grid">
          <div className="shop-hero__copy">
            <h1>DanielClancy.net Shop</h1>
            <p>
              A focused merch storefront for Daniel Clancy and Brainstream Media Group product drops,
              powered by Printful product data when the store API is configured.
            </p>
            <div className="shop-hero__actions">
              <a className="button" href="#shop-products">
                Browse products
              </a>
              <Link className="button button--ghost" to="/contact">
                Product inquiry
              </Link>
            </div>
            <div className="shop-hero__status" aria-live="polite">
              <span>{loading ? "Checking Printful" : hasProducts ? `${feed.products.length} product records` : "Storefront pending"}</span>
              <strong>{loading ? "Loading" : feed.ok ? "Printful connected" : feed.configured ? "Printful unavailable" : "Printful not configured"}</strong>
            </div>
          </div>

          <div className="shop-feature-stack" aria-label="Featured shop products">
            {leadProducts.length ? (
              leadProducts.map((product) => <ShopFeatureCard key={product.id} product={product} />)
            ) : (
              <div className="shop-empty-card">
                <span>Printful status</span>
                <strong>{loading ? "Loading product feed" : "No public products available"}</strong>
                <p>
                  {loading
                    ? "The storefront is requesting the server-side Printful feed."
                    : feed.message ||
                      "Products will appear here after Printful is configured and public products are returned or published."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="shop-products" className="shop-section">
        <div className="container">
          <div className="shop-section__header">
            <div>
              <p className="kicker">Merch catalogue</p>
              <h2>Product records, live from the store feed.</h2>
            </div>
            <p>
              Checkout is intentionally pending until a real public payment/order flow is connected.
            </p>
          </div>

          {hasProducts ? (
            <div className="shop-grid">
              {feed.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="shop-empty-state">
              <p className="kicker">Storefront empty state</p>
              <h3>{loading ? "Loading products." : feed.configured ? "No public products are available yet." : "Printful is not configured locally."}</h3>
              <p>
                {loading
                  ? "The server-side feed is still resolving."
                  : feed.message ||
                    "Configure the server-side Printful store token in Cloudflare Pages Functions and publish product overrides from Admin when needed."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ShopFeatureCard({ product }: { product: MerchProduct }) {
  return (
    <Link className="shop-feature-card" to={productPath(product)}>
      <ProductImage product={product} />
      <div>
        <span>{product.category || "Category pending"}</span>
        <strong>{product.title}</strong>
        <small>{product.priceRange?.text || "Price pending"}</small>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: MerchProduct }) {
  return (
    <Link className="shop-product-card" to={productPath(product)}>
      <ProductImage product={product} />
      <div className="shop-product-card__body">
        <div className="shop-product-card__topline">
          <span>{product.category || "Category pending"}</span>
          {product.availability ? <em>{product.availability}</em> : null}
        </div>
        <h3>{product.title}</h3>
        <p>{product.description || "Description pending from Printful or Admin override."}</p>
        <div className="shop-product-card__meta">
          <strong>{product.priceRange?.text || "Price pending"}</strong>
          <span>{product.variantCount ? `${product.variantCount} variant${product.variantCount === 1 ? "" : "s"}` : "Variants pending"}</span>
        </div>
        <span className="text-link">View product</span>
      </div>
    </Link>
  );
}

function ProductImage({ product }: { product: MerchProduct }) {
  return product.thumbnailUrl ? (
    <img className="shop-product-image" src={product.thumbnailUrl} alt={product.altText || product.title} loading="lazy" />
  ) : (
    <div className="shop-product-image shop-product-image--empty" aria-hidden="true">
      <span>Image pending</span>
    </div>
  );
}
