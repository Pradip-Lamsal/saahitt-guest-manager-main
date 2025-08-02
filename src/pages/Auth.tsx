import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { MFAOptionalSetup } from "@/components/auth/MFAOptionalSetup";
import { MFASetup } from "@/components/auth/MFASetup";
import { MFASimpleVerification } from "@/components/auth/MFASimpleVerification";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from "@/lib/passwordValidation";
import InputValidator from "@/utils/inputValidator";
import SecureLogger from "@/utils/logger";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [activeTab, setActiveTab] = useState("signin");
  const [currentView, setCurrentView] = useState<
    "auth" | "forgot" | "reset" | "mfa" | "mfa_optional"
  >("auth");
  const [mfaStep, setMfaStep] = useState<
    "login" | "mfa_setup" | "mfa_verify" | "mfa_optional"
  >("login");
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // Get redirect path from URL if present, with fallback handling for Vercel
  const getRedirectPath = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get("redirect");
    // Use a relative path to ensure it works in all deployment environments
    return redirect ? decodeURIComponent(redirect) : "/dashboard";
  }, [location.search]);

  // Parse URL params to determine initial tab and check for session expiry message
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    const mode = searchParams.get("mode");
    const expired = searchParams.get("expired");
    const message = searchParams.get("message");

    if (mode === "reset") {
      setCurrentView("reset");
    } else if (mode === "confirmed") {
      // Handle email confirmation success
      toast({
        title: "Email Verified!",
        description:
          "Your email has been verified successfully. You can now sign in to your account.",
      });
      setActiveTab("signin");
      // Clear the URL parameters
      navigate("/auth", { replace: true });
    } else if (tab) {
      setActiveTab(tab === "signup" ? "signup" : "signin");
    }

    if (expired === "true") {
      toast({
        title: "Session Expired",
        description:
          "Your session has expired. Please sign in again to continue.",
        variant: "destructive",
      });
    }

    // Handle messages from MFA setup
    if (message === "mfa_setup_complete") {
      toast({
        title: "MFA Setup Complete",
        description:
          "Multi-factor authentication is now enabled. Please sign in again to verify.",
      });
    } else if (message === "mfa_required") {
      toast({
        title: "MFA Required",
        description:
          "Multi-factor authentication setup is mandatory for all accounts.",
        variant: "destructive",
      });
    }
  }, [location, toast, setActiveTab, setCurrentView, navigate]);

  // Check for existing session on component mount and redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (session) {
          // Valid session, redirect
          const redirectPath = getRedirectPath();
          SecureLogger.logAuthEvent("User already logged in", { redirectPath });
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        SecureLogger.error("Error checking session:", error);
      }
    };

    checkSession();
  }, [navigate, getRedirectPath, toast]);

  // Set up auth state change listener with improved error handling
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      SecureLogger.logAuthEvent("Auth state changed", {
        event,
        hasSession: session ? "session exists" : "no session",
      });

      // Only auto-redirect on SIGNED_IN if we're not in the middle of MFA flow
      if (
        event === "SIGNED_IN" &&
        session &&
        currentView !== "mfa" &&
        mfaStep === "login"
      ) {
        try {
          // Check if user has MFA factors - if so, don't auto-redirect
          const { data: factorData } = await supabase.auth.mfa.listFactors();
          const hasVerifiedFactors = factorData?.all?.some(
            (factor) => factor.status === "verified"
          );

          if (!hasVerifiedFactors) {
            // No MFA factors, safe to redirect
            const redirectPath = getRedirectPath();
            SecureLogger.logAuthEvent("User signed in", { redirectPath });
            navigate(redirectPath, { replace: true });
          }
          // If user has MFA factors, let the sign-in flow handle the MFA verification
        } catch (error) {
          SecureLogger.error("Error during redirect after sign in:", error);
          toast({
            variant: "destructive",
            title: "Navigation Error",
            description:
              "There was a problem redirecting you. Please try refreshing the page.",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, getRedirectPath, toast, currentView, mfaStep]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Rate limiting check
    if (!InputValidator.checkRateLimit("signup", 3, 300000)) {
      // 3 attempts per 5 minutes
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: "Please wait before trying again.",
      });
      setIsLoading(false);
      return;
    }

    // Input validation
    const validation = InputValidator.validateForm(
      authData,
      InputValidator.schemas.auth
    );
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: validation.errors.join(", "),
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordStrength = validatePassword(authData.password);
    if (!passwordStrength.isValid) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description:
          "Please choose a stronger password that meets all requirements.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: validation.sanitizedData.email,
        password: authData.password, // Don't sanitize password
        options: {
          data: {
            first_name: validation.sanitizedData.first_name,
            last_name: validation.sanitizedData.last_name,
          },
          emailRedirectTo: `${window.location.origin}/auth?mode=confirmed`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Check Your Email",
          description:
            "We've sent you a confirmation link. Please check your email and click the link to verify your account before signing in.",
        });
        setActiveTab("signin"); // Switch to sign-in tab
        // Clear the form
        setAuthData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
      } else if (data.session) {
        // Immediate sign-in (email confirmation disabled)
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully.",
        });
        const redirectPath = getRedirectPath();
        navigate(redirectPath, { replace: true });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      SecureLogger.error("Sign up error:", errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Rate limiting check
    if (!InputValidator.checkRateLimit("signin", 5, 300000)) {
      // 5 attempts per 5 minutes
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: "Please wait before trying again.",
      });
      setIsLoading(false);
      return;
    }

    // Basic input validation
    if (!InputValidator.isValidEmail(authData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password,
      });

      if (error) {
        // Check for email not confirmed error
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email Not Verified",
            description:
              "Please check your email and click the verification link before signing in.",
          });
          setIsLoading(false); // Reset loading state
          return;
        }
        throw error;
      }

      // Valid credentials - now check MFA status
      if (data.user) {
        // Store the authenticated user
        setAuthenticatedUser({
          id: data.user.id,
          email: data.user.email || authData.email,
        });

        // First, check if user has actual MFA factors set up in Supabase
        const { data: factorData, error: factorError } =
          await supabase.auth.mfa.listFactors();

        if (!factorError && factorData?.all) {
          const verifiedFactors = factorData.all.filter(
            (factor) => factor.status === "verified"
          );

          if (verifiedFactors.length > 0) {
            // User has active MFA in Supabase - redirect to separate MFA verification screen
            setCurrentView("mfa");
            toast({
              title: "Authentication Required",
              description: "Please verify your identity to continue.",
            });
            setIsLoading(false); // Reset loading state
            return;
          }
        }

        // No active MFA factors - check user preferences for first-time setup
        const mfaPrompted =
          localStorage.getItem("mfa_setup_prompted") === "true";
        const mfaEnabled = localStorage.getItem("mfa_enabled") === "true";

        if (!mfaPrompted) {
          // First time user - show optional MFA setup
          setMfaStep("mfa_optional");
          toast({
            title: "Welcome!",
            description:
              "Would you like to set up additional security for your account?",
          });
          setIsLoading(false); // Reset loading state
          return;
        } else if (mfaEnabled) {
          // User has enabled MFA preference but no factors - show MFA setup
          setMfaStep("mfa_setup");
          toast({
            title: "MFA Setup Required",
            description: "Please complete your MFA setup to continue.",
          });
          setIsLoading(false); // Reset loading state
          return;
        } else {
          // User has disabled MFA - direct login to dashboard
          const redirectPath = getRedirectPath();
          navigate(redirectPath, { replace: true });
          setIsLoading(false); // Reset loading state
          return;
        }
      }

      // This should never be reached
      toast({
        title: "Authentication Error",
        description: "Please try again.",
        variant: "destructive",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      SecureLogger.error("Sign in error:", errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA optional setup completion
  const handleMFAOptionalComplete = (enabled: boolean) => {
    if (enabled) {
      // User chose to enable MFA - redirect to setup
      setMfaStep("mfa_setup");
      toast({
        title: "MFA Setup",
        description: "Please set up your multi-factor authentication.",
      });
    } else {
      // User chose to skip MFA - direct login to dashboard
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  };

  // Handle MFA setup completion
  const handleMFASetupComplete = () => {
    setMfaStep("mfa_verify");
    toast({
      title: "MFA Setup Complete",
      description:
        "Now please enter your authentication code to complete login.",
    });
  };

  // Handle MFA verification completion
  const handleMFAVerificationComplete = () => {
    // MFA verification successful, navigate to dashboard
    const redirectPath = getRedirectPath();
    navigate(redirectPath, { replace: true });
  };

  // Handle back to login
  const handleBackToLogin = async () => {
    setMfaStep("login");
    setAuthenticatedUser(null);
    setIsLoading(false); // Reset loading state
    // Sign out the user since they're going back to login
    await supabase.auth.signOut();
    setAuthData({ ...authData, password: "" }); // Clear password
  };

  // Handle different views
  if (currentView === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm onBackToSignIn={() => setCurrentView("auth")} />
      </div>
    );
  }

  if (currentView === "mfa") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <MFASimpleVerification
          onSuccess={() => {
            // MFA verification successful, navigation will happen via auth state change
            const redirectPath = getRedirectPath();
            navigate(redirectPath, { replace: true });
          }}
          onBack={() => {
            setCurrentView("auth");
            setIsLoading(false); // Ensure loading state is reset when going back
            setAuthenticatedUser(null); // Clear authenticated user
            setMfaStep("login"); // Reset MFA step
          }}
        />
      </div>
    );
  }

  if (currentView === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome to Saahitt Guest Manager
          </CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            {mfaStep === "login" && (
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={authData.email}
                      onChange={(e) =>
                        setAuthData({ ...authData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <PasswordInput
                      id="password"
                      placeholder="Password"
                      value={authData.password}
                      onChange={(e) =>
                        setAuthData({ ...authData, password: e.target.value })
                      }
                      required
                    />
                    <PasswordStrengthIndicator password={authData.password} />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setCurrentView("forgot")}
                  >
                    Forgot your password?
                  </Button>
                </CardFooter>
              </form>
            )}

            {mfaStep === "mfa_optional" && authenticatedUser && (
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Signed in as: <strong>{authenticatedUser.email}</strong>
                  </p>
                </div>
                <MFAOptionalSetup
                  onComplete={handleMFAOptionalComplete}
                  onSkip={() => handleMFAOptionalComplete(false)}
                />
              </CardContent>
            )}

            {mfaStep === "mfa_setup" && authenticatedUser && (
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Signed in as: <strong>{authenticatedUser.email}</strong>
                  </p>
                  <p className="text-sm">
                    Multi-factor authentication setup is required to complete
                    login.
                  </p>
                </div>
                <MFASetup
                  isOptional={false}
                  onComplete={handleMFASetupComplete}
                  onSkip={() => {}} // No skip allowed when required
                />
                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleBackToLogin}>
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            )}

            {mfaStep === "mfa_verify" && authenticatedUser && (
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Signed in as: <strong>{authenticatedUser.email}</strong>
                  </p>
                  <p className="text-sm">
                    Enter your authentication code to complete login.
                  </p>
                </div>
                <MFASimpleVerification
                  onSuccess={handleMFAVerificationComplete}
                  onBack={handleBackToLogin}
                />
              </CardContent>
            )}
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={authData.firstName}
                    onChange={(e) =>
                      setAuthData({ ...authData, firstName: e.target.value })
                    }
                    required
                  />
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={authData.lastName}
                    onChange={(e) =>
                      setAuthData({ ...authData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  required
                />
                <div className="space-y-2">
                  <PasswordInput
                    id="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) =>
                      setAuthData({ ...authData, password: e.target.value })
                    }
                    required
                  />
                  <PasswordStrengthIndicator password={authData.password} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
