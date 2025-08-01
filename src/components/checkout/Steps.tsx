
import { CheckCircle } from "lucide-react";

interface StepsProps {
  currentStep: number;
}

export const Steps = ({ currentStep }: StepsProps) => {
  const steps = [
    { id: 1, name: "Customer Information" },
    { id: 2, name: "Payment" },
  ];
  
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center w-full">
            {/* Step circle */}
            <div className={`flex items-center justify-center rounded-full h-8 w-8 flex-shrink-0 ${
              step.id < currentStep 
                ? "bg-green-100 text-green-600" 
                : step.id === currentStep 
                  ? "bg-[#FF6F00] text-white" 
                  : "bg-gray-200 text-gray-500"
            }`}>
              {step.id < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            
            {/* Step name */}
            <span className={`ml-2 text-sm font-medium ${
              step.id === currentStep 
                ? "text-gray-900" 
                : "text-gray-500"
            }`}>
              {step.name}
            </span>
            
            {/* Connecting line (except for the last step) */}
            {index < steps.length - 1 && (
              <div className="flex-grow mx-2 h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-[#FF6F00]" 
                  style={{ 
                    width: step.id < currentStep ? "100%" : "0%" 
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
