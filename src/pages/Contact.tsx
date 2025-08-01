
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
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
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6 text-center">Contact Us</h1>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Have questions about Guest Manager or any other Saahitt service? We're here to help!
              Fill out the form below or reach out to us directly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#FFF0E6] rounded-full flex items-center justify-center mb-4">
                  <Mail className="text-[#FF6F00] w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600 mb-3">For general inquiries:</p>
                <a href="mailto:info@saahitt.com" className="text-[#FF6F00] hover:underline">
                  info@saahitt.com
                </a>
              </div>
              
              <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#FFF0E6] rounded-full flex items-center justify-center mb-4">
                  <Phone className="text-[#FF6F00] w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 mb-3">Monday to Friday, 9AM-5PM:</p>
                <a href="tel:+9779841234567" className="text-[#FF6F00] hover:underline">
                  +977 9841 234567
                </a>
              </div>
              
              <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#FFF0E6] rounded-full flex items-center justify-center mb-4">
                  <MapPin className="text-[#FF6F00] w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Office</h3>
                <p className="text-gray-600 mb-3">Visit us at:</p>
                <address className="not-italic text-[#2C2C2C]">
                  Jhamsikhel, Lalitpur<br />
                  Kathmandu, Nepal
                </address>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
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
                
                <div className="mb-6">
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
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
