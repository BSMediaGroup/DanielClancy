import { lazy, Suspense, useLayoutEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PageVisitBeacon } from "../components/PageVisitBeacon";
import { ProfessionalShell } from "../components/ProfessionalShell";
import { PublicSiteDataProvider } from "../lib/publicSiteData";
import { HomePage } from "../pages/HomePage";

const PersonalShell = lazy(() =>
  import("../components/PersonalShell").then((module) => ({ default: module.PersonalShell })),
);
const ContactPage = lazy(() =>
  import("../pages/ContactPage").then((module) => ({ default: module.ContactPage })),
);
const CvPage = lazy(() =>
  import("../pages/CvPage").then((module) => ({ default: module.CvPage })),
);
const PortfolioDetailPage = lazy(() =>
  import("../pages/PortfolioDetailPage").then((module) => ({ default: module.PortfolioDetailPage })),
);
const PortfolioPage = lazy(() =>
  import("../pages/PortfolioPage").then((module) => ({ default: module.PortfolioPage })),
);
const PrivacyPage = lazy(() =>
  import("../pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("../pages/TermsPage").then((module) => ({ default: module.TermsPage })),
);
const AccountPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountPage })),
);
const AccountLoginPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountLoginPage })),
);
const AccountProfilePage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountProfilePage })),
);
const AccountOrdersPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountOrdersPage })),
);
const AccountAddressesPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountAddressesPage })),
);
const AccountPreferencesPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountPreferencesPage })),
);
const AccountPaymentsPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountPaymentsPage })),
);
const AccountLogoutPage = lazy(() =>
  import("../pages/AccountPage").then((module) => ({ default: module.AccountLogoutPage })),
);
const CartPage = lazy(() =>
  import("../pages/CartPage").then((module) => ({ default: module.CartPage })),
);
const ShopSuccessPage = lazy(() =>
  import("../pages/CartPage").then((module) => ({ default: module.ShopSuccessPage })),
);
const ShopCancelPage = lazy(() =>
  import("../pages/CartPage").then((module) => ({ default: module.ShopCancelPage })),
);
const DonatePage = lazy(() =>
  import("../pages/DonatePage").then((module) => ({ default: module.DonatePage })),
);
const LivePage = lazy(() =>
  import("../pages/LivePage").then((module) => ({ default: module.LivePage })),
);
const PersonalHomePage = lazy(() =>
  import("../pages/PersonalHomePage").then((module) => ({ default: module.PersonalHomePage })),
);
const ProductDetailPage = lazy(() =>
  import("../pages/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })),
);
const ShopPage = lazy(() =>
  import("../pages/ShopPage").then((module) => ({ default: module.ShopPage })),
);
const WatchPage = lazy(() =>
  import("../pages/WatchPage").then((module) => ({ default: module.WatchPage })),
);

export default function App() {
  return (
    <PublicSiteDataProvider>
      <RouteScrollManager />
      <PageVisitBeacon />
      <Routes>
        <Route element={<ProfessionalShell />}>
          <Route index element={<HomePage />} />
          <Route path="/cv" element={<DeferredRoute><CvPage /></DeferredRoute>} />
          <Route path="/work" element={<DeferredRoute><PortfolioPage /></DeferredRoute>} />
          <Route path="/work/:slug" element={<DeferredRoute><PortfolioDetailPage /></DeferredRoute>} />
          <Route path="/workset/:slug" element={<DeferredRoute><PortfolioDetailPage /></DeferredRoute>} />
          <Route path="/portfolio" element={<DeferredRoute><PortfolioPage /></DeferredRoute>} />
          <Route path="/portfolio/:slug" element={<DeferredRoute><PortfolioDetailPage /></DeferredRoute>} />
          <Route path="/contact" element={<DeferredRoute><ContactPage /></DeferredRoute>} />
          <Route path="/privacy" element={<DeferredRoute><PrivacyPage /></DeferredRoute>} />
          <Route path="/terms" element={<DeferredRoute><TermsPage /></DeferredRoute>} />
        </Route>

        <Route element={<Suspense fallback={null}><PersonalShell /></Suspense>}>
          <Route path="/home" element={<PersonalHomePage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/login" element={<AccountLoginPage />} />
          <Route path="/account/profile" element={<AccountProfilePage />} />
          <Route path="/account/orders" element={<AccountOrdersPage />} />
          <Route path="/account/addresses" element={<AccountAddressesPage />} />
          <Route path="/account/preferences" element={<AccountPreferencesPage />} />
          <Route path="/account/payments" element={<AccountPaymentsPage />} />
          <Route path="/account/logout" element={<AccountLogoutPage />} />
          <Route path="/shop/success" element={<ShopSuccessPage />} />
          <Route path="/shop/cancel" element={<ShopCancelPage />} />
          <Route path="/store" element={<Navigate to="/shop" replace />} />
          <Route path="/merch" element={<Navigate to="/shop" replace />} />
          <Route path="/products/all" element={<ShopPage />} />
          <Route path="/products/:category" element={<ShopPage />} />
          <Route path="/products/:category/:slug" element={<ProductDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PublicSiteDataProvider>
  );
}

function DeferredRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

function RouteScrollManager() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
          target.scrollIntoView({ behavior: "instant" as ScrollBehavior });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [hash, pathname]);

  return null;
}
