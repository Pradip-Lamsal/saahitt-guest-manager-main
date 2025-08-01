
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PLANS } from "@/lib/plans";

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // Get user's current plan
        const { data, error } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", session.user.id)
          .single();
          
        if (!error && data) {
          setUserPlan(data.plan_type);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const handlePlanSelect = (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      navigate("/auth?tab=signin&redirect=/pricing");
      return;
    }
    
    // If user is already on this plan, don't proceed
    if (planId === userPlan) {
      toast({
        title: "Current Plan",
        description: "You are already on this plan",
      });
      return;
    }
    
    // Proceed to upgrade flow
    navigate(`/checkout?plan=${planId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-4">Plans & Pricing</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Choose the perfect plan for your event planning needs
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`${plan.highlighted ? 'border-[#FF6F00] shadow-lg' : 'border-gray-200'} transition-all hover:shadow-md`}
              >
                {plan.highlighted && (
                  <div className="bg-[#FF6F00] text-white text-center py-1 font-medium text-sm">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">Nrs. {plan.price}</span>
                    {plan.price === "0" ? (
                      <span className="text-gray-500"> forever</span>
                    ) : (
                      <span className="text-gray-500"> one-time</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="h-5 w-5 text-[#00796B] flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.id === userPlan 
                        ? 'bg-gray-200 hover:bg-gray-200 text-gray-800' 
                        : 'bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={plan.id === userPlan || loading}
                  >
                    {plan.id === userPlan ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is there a refund policy?</h3>
                <p className="text-gray-600">We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept credit/debit cards, bank transfers, and mobile payments.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage;
