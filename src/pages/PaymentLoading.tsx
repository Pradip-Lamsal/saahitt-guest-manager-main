import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePlanConfigurations } from "@/hooks/usePlanConfigurations";
import { useTransactions } from "@/hooks/useTransactions";
import { CheckCircle, CreditCard, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentLoading() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { getPlanById } = usePlanConfigurations();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [transaction, setTransaction] = useState(null);

  const transactionId = searchParams.get("transaction_id");
  const planId = searchParams.get("plan_id");
  const plan = planId ? getPlanById(planId) : null;

  useEffect(() => {
    if (transactions.length > 0 && transactionId) {
      const foundTransaction = transactions.find((t) => t.id === transactionId);
      setTransaction(foundTransaction);

      if (foundTransaction) {
        if (foundTransaction.status === "completed") {
          setStatus("success");
          // Use a shorter delay for better UX
          setTimeout(() => {
            navigate(
              `/payment-success?transaction_id=${transactionId}&plan_id=${planId}`
            );
          }, 1500);
        } else if (foundTransaction.status === "failed") {
          setStatus("failed");
        }
      }
    }
  }, [transactions, transactionId, navigate, planId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const getStatusContent = () => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 className="w-8 h-8 text-primary animate-spin" />,
          title: "Processing Payment",
          description:
            "Please wait while we process your payment. This may take a few moments.",
          color: "bg-blue-100",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: "Payment Successful",
          description:
            "Your payment has been processed successfully. Redirecting...",
          color: "bg-green-100",
        };
      case "failed":
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          title: "Payment Failed",
          description:
            "There was an issue processing your payment. Please try again.",
          color: "bg-red-100",
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div
            className={`mx-auto mb-4 w-16 h-16 ${statusContent.color} rounded-full flex items-center justify-center`}
          >
            {statusContent.icon}
          </div>
          <CardTitle className="text-2xl text-foreground">
            {statusContent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {plan && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upgrading to
                </span>
              </div>
              <div className="font-medium text-foreground">{plan.name}</div>
              <div className="text-sm text-muted-foreground">
                NPR {plan.price} - {plan.guest_limit} guests
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 50
                  ? "Validating payment..."
                  : progress < 80
                  ? "Updating your account..."
                  : "Almost done..."}
              </p>
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground">
            {statusContent.description}
          </p>

          {status === "failed" && (
            <div className="space-y-2">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate("/pricing")} className="w-full">
                Try Again
              </Button>
            </div>
          )}

          {transaction && (
            <div className="p-2 bg-muted/50 rounded text-xs text-center text-muted-foreground">
              Transaction ID: {transaction.id.slice(0, 8)}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
