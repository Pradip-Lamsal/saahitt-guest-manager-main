import { MFASetup } from "@/components/auth/MFASetup";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const MFASetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, loading } = useAuthSession();
  const [isMandatory, setIsMandatory] = useState(false);

  useEffect(() => {
    // Check if MFA setup is mandatory
    const mandatoryParam = searchParams.get("mandatory");
    setIsMandatory(mandatoryParam === "true");
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !session) {
      // If no session and it's mandatory setup, redirect to auth
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  const handleMFAComplete = () => {
    if (isMandatory) {
      // For mandatory setup, redirect to auth to restart login process
      navigate("/auth?tab=signin&message=mfa_setup_complete");
    } else {
      navigate("/dashboard");
    }
  };

  const handleMFASkip = () => {
    if (isMandatory) {
      // Can't skip if mandatory - show error or redirect to auth
      navigate("/auth?tab=signin&message=mfa_required");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isMandatory ? "Security Setup Required" : "Secure Your Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isMandatory
              ? "Multi-factor authentication is mandatory for all accounts. Please set it up to continue."
              : "Set up multi-factor authentication for enhanced security"}
          </p>
          {isMandatory && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Required:</strong> You must complete MFA setup before
                accessing your account.
              </p>
            </div>
          )}
        </div>

        <MFASetup
          onComplete={handleMFAComplete}
          onSkip={handleMFASkip}
          isOptional={!isMandatory}
        />
      </div>
    </div>
  );
};

export default MFASetupPage;
