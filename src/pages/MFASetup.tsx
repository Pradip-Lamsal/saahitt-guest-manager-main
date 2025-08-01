import { MFASetup } from "@/components/auth/MFASetup";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MFASetupPage = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuthSession();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  const handleMFAComplete = () => {
    navigate("/dashboard");
  };

  const handleMFASkip = () => {
    navigate("/dashboard");
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
            Secure Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up multi-factor authentication for enhanced security
          </p>
        </div>

        <MFASetup
          onComplete={handleMFAComplete}
          onSkip={handleMFASkip}
          isOptional={true}
        />
      </div>
    </div>
  );
};

export default MFASetupPage;
