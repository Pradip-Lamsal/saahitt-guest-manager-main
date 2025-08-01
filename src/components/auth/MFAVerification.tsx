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
import { useCallback, useEffect, useState } from "react";

interface MFAFactor {
  id: string;
  factor_type: string;
  status: string;
}

interface MFAVerificationProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const MFAVerification = ({
  onSuccess,
  onBack,
}: MFAVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);

  const initializeMFAChallenge = useCallback(async () => {
    try {
      // Get all MFA factors for the user
      const { data: factorData, error: factorError } =
        await supabase.auth.mfa.listFactors();

      if (factorError) throw factorError;

      const verifiedFactors =
        factorData?.all?.filter((factor) => factor.status === "verified") || [];
      setFactors(verifiedFactors);

      if (verifiedFactors.length === 0) {
        toast({
          title: "No MFA Setup",
          description: "No MFA methods are configured for your account.",
          variant: "destructive",
        });
        onBack?.();
        return;
      }

      // Create a challenge for the first verified TOTP factor
      const totpFactor = verifiedFactors.find(
        (factor) => factor.factor_type === "totp"
      );

      if (totpFactor) {
        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId: totpFactor.id,
          });

        if (challengeError) throw challengeError;
        setCurrentChallenge(challengeData.id);
      }
    } catch (error) {
      console.error("MFA challenge initialization error:", error);
      toast({
        title: "MFA Error",
        description: "Failed to initialize MFA verification",
        variant: "destructive",
      });
      onBack?.();
    }
  }, [toast, onBack]);

  // Initialize MFA challenge on component mount
  useEffect(() => {
    initializeMFAChallenge();
  }, [initializeMFAChallenge]);

  const verifyMFACode = async () => {
    if (!currentChallenge || !verificationCode) return;

    setLoading(true);
    try {
      // Find the TOTP factor
      const totpFactor = factors.find(
        (factor) => factor.factor_type === "totp"
      );

      if (!totpFactor) {
        throw new Error("No TOTP factor found");
      }

      // Verify the MFA code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: currentChallenge,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "You have been successfully authenticated",
      });

      onSuccess?.();
    } catch (error) {
      console.error("MFA verification error:", error);
      toast({
        title: "Verification Failed",
        description:
          error instanceof Error
            ? error.message
            : "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      setVerificationCode(""); // Clear the code on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the verification code from your authenticator app to complete
          sign in.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Open your authenticator app and enter the 6-digit code for this
            account.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Enter verification code:</Label>
          <div className="flex justify-center">
            <InputOTP
              value={verificationCode}
              onChange={setVerificationCode}
              maxLength={6}
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

          <Button
            onClick={verifyMFACode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          {onBack && (
            <Button variant="outline" onClick={onBack} className="w-full">
              Back to Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
