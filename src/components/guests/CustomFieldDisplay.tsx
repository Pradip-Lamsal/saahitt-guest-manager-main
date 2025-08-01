
import React from "react";
import { CustomField } from "@/types/custom-field";
import { useCustomFields } from "@/hooks/useCustomFields";

interface CustomFieldDisplayProps {
  fieldName: string;
  value: any;
  variant?: "inline" | "badge" | "detail";
  className?: string;
}

const CustomFieldDisplay: React.FC<CustomFieldDisplayProps> = ({
  fieldName,
  value,
  variant = "inline",
  className = "",
}) => {
  const { customFields, formatCustomFieldValue } = useCustomFields();
  
  // Find the field definition
  const fieldDefinition = customFields.find(f => f.name === fieldName);
  
  if (!fieldDefinition) {
    return <span className={className}>{String(value || "-")}</span>;
  }
  
  // Format the value based on field type
  const formattedValue = formatCustomFieldValue(fieldDefinition, value);
  
  // Different display variants
  if (variant === "badge") {
    return (
      <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 ${className}`}>
        {fieldName}: {formattedValue}
      </span>
    );
  } else if (variant === "detail") {
    return (
      <div className={`space-y-1 ${className}`}>
        <p className="text-sm font-medium text-gray-500">{fieldName}</p>
        <p className="text-base">{formattedValue}</p>
      </div>
    );
  } else {
    // Default inline variant
    return <span className={className}>{formattedValue}</span>;
  }
};

export default CustomFieldDisplay;
