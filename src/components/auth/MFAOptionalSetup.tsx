import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, X } from "lucide-react";
import { useState } from "react";

interface MFAOptionalSetupProps {
  onComplete: (enabled: boolean) => void;
  onSkip: () => void;
}

export const MFAOptionalSetup = ({
  onComplete,
  onSkip,
}: MFAOptionalSetupProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableMFA = () => {
    setIsLoading(true);

    // Store the preference in localStorage temporarily until we have proper DB support
    localStorage.setItem("mfa_enabled", "true");
    localStorage.setItem("mfa_setup_prompted", "true");

    toast({
      title: "MFA Enabled",
      description: "You will be prompted to set up MFA after signing in.",
    });

    setTimeout(() => {
      setIsLoading(false);
      onComplete(true);
    }, 500);
  };

  const handleSkipMFA = () => {
    setIsLoading(true);

    // Store the preference in localStorage temporarily
    localStorage.setItem("mfa_enabled", "false");
    localStorage.setItem("mfa_setup_prompted", "true");

    toast({
      title: "MFA Skipped",
      description: "You can enable MFA later from your account settings.",
    });

    setTimeout(() => {
      setIsLoading(false);
      onComplete(false);
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Secure Your Account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Would you like to enable multi-factor authentication for added
          security?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            MFA adds an extra layer of security by requiring a verification code
            when signing in.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleEnableMFA}
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Enable MFA"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSkipMFA}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can always enable MFA later from your account settings.
        </p>
      </CardContent>
    </Card>
  );
};
