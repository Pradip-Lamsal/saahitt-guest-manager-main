
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanUpgrade } from "@/components/settings/PlanUpgrade";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { PlanComparison } from "@/components/plans/PlanComparison";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlanConfigurations } from "@/hooks/usePlanConfigurations";
import { useTransactions } from "@/hooks/useTransactions";
import { usePlanEnforcement } from "@/hooks/usePlanEnforcement";

interface PlanManagementViewProps {
  profile: any;
  onRefreshProfile: () => void;
}

const PlanManagementView = ({ profile, onRefreshProfile }: PlanManagementViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'history'>('overview');
  
  const currentPlanId = profile?.plan_type || "free";
  const { getPlanById, isLoading: plansLoading } = usePlanConfigurations();
  const { processPayment, isProcessingPayment, currentSubscription } = useTransactions();
  const { planLimits, currentUsage } = usePlanEnforcement();
  
  const handlePlanSelected = (planId: string) => {
    if (planId === currentPlanId) {
      toast({
        title: "Current Plan",
        description: "You are already on this plan.",
      });
      return;
    }

    if (planId === "free") {
      // Handle downgrade to free plan through secure system
      handleSecurePayment("free");
    } else {
      // Open payment dialog for premium plans
      setSelectedPlanId(planId);
      setPaymentDialogOpen(true);
    }
  };
  
  const handleSecurePayment = (planId: string) => {
    processPayment({
      planId: planId,
      paymentMethod: planId === "free" ? "free" : "credit-card",
      metadata: {
        upgrade: planId !== "free",
        downgrade: planId === "free",
        previousPlan: currentPlanId,
        initiatedFrom: 'dashboard'
      }
    });

    // Refresh profile after payment processing
    setTimeout(() => {
      onRefreshProfile();
    }, 2000);
  };
  
  const handleGoToCheckout = () => {
    if (!selectedPlanId) return;
    
    setPaymentDialogOpen(false);
    handleSecurePayment(selectedPlanId);
  };
  
  const currentPlan = getPlanById(currentPlanId);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'plans', label: 'Compare Plans' },
    { id: 'history', label: 'Transaction History' }
  ];
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Plan Management</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">
                    Nrs. {currentPlan.price} {currentPlan.price === 0 ? "forever" : "one-time"}
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentUsage.guests}</div>
                  <div className="text-sm text-muted-foreground">Guests Added</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{planLimits.guestLimit}</div>
                  <div className="text-sm text-muted-foreground">Guest Limit</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((currentUsage.guests / planLimits.guestLimit) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Usage</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Plan Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {currentPlan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Upgrade */}
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>Get more features and higher limits</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanUpgrade 
                currentPlanId={currentPlanId} 
                onPlanSelected={handlePlanSelected} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'plans' && (
        <PlanComparison onSelectPlan={handlePlanSelected} />
      )}

      {activeTab === 'history' && (
        <TransactionHistory />
      )}
      
      {/* Secure Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              You're about to upgrade to the <strong>{selectedPlanId && getPlanById(selectedPlanId).name}</strong> plan.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlanId && getPlanById(selectedPlanId).name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amount:</span>
                  <span className="font-medium">Nrs. {selectedPlanId && getPlanById(selectedPlanId).price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment:</span>
                  <span className="font-medium">One-time</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-100 p-4 rounded-md mb-6 mt-4">
              <div className="flex gap-2">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">
                  Your payment will be processed securely through our encrypted payment system.
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGoToCheckout}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Complete Secure Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanManagementView;
