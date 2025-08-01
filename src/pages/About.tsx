
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6">About Saahitt</h1>
            
            <div className="prose max-w-none">
              <p className="text-lg mb-6">
                Guest Manager is one of many innovative tools created by Saahitt, a platform dedicated to 
                making event planning effortless and enjoyable.
              </p>
              
              <p className="mb-6">
                Founded with the vision of transforming how people plan and manage events in Nepal, 
                Saahitt offers comprehensive solutions for every aspect of your event journey - from 
                guest management to venue selection, vendor coordination, and more.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-100">
                <h2 className="text-2xl font-semibold mb-4">Visit Our Main Platform</h2>
                <p className="mb-4">
                  Explore the complete suite of Saahitt services at our main website.
                </p>
                <a 
                  href="https://saahitt.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#FF6F00] hover:underline font-medium"
                >
                  saahitt.com <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-6">
                At Saahitt, we believe that event planning should be a joyful experience, not a stressful one. 
                Our mission is to provide innovative, user-friendly tools that simplify every aspect of event management, 
                allowing you to focus on creating memorable experiences.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">The Guest Manager Tool</h2>
              <p className="mb-6">
                The Guest Manager is designed to take the hassle out of guest list management. 
                From organizing your contacts to tracking RSVPs and managing seating arrangements, 
                our tool helps you keep everything organized in one place.
              </p>
              
              <div className="bg-[#FFF8F0] p-6 rounded-lg my-8 border border-[#FFE4CC]">
                <h3 className="text-xl font-semibold mb-3">Ready to streamline your event planning?</h3>
                <p className="mb-4">Join thousands of event planners who trust Saahitt for their event management needs.</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/auth?tab=signup">
                    <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">Get Started Now</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" className="border-[#FF6F00] text-[#FF6F00] hover:bg-[#FF6F00]/10">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
