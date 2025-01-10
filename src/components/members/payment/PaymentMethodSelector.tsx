import { Button } from "@/components/ui/button";
import { Banknote, CreditCard } from "lucide-react";

interface PaymentMethodSelectorProps {
  paymentMethod: 'cash' | 'bank_transfer';
  onPaymentMethodChange: (method: 'cash' | 'bank_transfer') => void;
}

export const PaymentMethodSelector = ({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) => {
  return (
    <div className="flex gap-4">
      <Button
        variant="ghost"
        onClick={() => onPaymentMethodChange('cash')}
        className={`flex-1 h-12 ${
          paymentMethod === 'cash'
            ? 'bg-dashboard-accent1 hover:bg-dashboard-accent1/90 text-white'
            : 'bg-dashboard-card hover:bg-dashboard-cardHover text-dashboard-text'
        }`}
      >
        <Banknote className="w-5 h-5 mr-2" />
        Cash
      </Button>

      <Button
        variant="ghost"
        onClick={() => onPaymentMethodChange('bank_transfer')}
        className={`flex-1 h-12 ${
          paymentMethod === 'bank_transfer'
            ? 'bg-dashboard-accent1 hover:bg-dashboard-accent1/90 text-white'
            : 'bg-dashboard-card hover:bg-dashboard-cardHover text-dashboard-text'
        }`}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Bank Transfer
      </Button>
    </div>
  );
};