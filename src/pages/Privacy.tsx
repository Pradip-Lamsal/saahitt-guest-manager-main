
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <div className="prose max-w-none">
              <p className="mb-6">
                At Saahitt Guest Manager, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
                and share your personal information when you use our services.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">Information We Collect</h2>
              <p className="mb-4">
                We collect several types of information from and about users of our website and services, including:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">
                  <strong>Personal identifiers</strong> such as name, email address, and phone number that you provide 
                  when you register for an account.
                </li>
                <li className="mb-2">
                  <strong>Guest information</strong> that you input into our system, including names, contact information, 
                  and other details relevant to your event planning.
                </li>
                <li className="mb-2">
                  <strong>Usage data</strong> such as how you interact with our services, features you use, and time spent on the platform.
                </li>
                <li className="mb-2">
                  <strong>Device information</strong> including your IP address, browser type, and operating system.
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">Provide, maintain, and improve our services</li>
                <li className="mb-2">Process transactions and send related information</li>
                <li className="mb-2">Send you technical notices, updates, and support messages</li>
                <li className="mb-2">Respond to your comments and questions</li>
                <li className="mb-2">Understand how users interact with our services</li>
                <li className="mb-2">Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">Information Sharing</h2>
              <p className="mb-6">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">With service providers who perform services on our behalf</li>
                <li className="mb-2">To comply with legal obligations</li>
                <li className="mb-2">To protect the rights, property, or safety of our users or others</li>
                <li className="mb-2">In connection with a business transaction such as a merger or acquisition</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">Data Security</h2>
              <p className="mb-6">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, disclosure, alteration, and destruction.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights</h2>
              <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">Access to your personal information</li>
                <li className="mb-2">Correction of inaccurate or incomplete information</li>
                <li className="mb-2">Deletion of your personal information</li>
                <li className="mb-2">Restriction or objection to processing</li>
                <li className="mb-2">Data portability</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 mt-8">Contact Us</h2>
              <p className="mb-6">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@saahitt.com" className="text-[#FF6F00] hover:underline">
                  privacy@saahitt.com
                </a>.
              </p>
              
              <div className="bg-[#FFF8F0] p-6 rounded-lg my-8 border border-[#FFE4CC]">
                <p className="mb-4">Have questions about how we handle your data?</p>
                <Link to="/contact">
                  <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">Contact Us</Button>
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

export default Privacy;
