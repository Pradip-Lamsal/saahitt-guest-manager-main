import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const MFADebugger = () => {
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    let info = "=== MFA Diagnostics ===\n\n";

    try {
      // Check session
      const { data: sessionData } = await supabase.auth.getSession();
      info += `Session Status: ${
        sessionData.session ? "Authenticated" : "Not authenticated"
      }\n`;

      if (sessionData.session?.user) {
        info += `User ID: ${sessionData.session.user.id}\n`;
        info += `User Email: ${sessionData.session.user.email}\n`;
        info += `Email Confirmed: ${
          sessionData.session.user.email_confirmed_at ? "Yes" : "No"
        }\n`;
        info += `User Role: ${sessionData.session.user.role || "Not set"}\n`;
      }
      info += "\n";

      // Try to list MFA factors
      try {
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors();
        if (factorsError) {
          info += `List Factors Error: ${factorsError.message}\n`;
          info += `Error Code: ${factorsError.code || "No code"}\n`;
        } else {
          info += `List Factors: Success\n`;
          info += `Existing Factors: ${factorsData?.all?.length || 0}\n`;
        }
      } catch (err) {
        info += `List Factors Exception: ${err}\n`;
      }
      info += "\n";

      // Try to enroll (this will likely fail but give us the exact error)
      try {
        const { data: enrollData, error: enrollError } =
          await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: "Debug Test",
          });

        if (enrollError) {
          info += `Enroll Error Message: ${enrollError.message}\n`;
          info += `Enroll Error Code: ${enrollError.code || "No code"}\n`;
          info += `Full Enroll Error: ${JSON.stringify(
            enrollError,
            null,
            2
          )}\n`;
        } else {
          info += `Enroll: Success! (This shouldn't happen in debug mode)\n`;
          info += `Factor ID: ${enrollData?.id}\n`;
        }
      } catch (err) {
        info += `Enroll Exception: ${err}\n`;
      }

      // Check project info
      info += "\n=== Project Info ===\n";
      info += `Supabase URL: https://wifcukhtssicphdfrtex.supabase.co\n`;

      setDebugInfo(info);

      // Also log to console
      console.log(info);

      toast({
        title: "Diagnostics Complete",
        description:
          "Check the debug info below and browser console for details.",
      });
    } catch (error) {
      const errorInfo = `General Error: ${error}\n`;
      setDebugInfo(info + errorInfo);
      console.error("Diagnostics error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>MFA Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} className="w-full">
          {loading ? "Running Diagnostics..." : "Run MFA Diagnostics"}
        </Button>

        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Debug Information:</h4>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
