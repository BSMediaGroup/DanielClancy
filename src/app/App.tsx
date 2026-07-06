import { Navigate, Route, Routes } from "react-router-dom";
import { PersonalShell } from "../components/PersonalShell";
import { PageVisitBeacon } from "../components/PageVisitBeacon";
import { ProfessionalShell } from "../components/ProfessionalShell";
import { PublicSiteDataProvider } from "../lib/publicSiteData";
import {
  AccountAddressesPage,
  AccountLoginPage,
  AccountLogoutPage,
  AccountOrdersPage,
  AccountPage,
  AccountPaymentsPage,
  AccountPreferencesPage,
  AccountProfilePage,
} from "../pages/AccountPage";
import { ContactPage } from "../pages/ContactPage";
import { CartPage, ShopCancelPage, ShopSuccessPage } from "../pages/CartPage";
import { CvPage } from "../pages/CvPage";
import { DonatePage } from "../pages/DonatePage";
import { HomePage } from "../pages/HomePage";
import { LivePage } from "../pages/LivePage";
import { PersonalHomePage } from "../pages/PersonalHomePage";
import { PortfolioDetailPage } from "../pages/PortfolioDetailPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { ShopPage } from "../pages/ShopPage";
import { TermsPage } from "../pages/TermsPage";
import { WatchPage } from "../pages/WatchPage";

export default function App() {
  return (
    <PublicSiteDataProvider>
      <PageVisitBeacon />
      <Routes>
        <Route element={<ProfessionalShell />}>
          <Route index element={<HomePage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/work" element={<PortfolioPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route element={<PersonalShell />}>
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
