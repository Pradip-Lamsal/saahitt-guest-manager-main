import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePlanConfigurations } from "@/hooks/usePlanConfigurations";
import { useTransactions } from "@/hooks/useTransactions";
import { ArrowRight, CheckCircle, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transactions, transactionsLoading } = useTransactions();
  const { getPlanById } = usePlanConfigurations();
  const [transaction, setTransaction] = useState(null);

  const transactionId = searchParams.get("transaction_id");
  const planId = searchParams.get("plan_id");

  useEffect(() => {
    if (transactions.length > 0 && transactionId) {
      const foundTransaction = transactions.find((t) => t.id === transactionId);
      setTransaction(foundTransaction);
    }
  }, [transactions, transactionId]);

  // Remove automatic refresh - let user manually refresh if needed
  const handleRefreshData = () => {
    window.location.reload();
  };

  const plan = planId ? getPlanById(planId) : null;

  const handleDownloadReceipt = () => {
    if (transaction) {
      const receiptData = {
        transactionId: transaction.id,
        planName: plan?.name || "Unknown Plan",
        amount: transaction.amount,
        currency: transaction.currency,
        date: new Date(transaction.created_at).toLocaleDateString(),
        status: transaction.status,
      };

      const dataStr = JSON.stringify(receiptData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `receipt-${transaction.id}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {transaction && plan ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium text-foreground">
                    {plan.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">
                    {transaction.currency} {transaction.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default">{transaction.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Transaction ID
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {transaction.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading transaction details...
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleRefreshData}
              variant="outline"
              className="w-full"
            >
              Refresh Plan Status
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your plan has been activated. Click refresh if your dashboard
              doesn't show the updated plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
