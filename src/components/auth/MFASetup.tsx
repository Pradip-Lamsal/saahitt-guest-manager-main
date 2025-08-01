import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Copy,
  Mail,
  Scan,
  Shield,
  Smartphone,
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";

interface MFAFactor {
  id: string;
  type: string;
  status: string;
  friendly_name?: string;
  totp?: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

interface MFASetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
  isOptional?: boolean;
}

export const MFASetup = ({
  onComplete,
  onSkip,
  isOptional = true,
}: MFASetupProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"totp" | "email">("totp");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailOTP, setEmailOTP] = useState("");
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [currentFactor, setCurrentFactor] = useState<MFAFactor | null>(null);
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [secretCopied, setSecretCopied] = useState(false);

  // Load existing MFA factors
  const loadMFAFactors = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(
        (data?.all || []).map((factor) => ({
          id: factor.id,
          type: factor.factor_type || "totp",
          status: factor.status || "unverified",
          friendly_name: factor.friendly_name,
        }))
      );
    } catch (error) {
      console.error("Error loading MFA factors:", error);
    }
  }, []);

  useEffect(() => {
    loadMFAFactors();
  }, [loadMFAFactors]);

  // Setup TOTP factor
  const setupTOTP = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to set up MFA.",
          variant: "destructive",
        });
        return;
      }

      // Check existing factors first
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        toast({
          title: "MFA Check Failed",
          description:
            "Unable to check existing MFA factors. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has a verified TOTP factor
      if (factorsData?.all) {
        const verifiedTOTPFactors = factorsData.all.filter(
          (factor) =>
            factor.factor_type === "totp" && factor.status === "verified"
        );

        if (verifiedTOTPFactors.length > 0) {
          toast({
            title: "MFA Already Set Up",
            description: "You already have MFA configured and verified.",
          });
          await loadMFAFactors();
          onComplete?.();
          return;
        }

        // Clean up any unverified factors to avoid conflicts
        const unverifiedFactors = factorsData.all.filter(
          (factor) =>
            factor.factor_type === "totp" && factor.status === "unverified"
        );

        for (const factor of unverifiedFactors) {
          try {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          } catch (err) {
            console.log("Could not remove incomplete factor:", err);
          }
        }
      }

      // Create new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) {
        // Handle specific error cases
        if (
          error.message.includes("MFA enrollment is disabled") ||
          error.message.includes("MFA is not enabled")
        ) {
          toast({
            title: "MFA Configuration Issue",
            description:
              "MFA needs to be enabled in your Supabase project settings first.",
            variant: "destructive",
          });
        } else if (
          error.message.includes("upgrade") ||
          error.message.includes("plan")
        ) {
          toast({
            title: "Upgrade Required",
            description: "MFA requires a Supabase Pro plan or higher.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "MFA Setup Error",
            description: `Failed to set up MFA: ${error.message}`,
            variant: "destructive",
          });
        }
        return;
      }

      if (data) {
        setCurrentFactor({
          ...data,
          status: "unverified",
        });
        setTotpSecret(data.totp?.secret || "");

        // Generate QR code
        if (data.totp?.uri) {
          const qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri);
          setQrCodeUrl(qrCodeDataUrl);
        }

        setStep("verify");
        toast({
          title: "MFA Setup Started",
          description: "Scan the QR code with your authenticator app.",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup Email OTP
  const setupEmailOTP = async () => {
    setLoading(true);
    try {
      // For email OTP, we'll use a simplified approach
      // In a real implementation, this would set up email-based MFA
      toast({
        title: "Email OTP Not Available",
        description:
          "Email OTP is not currently supported. Please use the authenticator app instead.",
        variant: "destructive",
      });

      // Switch to TOTP method
      setActiveMethod("totp");
    } catch (error) {
      console.error("Email OTP setup error:", error);
      toast({
        title: "Setup Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to setup email verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify TOTP code
  const verifyTOTP = async () => {
    if (!currentFactor || !verificationCode) return;

    setLoading(true);
    try {
      // First, we need to create a challenge for the factor
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: currentFactor.id,
        });

      if (challengeError) throw challengeError;

      // Then verify the challenge with the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: currentFactor.id,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: "MFA Setup Complete",
        description: "Authenticator app has been successfully configured",
      });

      await loadMFAFactors();
      onComplete?.();
    } catch (error) {
      console.error("TOTP verification error:", error);
      toast({
        title: "Verification Failed",
        description:
          error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const verifyEmailOTP = async () => {
    if (!emailOTP) return;

    setLoading(true);
    try {
      // In a real implementation, this would verify the email OTP
      // For now, we'll simulate the verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "MFA Setup Complete",
        description: "Email verification has been successfully configured",
      });

      await loadMFAFactors();
      onComplete?.();
    } catch (error) {
      console.error("Email OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy secret to clipboard
  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret);
      setSecretCopied(true);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Check if MFA is already enabled
  const isMFAEnabled = factors.some((factor) => factor.status === "verified");

  if (isMFAEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Multi-Factor Authentication Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is secured with multi-factor authentication.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Active Methods:</h4>
              {factors
                .filter((f) => f.status === "verified")
                .map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {factor.type === "totp" ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {factor.friendly_name || factor.type}
                      </span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set Up Multi-Factor Authentication
            {isOptional && <Badge variant="outline">Optional</Badge>}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account. Choose at least one
            method.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "setup" && (
            <Tabs
              value={activeMethod}
              onValueChange={(value) =>
                setActiveMethod(value as "totp" | "email")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="totp" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authenticator App
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="totp" className="space-y-4">
                <Alert>
                  <Scan className="h-4 w-4" />
                  <AlertDescription>
                    Use an authenticator app like Google Authenticator, Authy,
                    or 1Password to generate time-based codes.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> If you see an "MFA disabled" error,
                    Multi-Factor Authentication needs to be enabled in your
                    Supabase project dashboard first. Visit Authentication →
                    Settings in your Supabase dashboard.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={setupTOTP}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Setting up..." : "Set Up Authenticator App"}
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Receive verification codes via email when signing in.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={setupEmailOTP}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Setting up..." : "Set Up Email Verification"}
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {step === "verify" && activeMethod === "totp" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="font-medium">Scan QR Code</h3>
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="border rounded"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Or enter this secret key manually:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={totpSecret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copySecret}>
                      {secretCopied ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>
                  Enter verification code from your authenticator app:
                </Label>
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

                <Button
                  onClick={verifyTOTP}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </div>
          )}

          {step === "verify" && activeMethod === "email" && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  We've sent a verification code to your email address. Enter it
                  below to complete setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label>Enter verification code from email:</Label>
                <InputOTP value={emailOTP} onChange={setEmailOTP} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <Button
                  onClick={verifyEmailOTP}
                  disabled={loading || emailOTP.length !== 6}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </div>
          )}

          {isOptional && step === "setup" && (
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onSkip}>
                Skip for Now
              </Button>
              <Button onClick={() => onComplete?.()}>
                Continue Without MFA
              </Button>
            </div>
          )}

          {step === "verify" && (
            <Button
              variant="outline"
              onClick={() => setStep("setup")}
              className="w-full"
            >
              Back to Setup
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
