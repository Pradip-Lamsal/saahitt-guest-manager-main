
import { Button } from "@/components/ui/button";
import { CreditCard, Building, Smartphone } from "lucide-react";

interface PaymentProviderSelectorProps {
  selectedProvider: string;
  onSelect: (provider: string) => void;
}

export const PaymentProviderSelector = ({ 
  selectedProvider,
  onSelect
}: PaymentProviderSelectorProps) => {
  const providers = [
    {
      id: "credit-card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Pay securely with your card",
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      icon: <Building className="h-5 w-5" />,
      description: "Manual bank transfer",
    },
    {
      id: "mobile-payment",
      name: "Mobile Payment",
      icon: <Smartphone className="h-5 w-5" />,
      description: "eSewa, Khalti, or mobile banking",
    },
  ];
  
  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant={selectedProvider === provider.id ? "default" : "outline"}
          className={`w-full justify-start h-auto py-3 px-4 ${
            selectedProvider === provider.id 
              ? "bg-[#FF6F00] text-white hover:bg-[#FF6F00]/90" 
              : "hover:bg-gray-50"
          }`}
          onClick={() => onSelect(provider.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`${
              selectedProvider === provider.id 
                ? "text-white" 
                : "text-gray-500"
            }`}>
              {provider.icon}
            </div>
            <div className="text-left">
              <div className="font-medium">{provider.name}</div>
              <div className={`text-sm ${
                selectedProvider === provider.id 
                  ? "text-white/80" 
                  : "text-gray-500"
              }`}>
                {provider.description}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};
