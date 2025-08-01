
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, FileText, HelpCircle, Mail, BookOpen, Video, Users, Calendar, Wallet, CheckSquare } from "lucide-react";
import { useState } from "react";

const helpCategories = [
  {
    title: "Getting Started",
    icon: <BookOpen className="h-8 w-8 text-[#FF6F00]" />,
    description: "Learn the basics of Saahitt Guest Manager",
    link: "/help/getting-started"
  },
  {
    title: "Guest Management",
    icon: <Users className="h-8 w-8 text-[#FF6F00]" />,
    description: "How to add, edit, and organize your guest list",
    link: "/help/guest-management"
  },
  {
    title: "Plans & Billing",
    icon: <Wallet className="h-8 w-8 text-[#FF6F00]" />,
    description: "Information about our subscription plans",
    link: "/help/billing"
  },
  {
    title: "Event Planning",
    icon: <Calendar className="h-8 w-8 text-[#FF6F00]" />,
    description: "Creating and managing your events",
    link: "/help/event-planning"
  }
];

const popularArticles = [
  {
    title: "How to import guests from a spreadsheet",
    link: "/help/article/import-guests"
  },
  {
    title: "Setting up categories for your guest list",
    link: "/help/article/guest-categories"
  },
  {
    title: "Tracking RSVPs and responses",
    link: "/help/article/track-rsvps"
  },
  {
    title: "Generating printable guest lists",
    link: "/help/article/print-lists"
  },
  {
    title: "Upgrading your subscription plan",
    link: "/help/article/upgrade-plan"
  }
];

const recentArticles = [
  {
    title: "Using the new drag-and-drop guest organizer",
    link: "/help/article/drag-drop-organize"
  },
  {
    title: "Sending automated reminder emails",
    link: "/help/article/automated-reminders"
  },
  {
    title: "Creating custom guest fields",
    link: "/help/article/custom-fields"
  }
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Help Center Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Find answers to your questions about Saahitt Guest Manager
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pr-12 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-0 top-0 bottom-0 bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
          
          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">Browse Help Categories</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <Link 
                  key={index} 
                  to={category.link}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Popular Articles */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
              {popularArticles.map((article, index) => (
                <Link 
                  key={index} 
                  to={article.link}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-[#FF6F00] mr-3 shrink-0" />
                    <span>{article.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* New & Updated Articles */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">New & Updated Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((article, index) => (
                <Link 
                  key={index} 
                  to={article.link}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start mb-3">New</div>
                    <h3 className="font-semibold mb-2">{article.title}</h3>
                    <div className="flex items-center text-[#FF6F00] mt-auto pt-2">
                      <span className="text-sm">Read article</span>
                      <CheckSquare className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Video Tutorials Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Video Tutorials</h2>
            <div className="bg-[#FFF8F0] rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                  <Video className="h-16 w-16 text-[#FF6F00] mb-4 mx-auto md:mx-0" />
                  <h3 className="text-xl font-semibold mb-2 text-center md:text-left">Learn by Watching</h3>
                  <p className="text-gray-600 text-center md:text-left">
                    Our video tutorials provide step-by-step visual guidance for all major features.
                  </p>
                </div>
                <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-200 relative">
                      <img 
                        src="/placeholder.svg" 
                        alt="Getting Started Tutorial" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#FF6F00]/90 text-white rounded-full w-12 h-12 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">Getting Started with Guest Manager</h4>
                      <p className="text-sm text-gray-500">3:45 mins</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-200 relative">
                      <img 
                        src="/placeholder.svg" 
                        alt="Importing Guests Tutorial" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#FF6F00]/90 text-white rounded-full w-12 h-12 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">Importing Your Guest List</h4>
                      <p className="text-sm text-gray-500">4:12 mins</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                  View All Tutorials
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contact Support CTA */}
          <div className="bg-[#FFF8F0] rounded-lg p-8 text-center max-w-3xl mx-auto">
            <Mail className="h-12 w-12 text-[#FF6F00] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                  Contact Support
                </Button>
              </Link>
              <Link to="/email-support">
                <Button variant="outline" className="border-[#FF6F00] text-[#FF6F00] hover:bg-[#FF6F00]/10">
                  Email Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
