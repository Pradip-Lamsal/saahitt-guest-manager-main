import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CircleCheck, ChevronRight, Shield, CreditCard } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { PlanConfiguration } from "@/hooks/usePlanConfigurations";

interface PlanUpgradeProps {
  currentPlanId: string;
  onPlanSelected?: (planId: string) => void;
}

export const PlanUpgrade = ({ currentPlanId, onPlanSelected }: PlanUpgradeProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [planConfigurations, setPlanConfigurations] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("plan_configurations")
          .select("*")
          .order('id', { ascending: true });
          
        if (error) {
          console.error("Error fetching plan configurations:", error);
          throw error;
        }
        
        const processedPlans = (data || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features 
            : typeof plan.features === 'string' 
              ? JSON.parse(plan.features)
              : plan.features ? (Object.values(plan.features) as string[]) : []
        })) as PlanConfiguration[];
        
        setPlanConfigurations(processedPlans);
      } catch (error) {
        console.error("Error loading plans:", error);
        toast({
          title: "Error",
          description: "Could not load plan information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [toast]);
  
  const currentPlan = planConfigurations.find(p => p.plan_id === currentPlanId) || {
    name: "Free Plan",
    plan_id: "free",
    price: 0,
    features: ["Basic sorting", "Export & print guest list", "Minimalist UI"],
    guest_limit: 100
  };
  
  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlanId) {
      toast({
        title: "Already on this plan",
        description: `You are already subscribed to the ${planConfigurations.find(p => p.plan_id === planId)?.name || "current"} plan.`,
        variant: "default",
      });
      return;
    }
    
    setSelectedPlan(planId);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;
    
    setConfirmDialogOpen(false);
    
    if (onPlanSelected) {
      onPlanSelected(selectedPlan);
    } else {
      navigate(`/checkout?plan=${selectedPlan}`);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-100 rounded-md w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-64 bg-gray-100 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Available Plans</h3>
            <p className="text-sm text-gray-500">
              Choose the plan that suits your needs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              Current Plan: {currentPlan.name}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {planConfigurations.map((plan) => (
            <Card 
              key={plan.plan_id} 
              className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                plan.plan_id === currentPlanId ? "border-2 border-[#FF6F00]" : ""
              } ${plan.plan_id === 'ultimate' ? 'bg-purple-50' : plan.plan_id === 'pro' ? 'bg-orange-50' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.plan_id === currentPlanId && (
                    <Badge className="bg-[#FF6F00]">Current</Badge>
                  )}
                </div>
                <CardDescription>
                  {plan.plan_id === "free" ? "Free Forever" : `One-time payment`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Nrs. {plan.price}</span>
                  {plan.plan_id !== "free" && (
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Up to {plan.guest_limit === 99999 ? "Unlimited" : plan.guest_limit} guests
                      </Badge>
                    </div>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.plan_id === currentPlanId ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${plan.plan_id === "ultimate" ? "bg-purple-600 hover:bg-purple-700" : "bg-[#FF6F00] hover:bg-[#FF6F00]/90"}`}
                    onClick={() => handlePlanSelect(plan.plan_id)}
                  >
                    {plan.plan_id === "free" ? "Downgrade" : "Upgrade"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlan && selectedPlan !== "free" ? (
                <>
                  You are about to upgrade to the <strong>{planConfigurations.find(p => p.plan_id === selectedPlan)?.name}</strong> plan
                  for a one-time payment of <strong>Nrs. {planConfigurations.find(p => p.plan_id === selectedPlan)?.price}</strong>.
                </>
              ) : (
                <>
                  You are about to downgrade to the <strong>Free</strong> plan.
                  You will lose access to all premium features immediately.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmUpgrade}
              className={selectedPlan === "free" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {selectedPlan === "free" ? "Confirm Downgrade" : "Continue to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
