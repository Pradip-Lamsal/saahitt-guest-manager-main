
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#D9D9D9]">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <img 
              src="https://saahitt.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmain-logo.0a76fcc4.png&w=640&q=75" 
              alt="Saahitt Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-[#2C2C2C] hover:text-[#FF6F00]"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-[#2C2C2C] hover:text-[#FF6F00]"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-[#2C2C2C] hover:text-[#FF6F00]"
            >
              Pricing
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/auth?tab=signin">
            <Button variant="ghost" className="text-[#2C2C2C] hover:text-[#FF6F00]">Log in</Button>
          </Link>
          <Link to="/auth?tab=signup">
            <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
