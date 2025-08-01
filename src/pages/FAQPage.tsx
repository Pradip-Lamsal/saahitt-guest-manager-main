
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const generalFaqs = [
    {
      question: "What is Saahitt Guest Manager?",
      answer: "Saahitt Guest Manager is a comprehensive guest list management tool that helps you organize, categorize, and track your event attendees. It's designed to simplify the process of planning events by providing powerful guest management features."
    },
    {
      question: "Is Saahitt Guest Manager free to use?",
      answer: "Yes, we offer a free plan that allows you to manage up to 100 guests. For larger events or additional features, we offer premium plans at affordable prices."
    },
    {
      question: "Can I export my guest list to Excel or PDF?",
      answer: "Yes, all plans include the ability to export your guest list to PDF for printing. Premium plans also offer Excel export functionality for more advanced data management."
    },
    {
      question: "How secure is my guest information?",
      answer: "We take data security very seriously. All guest information is encrypted and stored securely in our database. We never share your data with third parties without your explicit permission."
    }
  ];

  const accountFaqs = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Get Started' button on our homepage and following the registration process. You'll need to provide a valid email address and create a password."
    },
    {
      question: "Can I change my email address or password?",
      answer: "Yes, you can update your email address and password in your account settings after logging in."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account by going to your account settings and selecting the 'Delete Account' option. Please note that this action is irreversible and will permanently delete all your data."
    }
  ];

  const billingFaqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards including Visa, MasterCard, and American Express. We also support local payment options in Nepal."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time from your account settings. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, the new rate will apply at the start of your next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "If you're not satisfied with our service, you can request a refund within 14 days of your initial purchase. Please contact our support team to process your refund."
    }
  ];

  const featureFaqs = [
    {
      question: "Can I categorize my guests?",
      answer: "Yes, you can create custom categories to organize your guests (e.g., family, friends, colleagues) and filter your guest list accordingly."
    },
    {
      question: "Is there a limit to how many guests I can add?",
      answer: "The free plan allows up to 100 guests. Our premium plans offer increased limits with the Advanced plan supporting up to 300 guests and the Ultimate plan allowing unlimited guests."
    },
    {
      question: "Can I track RSVPs through the app?",
      answer: "Yes, our system allows you to track RSVP status for each guest. Premium plans also include features for sending digital invites and automated RSVP tracking."
    },
    {
      question: "Does Saahitt Guest Manager work on mobile devices?",
      answer: "Yes, our application is fully responsive and works well on smartphones and tablets, allowing you to manage your guest list on the go."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6 text-center">Frequently Asked Questions</h1>
            <p className="text-center text-gray-600 mb-12">
              Find answers to common questions about Saahitt Guest Manager
            </p>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">General</h2>
              <Accordion type="single" collapsible className="mb-6">
                {generalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`general-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
              <Accordion type="single" collapsible className="mb-6">
                {accountFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`account-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Billing & Plans</h2>
              <Accordion type="single" collapsible className="mb-6">
                {billingFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`billing-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Features & Functionality</h2>
              <Accordion type="single" collapsible className="mb-6">
                {featureFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`feature-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="bg-[#FFF8F0] p-6 rounded-lg my-8 border border-[#FFE4CC] text-center">
              <h3 className="text-xl font-semibold mb-3">Still have questions?</h3>
              <p className="mb-4">We're here to help! Contact our support team for assistance.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact">
                  <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">Contact Support</Button>
                </Link>
                <Link to="/help">
                  <Button variant="outline" className="border-[#FF6F00] text-[#FF6F00] hover:bg-[#FF6F00]/10">
                    Visit Help Center
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

export default FAQPage;
