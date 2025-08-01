import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/useTransactions";
import { getPlanById } from "@/lib/plans";
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const TransactionHistory = () => {
  const { transactions, transactionsLoading, currentSubscription } = useTransactions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'failed':
      case 'cancelled':
        return 'destructive' as const;
      case 'pending':
      case 'processing':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const plan = getPlanById(transaction.plan_id);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <div className="font-medium">
                        {plan.name} Plan Upgrade
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                      </div>
                      {transaction.payment_method && (
                        <div className="text-xs text-muted-foreground">
                          via {transaction.payment_method}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-semibold">
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {currentSubscription && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Active Subscription</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {getPlanById(currentSubscription.plan_id).name} Plan
                  {currentSubscription.expires_at && (
                    <span> • Expires {format(new Date(currentSubscription.expires_at), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};