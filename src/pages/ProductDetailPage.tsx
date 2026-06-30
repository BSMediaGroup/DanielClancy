import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { fetchMerchProduct, type MerchDetail, type MerchProduct } from "../lib/merch";

export function ProductDetailPage() {
  const { category = "", slug = "" } = useParams();
  const lookup = [category, slug].filter(Boolean).join("/");
  const [detail, setDetail] = useState<MerchDetail>({ ok: false, configured: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchMerchProduct(lookup, controller.signal)
      .then((result) => {
        setDetail(result);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setDetail({
          ok: false,
          configured: true,
          error: "product_not_found",
          message: "No public product matches this route.",
        });
        setLoading(false);
      });
    return () => controller.abort();
  }, [lookup]);

  const product = detail.product;

  if (!product) {
    return (
      <>
        <Seo title={loading ? "Loading product" : "Product not found"} description="Shop product lookup." path={`/products/${lookup}`} />
        <section className="shop-detail-hero shop-detail-hero--empty">
          <div className="container shop-detail-empty">
            <p className="kicker">Product detail</p>
            <h1>{loading ? "Checking the Printful product feed." : "Product not found."}</h1>
            <p>
              {loading
                ? "The server-side storefront endpoint is resolving this product route."
                : detail.message || "No public Printful product or published override matches this route."}
            </p>
            <Link className="button button--secondary" to="/shop">
              Back to shop
            </Link>
          </div>
        </section>
      </>
    );
  }

  return <ResolvedProductDetail product={product} />;
}

function ResolvedProductDetail({ product }: { product: MerchProduct }) {
  const gallery = useMemo(() => product.images.filter(Boolean), [product.images]);
  const [activeImage, setActiveImage] = useState(gallery[0] || "");

  useEffect(() => {
    setActiveImage(gallery[0] || "");
  }, [gallery]);

  return (
    <>
      <Seo
        title={product.title}
        description={product.description || "DanielClancy.net shop product detail."}
        path={`/products/${product.category || "product"}/${product.slug}`}
        image={product.thumbnailUrl}
        type="article"
      />

      <section className="shop-detail-hero">
        <div className="container shop-detail-grid">
          <div className="shop-gallery">
            <div className="shop-gallery__main">
              {activeImage ? (
                <img src={activeImage} alt={product.altText || product.title} />
              ) : (
                <div className="shop-product-image shop-product-image--empty">
                  <span>Image pending</span>
                </div>
              )}
            </div>
            {gallery.length > 1 ? (
              <div className="shop-gallery__thumbs" aria-label="Product image gallery">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={image === activeImage ? "is-active" : ""}
                    type="button"
                    onClick={() => setActiveImage(image)}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="shop-detail-copy">
            <p className="kicker">{product.category || "Category pending"}</p>
            <h1>{product.title}</h1>
            <p>{product.description || "Description pending from Printful or Admin override."}</p>
            <div className="shop-detail-price">
              <span>Price</span>
              <strong>{product.priceRange?.text || "Pending"}</strong>
            </div>
            <div className="shop-detail-actions">
              <button className="button" type="button" disabled>
                Checkout coming soon
              </button>
              <Link className="button button--ghost" to="/contact">
                Product inquiry
              </Link>
            </div>
            <dl className="shop-detail-meta">
              <div>
                <dt>Status</dt>
                <dd>{product.availability || product.status || "Pending"}</dd>
              </div>
              <div>
                <dt>Variants</dt>
                <dd>{product.variantCount || product.variants.length || "Pending"}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>Printful sync product</dd>
              </div>
              <div>
                <dt>Product ID</dt>
                <dd>{product.printfulProductId}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="shop-section shop-section--detail">
        <div className="container shop-detail-panels">
          <article className="shop-detail-panel">
            <p className="kicker">Options</p>
            <h2>Variants returned by Printful</h2>
            {product.variants.length ? (
              <div className="shop-variant-list">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="shop-variant-row">
                    <strong>{variant.name || variant.sku || variant.id}</strong>
                    <span>{variant.retailPrice ? `${variant.retailPrice}${variant.currency ? ` ${variant.currency}` : ""}` : "Price pending"}</span>
                    {variant.status ? <em>{variant.status}</em> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p>No variant details are available from the product feed yet.</p>
            )}
          </article>

          <article className="shop-detail-panel">
            <p className="kicker">Checkout state</p>
            <h2>Fulfilment is not connected to a public payment flow yet.</h2>
            <p>
              Product data is visible for review. Public customer ordering is intentionally disabled until
              payment capture, order creation, and fulfilment handling are wired end to end.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
