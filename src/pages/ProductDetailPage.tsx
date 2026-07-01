import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  CurrencySelect,
  CurrencyFlag,
  PriceWithFlag,
  convertAmount,
  formatMoney,
  useCurrencyRates,
  useConvertedAmount,
  type CurrencyCode,
} from "../lib/currency";
import { fetchMerchProduct, productCategoryLabel, productPath, type MerchDetail, type MerchProduct } from "../lib/merch";
import { addCartItem, cartCount, loadCart, saveCart } from "../lib/merchCart";

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
  const gallery = useMemo(() => (Array.isArray(product.images) ? product.images.filter(Boolean) : []), [product.images]);
  const [activeImage, setActiveImage] = useState(gallery[0] || "");
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || "");
  const [convertedCurrency, setConvertedCurrency] = useState<CurrencyCode>("USD");
  const [calculatorAmount, setCalculatorAmount] = useState("25");
  const rates = useCurrencyRates();
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    setActiveImage(gallery[0] || "");
  }, [gallery]);

  useEffect(() => {
    setSelectedVariantId(product.variants[0]?.id || "");
  }, [product]);

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) || product.variants[0] || null;
  const selectedPrice = Number.parseFloat(selectedVariant?.retailPrice || "");
  const mainAmount = Number.isFinite(selectedPrice) ? selectedPrice : product.priceRange?.min || null;
  const mainCurrency = selectedVariant?.currency || product.priceRange?.currency || "AUD";
  const convertedAmount = useConvertedAmount(mainAmount, mainCurrency, convertedCurrency, rates);
  const calculatorConverted = convertAmount(Number.parseFloat(calculatorAmount), "AUD", convertedCurrency, rates);

  function handleAddToCart() {
    if (!selectedVariant) {
      setCartMessage("Choose a product variant before adding to cart.");
      return;
    }
    const nextCart = addCartItem(loadCart(), product, selectedVariant, quantity);
    saveCart(nextCart);
    setCartMessage(`${cartCount(nextCart)} item${cartCount(nextCart) === 1 ? "" : "s"} in cart.`);
  }

  return (
    <>
      <Seo
        title={product.title}
        description={product.description || "DanielClancy.net shop product detail."}
        path={productPath(product)}
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
            <p className="kicker">{productCategoryLabel(product)}</p>
            <ProductBanners product={product} />
            <h1>{product.title}</h1>
            <p>{product.description || "Description pending from Printful or Admin override."}</p>
            <div className="shop-detail-price">
              <span>Price</span>
              <strong><PriceWithFlag amount={mainAmount} currency={mainCurrency} text={selectedVariant?.retailPrice ? `${formatMoney(selectedPrice, mainCurrency)} ${mainCurrency}` : product.priceRange?.text || "Price pending"} /></strong>
              <small>
                {convertedAmount === null ? (
                  "Conversion unavailable."
                ) : (
                  <>
                    Approx. <PriceWithFlag amount={convertedAmount} currency={convertedCurrency} text={`${formatMoney(convertedAmount, convertedCurrency)} ${convertedCurrency}`} />. Final checkout uses validated store currency.
                  </>
                )}
              </small>
            </div>
            <div className="currency-tools">
              <CurrencySelect value={convertedCurrency} onChange={setConvertedCurrency} />
              <label className="currency-calculator">
                <span><CurrencyFlag code="AUD" /> Convert custom AUD amount</span>
                <input className="input" inputMode="decimal" value={calculatorAmount} onChange={(event) => setCalculatorAmount(event.target.value)} />
                <strong>{calculatorConverted === null ? "Unavailable" : <PriceWithFlag amount={calculatorConverted} currency={convertedCurrency} text={`${formatMoney(calculatorConverted, convertedCurrency)} ${convertedCurrency}`} />}</strong>
              </label>
            </div>
            <div className="shop-purchase-controls">
              <label>
                <span>Variant</span>
                <select className="input" value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} disabled={!product.variants.length}>
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name || variant.sku || variant.id}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Quantity</span>
                <input className="input" type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
              </label>
            </div>
            <div className="shop-detail-actions">
              <button className="button" type="button" onClick={handleAddToCart} disabled={!selectedVariant}>
                Add to cart
              </button>
              <Link className="button button--secondary" to="/cart">
                View cart
              </Link>
              <Link className="button button--ghost" to="/contact">
                Product inquiry
              </Link>
            </div>
            {cartMessage ? <p className="form-status">{cartMessage}</p> : null}
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
                <dt>Category</dt>
                <dd>{productCategoryLabel(product)}</dd>
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
                    <span>{variant.retailPrice ? <PriceWithFlag amount={Number.parseFloat(variant.retailPrice)} currency={variant.currency || "AUD"} text={`${formatMoney(Number.parseFloat(variant.retailPrice), variant.currency || "AUD")} ${variant.currency || "AUD"}`} /> : "Price pending"}</span>
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
            <h2>Checkout validates cart and shipping server-side.</h2>
            <p>
              The browser stores only product, variant, and quantity selections. Prices, shipping, and payment
              handoff are recalculated through Pages Functions before checkout.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function ProductBanners({ product }: { product: MerchProduct }) {
  const banners = (product.banners || []).filter((banner) => banner.enabled !== false);
  if (!banners.length) return null;
  return (
    <div className="shop-banner-row" aria-label="Product promotions">
      {banners.map((banner) => (
        <span key={banner.slug} className={`shop-promo-banner shop-promo-banner--${banner.theme || "purple-orange"}`}>
          {banner.label}
        </span>
      ))}
    </div>
  );
}
