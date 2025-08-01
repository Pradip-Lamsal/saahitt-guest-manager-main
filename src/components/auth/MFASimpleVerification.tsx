import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MFAFactor {
  id: string;
  factor_type: string;
  status: string;
}

interface MFASimpleVerificationProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const MFASimpleVerification = ({
  onSuccess,
  onBack,
}: MFASimpleVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [challengeInitialized, setChallengeInitialized] = useState(false);

  // Use refs to avoid dependency issues
  const toastRef = useRef(toast);
  const onBackRef = useRef(onBack);

  // Update refs when props change
  useEffect(() => {
    toastRef.current = toast;
    onBackRef.current = onBack;
  }, [toast, onBack]);

  const initializeMFAChallenge = useCallback(async () => {
    // Prevent multiple initializations
    if (challengeInitialized) {
      return;
    }

    try {
      setLoading(true);

      // Get all MFA factors for the user
      const { data: factorData, error: factorError } =
        await supabase.auth.mfa.listFactors();

      if (factorError) throw factorError;

      const verifiedFactors =
        factorData?.all?.filter((factor) => factor.status === "verified") || [];
      setFactors(verifiedFactors);

      if (verifiedFactors.length === 0) {
        toastRef.current({
          title: "No MFA Setup",
          description: "Please set up MFA first.",
          variant: "destructive",
        });
        onBackRef.current?.();
        return;
      }

      // Use the first verified factor (typically TOTP)
      const factor = verifiedFactors[0];

      // Create MFA challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

      if (challengeError) throw challengeError;

      setCurrentChallenge(challengeData.id);
      setChallengeInitialized(true);

      toastRef.current({
        title: "Enter Verification Code",
        description:
          "Please enter the 6-digit code from your authenticator app.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize MFA challenge";
      console.error("Error initializing MFA challenge:", error);
      toastRef.current({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [challengeInitialized]); // Only depend on challengeInitialized

  useEffect(() => {
    initializeMFAChallenge();
  }, [initializeMFAChallenge]);

  const verifyTOTP = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    if (!currentChallenge) {
      toast({
        title: "No Challenge",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple rapid API calls
    if (loading || isVerifying) {
      return;
    }

    try {
      setLoading(true);
      setIsVerifying(true);

      // Verify the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: factors[0]?.id,
        challengeId: currentChallenge,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "You have been authenticated successfully.",
      });

      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid verification code";
      console.error("Error verifying TOTP:", error);
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Clear the code for retry
      setVerificationCode("");
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  }, [
    verificationCode,
    currentChallenge,
    factors,
    onSuccess,
    toast,
    loading,
    isVerifying,
  ]);

  const handleRetry = useCallback(() => {
    setVerificationCode("");
    setCurrentChallenge(null);
    setChallengeInitialized(false); // Reset to allow re-initialization
    initializeMFAChallenge();
  }, [initializeMFAChallenge]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Multi-Factor Authentication</CardTitle>
        <p className="text-sm text-muted-foreground">
          {loading && !challengeInitialized
            ? "Initializing authentication challenge..."
            : "Enter the verification code from your authenticator app"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !challengeInitialized ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Setting up authentication challenge...
            </p>
          </div>
        ) : (
          <>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Open your authenticator app and enter the 6-digit code for this
                account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={verifyTOTP}
                disabled={
                  loading || isVerifying || verificationCode.length !== 6
                }
              >
                {loading || isVerifying ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleRetry}
                disabled={loading || isVerifying}
              >
                Generate New Challenge
              </Button>

              {onBack && (
                <Button variant="link" className="w-full" onClick={onBack}>
                  Back to Login
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
