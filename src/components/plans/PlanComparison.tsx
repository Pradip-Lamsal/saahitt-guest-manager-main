import { Check, X, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { usePlanEnforcement } from "@/hooks/usePlanEnforcement";
import { useTransactions } from "@/hooks/useTransactions";

interface PlanComparisonProps {
  onSelectPlan: (planId: string) => void;
  showUpgradeButtons?: boolean;
}

export const PlanComparison = ({ onSelectPlan, showUpgradeButtons = true }: PlanComparisonProps) => {
  const { userPlan, currentUsage, planLimits } = usePlanEnforcement();
  const { isProcessingPayment } = useTransactions();

  const features = [
    { key: "guests", name: "Guest Limit", free: "100", pro: "500", ultimate: "2,000" },
    { key: "sorting", name: "Basic Sorting & Ranking", free: true, pro: true, ultimate: true },
    { key: "export", name: "PDF Export & Print", free: true, pro: true, ultimate: true },
    { key: "bulk_import", name: "Bulk Import (CSV/Excel)", free: false, pro: true, ultimate: true },
    { key: "custom_categories", name: "Custom Categories & Tags", free: false, pro: true, ultimate: true },
    { key: "advanced_filters", name: "Advanced Filters", free: false, pro: true, ultimate: true },
    { key: "ai_ranking", name: "AI Smart Ranking", free: false, pro: false, ultimate: true },
    { key: "event_roles", name: "Event Role Assignment", free: false, pro: false, ultimate: true },
    { key: "custom_templates", name: "Custom Export Templates", free: false, pro: false, ultimate: true },
    { key: "analytics", name: "Analytics Dashboard", free: false, pro: false, ultimate: true },
  ];

  const renderFeatureValue = (feature: any, planId: string) => {
    const value = feature[planId];
    
    if (feature.key === "guests") {
      return <span className="text-sm font-medium">{value}</span>;
    }
    
    return value ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-gray-300" />
    );
  };

  const getPlanStatus = (planId: string) => {
    if (planId === userPlan) {
      return { text: "Current Plan", variant: "secondary" as const, disabled: true };
    }
    
    const planOrder = { free: 0, pro: 1, ultimate: 2 };
    const currentOrder = planOrder[userPlan as keyof typeof planOrder] || 0;
    const targetOrder = planOrder[planId as keyof typeof planOrder] || 0;
    
    if (targetOrder < currentOrder) {
      return { text: "Downgrade", variant: "outline" as const, disabled: false };
    }
    
    return { text: "Upgrade", variant: "default" as const, disabled: false };
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your event planning needs
        </p>
        {userPlan !== 'free' && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              Current: {PLANS.find(p => p.id === userPlan)?.name} Plan
            </Badge>
            <Badge variant="secondary">
              {currentUsage.guests}/{planLimits.guestLimit} guests used
            </Badge>
          </div>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const status = getPlanStatus(plan.id);
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all ${
                plan.highlighted 
                  ? 'border-primary shadow-lg scale-105' 
                  : plan.id === userPlan 
                    ? 'border-green-500 bg-green-50' 
                    : 'hover:shadow-md'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    Nrs. {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.price === "0" ? " forever" : " one-time"}
                    </span>
                  </div>
                  {plan.id === userPlan && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {showUpgradeButtons && (
                  <Button
                    className="w-full"
                    variant={status.variant}
                    disabled={status.disabled || isProcessingPayment}
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {isProcessingPayment ? "Processing..." : status.text}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-border rounded-lg">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold">Free</th>
                <th className="text-center p-4 font-semibold">Pro</th>
                <th className="text-center p-4 font-semibold">Ultimate</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.key} className={index % 2 === 0 ? "bg-muted/25" : ""}>
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="p-4 text-center">{renderFeatureValue(feature, "free")}</td>
                  <td className="p-4 text-center">{renderFeatureValue(feature, "pro")}</td>
                  <td className="p-4 text-center">{renderFeatureValue(feature, "ultimate")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};