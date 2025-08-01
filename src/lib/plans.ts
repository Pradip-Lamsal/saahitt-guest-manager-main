
// Central place to define plans and their features
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    features: [
      "Up to 100 guests",
      "Basic sorting & ranking",
      "PDF exports",
      "Print-ready lists",
    ],
    color: "bg-white",
    highlighted: false
  },
  {
    id: "pro",
    name: "Pro",
    price: "1,500",
    features: [
      "Up to 500 guests",
      "Bulk import from CSV/Excel",
      "Custom categories & tagging",
      "Advanced filters",
      "Priority groups",
    ],
    color: "bg-[#FAF3E0]",
    highlighted: true
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: "5,000",
    features: [
      "Up to 2,000 guests",
      "Smart ranking suggestions",
      "Event roles assignment",
      "Customizable export templates",
      "Analytics dashboard",
    ],
    color: "bg-[#FAF3E0]",
    highlighted: false
  },
];

// Helper function to get plan details by ID
export const getPlanById = (planId: string) => {
  return PLANS.find(plan => plan.id === planId) || PLANS[0]; // Default to free plan
};

// Calculate numeric price for calculations
export const getPlanNumericPrice = (planId: string): number => {
  const plan = getPlanById(planId);
  if (plan.price === "0") return 0;
  return parseInt(plan.price.replace(/,/g, ""));
};
