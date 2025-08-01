import SecurityMonitor from "@/components/security/SecurityMonitor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import EmailSupport from "./pages/EmailSupport";
import EmailVerification from "./pages/EmailVerification";
import FAQPage from "./pages/FAQPage";
import Help from "./pages/Help";
import GuestCategoriesArticle from "./pages/help/GuestCategoriesArticle";
import ImportGuestsArticle from "./pages/help/ImportGuestsArticle";
import PrintListsArticle from "./pages/help/PrintListsArticle";
import TrackRSVPsArticle from "./pages/help/TrackRSVPsArticle";
import UpgradePlanArticle from "./pages/help/UpgradePlanArticle";
import Index from "./pages/Index";
import MFASetupPage from "./pages/MFASetup";
import NotFound from "./pages/NotFound";
import PaymentLoading from "./pages/PaymentLoading";
import PaymentSuccess from "./pages/PaymentSuccess";
import PricingPage from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import RSVP from "./pages/RSVP";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPath = location.pathname + location.search;
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to={`/auth?redirect=${encodeURIComponent(currentPath)}`}
      replace
    />
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route
          path="/mfa-setup"
          element={
            <ProtectedRoute>
              <MFASetupPage />
            </ProtectedRoute>
          }
        />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/email-support" element={<EmailSupport />} />
        <Route path="/rsvp/:token" element={<RSVP />} />
        <Route path="/payment-loading" element={<PaymentLoading />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Help Articles */}
        <Route
          path="/help/article/import-guests"
          element={<ImportGuestsArticle />}
        />
        <Route
          path="/help/article/guest-categories"
          element={<GuestCategoriesArticle />}
        />
        <Route
          path="/help/article/track-rsvps"
          element={<TrackRSVPsArticle />}
        />
        <Route
          path="/help/article/print-lists"
          element={<PrintListsArticle />}
        />
        <Route
          path="/help/article/upgrade-plan"
          element={<UpgradePlanArticle />}
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Security Monitor - shown globally but only renders when needed */}
      <SecurityMonitor />
    </TooltipProvider>
  );
};

export default App;
