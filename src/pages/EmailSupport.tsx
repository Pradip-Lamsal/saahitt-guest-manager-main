
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ArrowRight, Clock, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

const EmailSupport = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    attachFile: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachFile: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Support Request Submitted",
        description: "We've received your email and will respond within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
        attachFile: null
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Mail className="w-16 h-16 text-[#FF6F00] mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-[#2C2C2C] mb-4">Email Support</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Need assistance with your Saahitt Guest Manager account? Fill out the form below and our support team will get back to you promptly.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <CheckCircle className="text-green-500 w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quick Response</h3>
                <p className="text-gray-600">
                  Our team typically responds within 24 hours during business days.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <Clock className="text-[#FF6F00] w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Support Hours</h3>
                <p className="text-gray-600">
                  Monday to Friday, 9:00 AM to 5:00 PM NPT (Nepal Time)
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <ArrowRight className="text-blue-500 w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Before You Write</h3>
                <p className="text-gray-600">
                  Check our <Link to="/faq" className="text-[#FF6F00] hover:underline">FAQs</Link> for quick answers to common questions.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Support Category
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="technical">Technical Problems</SelectItem>
                      <SelectItem value="feature">Feature Requests</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Please describe your issue in detail. Include any error messages or steps to reproduce the problem if applicable."
                  />
                </div>
                
                <div>
                  <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment (Optional)
                  </label>
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max file size: 10MB. Supported formats: JPG, PNG, PDF, DOC, DOCX
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit Support Request"}
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Looking for immediate assistance?
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/help">
                  <Button variant="outline" className="border-[#FF6F00] text-[#FF6F00] hover:bg-[#FF6F00]/10">
                    Browse Help Center
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" className="border-[#FF6F00] text-[#FF6F00] hover:bg-[#FF6F00]/10">
                    Check FAQs
                  </Button>
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

export default EmailSupport;
