import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SecureLogger from "@/utils/logger";
import { CheckCircle, Clock, Mail, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "pending"
  >("pending");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const email = searchParams.get("email");

  const verifyEmail = useCallback(async () => {
    setStatus("verifying");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token!,
        type: "email",
      });

      if (error) {
        SecureLogger.error("Email verification error:", error);
        setStatus("error");
        setMessage(error.message || "Failed to verify email address");
        return;
      }

      if (data.user) {
        SecureLogger.logAuthEvent("Email verified successfully", {
          userId: data.user.id,
        });
        setStatus("success");
        setMessage("Your email has been verified successfully!");

        toast({
          title: "Email Verified",
          description: "Your account has been activated. You can now sign in.",
        });

        // Redirect to auth page after a delay
        setTimeout(() => {
          navigate("/auth?tab=signin", { replace: true });
        }, 3000);
      }
    } catch (error) {
      SecureLogger.error("Email verification exception:", error);
      setStatus("error");
      setMessage("An unexpected error occurred during verification");
    }
  }, [token, toast, navigate]);

  useEffect(() => {
    // If we have a token and type from email link, verify it
    if (token && type === "email") {
      verifyEmail();
    }
  }, [token, type, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email address not found. Please try signing up again.",
      });
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`,
        },
      });

      if (error) {
        SecureLogger.error("Resend verification error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to resend verification email",
        });
        return;
      }

      toast({
        title: "Email Sent",
        description: "A new verification email has been sent to your address.",
      });

      SecureLogger.logAuthEvent("Verification email resent", { email });
    } catch (error) {
      SecureLogger.error("Resend verification exception:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while resending the email",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Mail className="w-12 h-12 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "verifying":
        return "Verifying your email address...";
      case "success":
        return "Email verified successfully!";
      case "error":
        return "Email verification failed";
      default:
        return "Check your email for verification";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{getStatusMessage()}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "pending" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                We've sent a verification email to your address. Please check
                your inbox and click the verification link.
              </AlertDescription>
            </Alert>
          )}

          {status === "verifying" && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Please wait while we verify your email address...
              </AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {message} You will be redirected to the sign-in page shortly.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {(status === "pending" || status === "error") && (
              <Button
                onClick={resendVerificationEmail}
                variant="outline"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}

            <Button
              onClick={() => navigate("/auth")}
              variant="link"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
