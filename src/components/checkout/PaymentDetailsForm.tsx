import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

interface PaymentDetails {
  method: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  bankName?: string;
  accountNumber?: string;
  mobileProvider?: string;
  mobileNumber?: string;
}

interface PaymentDetailsFormProps {
  selectedMethod: string;
  onDetailsChange: (details: PaymentDetails) => void;
}

export const PaymentDetailsForm = ({
  selectedMethod,
  onDetailsChange,
}: PaymentDetailsFormProps) => {
  const [details, setDetails] = useState<PaymentDetails>({
    method: selectedMethod,
  });

  const updateDetails = (newDetails: Partial<PaymentDetails>) => {
    const updated = { ...details, ...newDetails };
    setDetails(updated);
    onDetailsChange(updated);
  };

  const formatCardNumber = (value: string) => {
    // Remove non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (selectedMethod === "credit-card") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit/Debit Card Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={details.cardholderName || ""}
              onChange={(e) =>
                updateDetails({ cardholderName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={details.cardNumber || ""}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                updateDetails({ cardNumber: formatted });
              }}
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={`${details.expiryMonth || ""}${
                  details.expiryYear ? "/" + details.expiryYear : ""
                }`}
                onChange={(e) => {
                  const formatted = formatExpiry(e.target.value);
                  const [month, year] = formatted.split("/");
                  updateDetails({ expiryMonth: month, expiryYear: year });
                }}
                maxLength={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={details.cvv || ""}
                onChange={(e) =>
                  updateDetails({ cvv: e.target.value.replace(/\D/g, "") })
                }
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration. No real
              payment will be processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedMethod === "bank-transfer") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Bank Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Select
              onValueChange={(value) => updateDetails({ bankName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nepal-bank">Nepal Bank Limited</SelectItem>
                <SelectItem value="rastriya-banijya">
                  Rastriya Banijya Bank
                </SelectItem>
                <SelectItem value="nabil">Nabil Bank</SelectItem>
                <SelectItem value="standard-chartered">
                  Standard Chartered Bank
                </SelectItem>
                <SelectItem value="himalayan">Himalayan Bank</SelectItem>
                <SelectItem value="nic-asia">NIC Asia Bank</SelectItem>
                <SelectItem value="global-ime">Global IME Bank</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Your bank account number"
              value={details.accountNumber || ""}
              onChange={(e) => updateDetails({ accountNumber: e.target.value })}
              required
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Bank Transfer:</strong> After submitting, you'll receive
              bank details for manual transfer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedMethod === "mobile-payment") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mobileProvider">Mobile Payment Provider</Label>
            <Select
              onValueChange={(value) =>
                updateDetails({ mobileProvider: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esewa">eSewa</SelectItem>
                <SelectItem value="khalti">Khalti</SelectItem>
                <SelectItem value="ime-pay">IME Pay</SelectItem>
                <SelectItem value="fonepay">FonePay</SelectItem>
                <SelectItem value="connect-ips">ConnectIPS</SelectItem>
                <SelectItem value="mobile-banking">Mobile Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="98XXXXXXXX"
              value={details.mobileNumber || ""}
              onChange={(e) =>
                updateDetails({
                  mobileNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              maxLength={10}
              required
            />
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Mobile Payment:</strong> You'll be redirected to your
              selected payment provider.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
