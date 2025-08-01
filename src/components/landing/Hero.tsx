
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";

export const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-32 pb-0 text-center bg-[#FAF3E0]" id="hero">
      <div className="container mx-auto px-4">
        {/* Eyebrow text */}
        <p className="font-medium uppercase tracking-[0.25em] leading-[133%] text-center text-base md:text-lg mb-6 text-[#00796B] animate-fade-in">
          AI-POWERED EVENT MANAGEMENT
        </p>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in delay-100 text-[#2C2C2C] max-w-5xl mx-auto">
          <span className="font-bold">Effortless Event Invitations, </span>
          <span className="text-[#FF6F00] font-bold italic">Smarter </span>
          <span className="font-bold">Guest Management!</span>
        </h1>
        
        <p className="text-xl text-[#2C2C2C] mb-8 max-w-3xl mx-auto animate-fade-in delay-200">
          Say goodbye to messy spreadsheets and manual tracking. Organize your event guest list, 
          rank invites, and export with ease—all in a few clicks.
        </p>
        
        <div className="flex justify-center space-x-4 animate-fade-in delay-300">
          <Button 
            size="lg" 
            className="text-lg px-8 bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white h-[49px] rounded-[10px]"
            onClick={() => window.location.href = '/auth?tab=signup'}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-lg whitespace-nowrap">Start Free</span>
              <ArrowRight className="ml-3 h-5 w-5" />
            </div>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 border-[#00796B] text-[#00796B] hover:bg-[#00796B] hover:text-white h-[49px] rounded-[10px]"
            onClick={() => scrollToSection('how-it-works')}
          >
            Watch Demo
          </Button>
        </div>

        {/* Mockup Frame */}
        <div className="mt-20 w-full relative animate-fade-in delay-500">
          <MockupFrame>
            <Mockup type="responsive">
              <div className="bg-white p-4 rounded-b-lg">
                <img 
                  src="/lovable-uploads/003a721c-6b55-4a4a-abe7-8f45b5e7e085.png" 
                  alt="Guest Management Dashboard" 
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </Mockup>
          </MockupFrame>
          <div
            className="absolute bottom-0 left-0 right-0 w-full h-[200px]"
            style={{
              background: "linear-gradient(to top, #FAF3E0 0%, rgba(250, 243, 224, 0) 100%)",
              zIndex: 10,
            }}
          />
        </div>

        {/* Problem-Solution Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6 animate-fade-in bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-[#2C2C2C]">Without This Tool</h2>
            <div className="space-y-4">
              {[
                "Manually adding guests to Excel",
                "No idea who will attend",
                "Difficult to prioritize VIPs",
                "No easy way to send invites"
              ].map((problem) => (
                <div key={problem} className="flex items-center space-x-3 text-[#2C2C2C]">
                  <div className="h-6 w-6 rounded-full border-2 border-[#FF6F00] flex items-center justify-center">
                    <X className="h-4 w-4 text-[#FF6F00]" />
                  </div>
                  <span>{problem}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 animate-fade-in bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-[#2C2C2C]">With This Tool</h2>
            <div className="space-y-4">
              {[
                "Add guests instantly, auto-organized",
                "Smart RSVP tracking",
                "AI-powered ranking",
                "Email & WhatsApp integration (coming soon)"
              ].map((solution) => (
                <div key={solution} className="flex items-center space-x-3 text-[#2C2C2C]">
                  <div className="h-6 w-6 rounded-full bg-[#00796B] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mt-32 space-y-32">
          {/* Step 1: Add Guests */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">1. Add Your Guests</h3>
              <p className="text-[#2C2C2C] mb-6">
                Easily input guest details with our intuitive form. Add names, relationships,
                and priority levels with just a few clicks.
              </p>
              <ul className="space-y-3">
                {["Import manually or via CSV", "Categorize guests instantly", "Track RSVPs effortlessly"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-white w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden">
                <img src="/placeholder.svg" alt="Guest Input Interface" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>

          {/* Step 2: Rank & Sort */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pl-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">2. Categorize & Rank</h3>
              <p className="text-[#2C2C2C] mb-6">
                Our smart system automatically organizes your guest list based on priority
                and availability. No more manual sorting needed.
              </p>
              <ul className="space-y-3">
                {["Priority-based sorting", "VIP guest tracking", "Automatic categorization"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-white w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden">
                <img src="/placeholder.svg" alt="Ranking System" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>

          {/* Step 3: Export & Print */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">3. Export & Print</h3>
              <p className="text-[#2C2C2C] mb-6">
                Generate professional-looking guest lists ready for printing or sharing.
                Export to PDF with just one click.
              </p>
              <ul className="space-y-3">
                {["Professional PDF exports", "Print-ready formats", "Easy sharing options"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-white w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden">
                <img src="/placeholder.svg" alt="Export Process" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
