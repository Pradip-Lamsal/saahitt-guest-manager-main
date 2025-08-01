
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Award, CreditCard, ChevronRight, ShieldCheck, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlanConfiguration } from "@/hooks/usePlanConfigurations";

export const PlanManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [planConfigurations, setPlanConfigurations] = useState<PlanConfiguration[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Fetch plan configurations
        const { data: planData, error: planError } = await supabase
          .from("plan_configurations")
          .select("*")
          .order('id', { ascending: true });
          
        if (planError) {
          console.error("Error fetching plan configurations:", planError);
          throw planError;
        }
        
        // Process the features to ensure they are arrays
        const processedPlans = (planData || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features 
            : typeof plan.features === 'string' 
              ? JSON.parse(plan.features)
              : plan.features ? (Object.values(plan.features) as string[]) : []
        })) as PlanConfiguration[];
        
        setPlanConfigurations(processedPlans);
        
        // Fetch user profile
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          // Create a default profile object if one doesn't exist
          setProfile({
            id: session.user.id,
            plan_type: "free",
            first_name: session.user.user_metadata.first_name,
            last_name: session.user.user_metadata.last_name,
            email: session.user.email
          });
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Could not load your plan information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const handleUpgrade = () => {
    // Navigate to the dedicated plans page within the dashboard
    navigate("/dashboard#plans");
  };
  
  const handleCancelPlan = async () => {
    setCancelLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No active session");
      
      // Downgrade to free plan
      const { error } = await supabase
        .from("profiles")
        .update({ plan_type: "free" })
        .eq("id", session.user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile({
        ...profile,
        plan_type: "free",
      });
      
      toast({
        title: "Plan Cancelled",
        description: "You have been downgraded to the Free plan",
      });
    } catch (error) {
      console.error("Error cancelling plan:", error);
      toast({
        title: "Error",
        description: "Could not cancel your plan",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Management</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-100 rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  const planType = profile?.plan_type || "free";
  const plan = planConfigurations.find(p => p.plan_id === planType) || {
    name: "Free Plan",
    price: 0,
    features: ["Basic sorting", "Export & print guest list", "Minimalist UI"],
    guest_limit: 100
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Management</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">Current Plan:</h3>
                <Badge className={`${
                  planType === "ultimate" 
                    ? "bg-purple-600" 
                    : planType === "pro" 
                      ? "bg-[#FF6F00]" 
                      : "bg-green-600"
                }`}>
                  {plan.name}
                </Badge>
              </div>
              <p className="text-gray-600">
                {planType === "free"
                  ? `Basic plan with up to ${plan.guest_limit} guests`
                  : `One-time payment of Nrs. ${plan.price}`}
              </p>
            </div>
            
            {planType !== "ultimate" && (
              <Button 
                className="bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                onClick={handleUpgrade}
              >
                Upgrade Plan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          
          <div className="grid gap-4">
            <h3 className="font-semibold">Plan Features:</h3>
            <ul className="space-y-2">
              {plan.features && Array.isArray(plan.features) && plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {planType !== "free" && (
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Cancel Plan</h3>
                  <p className="text-gray-600 text-sm">
                    Downgrade to the Free plan with limited features
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Cancel Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will immediately downgrade your account to the Free plan.
                        You will lose access to all premium features and be limited to {planConfigurations.find(p => p.plan_id === 'free')?.guest_limit || 100} guests.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep My Plan</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleCancelPlan}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? "Cancelling..." : "Yes, Cancel My Plan"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t flex flex-col items-start">
        <div className="flex gap-2 items-center text-gray-600 text-sm">
          <ShieldCheck className="h-4 w-4 text-gray-500" />
          <span>For billing questions, contact support@saahitt.com</span>
        </div>
      </CardFooter>
    </Card>
  );
};
