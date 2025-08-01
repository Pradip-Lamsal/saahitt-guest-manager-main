
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PLANS } from "@/lib/plans"; 

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C2C2C]">Fair & Simple Pricing</h2>
        <p className="text-xl text-[#2C2C2C] text-center mb-12">One-time payment. No subscriptions.</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`${plan.color} rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 animate-fade-in ${
                plan.highlighted ? "ring-2 ring-[#FF6F00]" : ""
              }`}
            >
              <h3 className="text-2xl font-bold mb-2 text-[#2C2C2C]">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#FF6F00]">Nrs. {plan.price}</span>
                {plan.price === "0" ? (
                  <span className="text-[#2C2C2C]"> forever</span>
                ) : (
                  <span className="text-[#2C2C2C]"> one-time</span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#00796B]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to={`/pricing?selected=${plan.id}`}>
                <Button className="w-full bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
