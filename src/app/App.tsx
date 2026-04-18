import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "../components/SiteLayout";
import { ContactPage } from "../pages/ContactPage";
import { CvPage } from "../pages/CvPage";
import { DonatePage } from "../pages/DonatePage";
import { HomePage } from "../pages/HomePage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { WatchPage } from "../pages/WatchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/cv" element={<CvPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/watch" element={<WatchPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
