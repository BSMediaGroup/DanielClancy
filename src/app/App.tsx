import { Navigate, Route, Routes } from "react-router-dom";
import { PersonalShell } from "../components/PersonalShell";
import { PageVisitBeacon } from "../components/PageVisitBeacon";
import { ProfessionalShell } from "../components/ProfessionalShell";
import { PublicSiteDataProvider } from "../lib/publicSiteData";
import { ContactPage } from "../pages/ContactPage";
import { CartPage, ShopCancelPage, ShopSuccessPage } from "../pages/CartPage";
import { CvPage } from "../pages/CvPage";
import { DonatePage } from "../pages/DonatePage";
import { HomePage } from "../pages/HomePage";
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
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/shop/success" element={<ShopSuccessPage />} />
          <Route path="/shop/cancel" element={<ShopCancelPage />} />
          <Route path="/store" element={<Navigate to="/shop" replace />} />
          <Route path="/merch" element={<Navigate to="/shop" replace />} />
          <Route path="/products/:category/:slug" element={<ProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route element={<PersonalShell />}>
          <Route path="/home" element={<PersonalHomePage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/donate" element={<DonatePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PublicSiteDataProvider>
  );
}
