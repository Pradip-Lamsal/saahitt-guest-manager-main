
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, FileText, Printer, Share2 } from "lucide-react";
import { ReactNode } from "react";

interface HelpArticleLayoutProps {
  title: string;
  children: ReactNode;
  category?: string;
  categoryLink?: string;
  lastUpdated?: string;
}

const HelpArticleLayout = ({
  title,
  children,
  category = "Guest Management",
  categoryLink = "/help/guest-management",
  lastUpdated = "2 weeks ago",
}: HelpArticleLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link to="/help" className="inline-flex items-center text-[#FF6F00] hover:underline">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Help Center
              </Link>
              
              {category && (
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Link to="/help" className="hover:text-[#FF6F00]">Help Center</Link>
                  <span className="mx-2">›</span>
                  <Link to={categoryLink} className="hover:text-[#FF6F00]">{category}</Link>
                  <span className="mx-2">›</span>
                  <span className="text-gray-700">{title}</span>
                </div>
              )}
            </div>
            
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2C2C2C] mb-4">{title}</h1>
              <div className="flex flex-wrap items-center justify-between gap-y-4">
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Article Content */}
            <div className="prose max-w-none">
              {children}
            </div>
            
            {/* Article Footer */}
            <div className="mt-12 pt-6 border-t">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">Was this article helpful?</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Yes</Button>
                    <Button variant="outline" size="sm">No</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Need more help?</h3>
                  <Link to="/contact">
                    <Button size="sm" className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Related Articles */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  to="/help/article/guest-categories" 
                  className="flex items-start p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText className="h-5 w-5 text-[#FF6F00] mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Setting up categories for your guest list</h3>
                    <p className="text-sm text-gray-600">Learn how to organize guests by categories</p>
                  </div>
                </Link>
                <Link 
                  to="/help/article/track-rsvps" 
                  className="flex items-start p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText className="h-5 w-5 text-[#FF6F00] mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Tracking RSVPs and responses</h3>
                    <p className="text-sm text-gray-600">Keep track of who's attending your event</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpArticleLayout;
