
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section className="py-20 bg-[#FF6F00] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Start Planning Your Event Today!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of event planners who are making their guest management effortless
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-white text-[#FF6F00] hover:bg-white/90">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-[#00796B] text-white hover:bg-[#00796B]/90">
                Get Pro – Nrs. 1,500
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Rocket className="absolute bottom-4 right-4 w-24 h-24 text-white/10 rotate-45" />
    </section>
  );
};
