import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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
  const { isAuthenticated, loading, session } = useAuthSession();
  const location = useLocation();
  const [mfaLoading, setMfaLoading] = useState(true);
  const [hasMFA, setHasMFA] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Check if user has MFA enabled and set up when they're authenticated
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (isAuthenticated && session) {
        try {
          // Check if user has enabled MFA (from localStorage for now)
          const mfaEnabledPref = localStorage.getItem("mfa_enabled") === "true";
          setMfaEnabled(mfaEnabledPref);

          if (mfaEnabledPref) {
            // Only check for actual MFA factors if user has enabled MFA
            const { data: factorData, error: factorError } =
              await supabase.auth.mfa.listFactors();

            if (!factorError && factorData?.all) {
              const verifiedFactors = factorData.all.filter(
                (factor) => factor.status === "verified"
              );
              setHasMFA(verifiedFactors.length > 0);
            } else {
              setHasMFA(false);
            }
          } else {
            // User hasn't enabled MFA, so they don't need it
            setHasMFA(true); // Allow access
          }
        } catch (error) {
          console.error("Error checking MFA status:", error);
          setHasMFA(!mfaEnabled); // If error and MFA not enabled, allow access
        }
      }
      setMfaLoading(false);
    };

    if (isAuthenticated) {
      checkMFAStatus();
    } else {
      setMfaLoading(false);
    }
  }, [isAuthenticated, session, mfaEnabled]);

  if (loading || mfaLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPath = location.pathname + location.search;

  // If not authenticated at all, redirect to auth
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(currentPath)}`}
        replace
      />
    );
  }

  // If authenticated but accessing MFA setup page, allow it
  if (location.pathname === "/mfa-setup") {
    return <>{children}</>;
  }

  // If user has enabled MFA but hasn't set it up yet, force MFA setup
  if (mfaEnabled && !hasMFA) {
    return <Navigate to="/mfa-setup?mandatory=true" replace />;
  }

  // If authenticated and either doesn't need MFA or has MFA properly set up, allow access
  return <>{children}</>;
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
    </TooltipProvider>
  );
};

export default App;
