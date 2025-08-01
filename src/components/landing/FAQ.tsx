
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this really free to use?",
    answer: "Yes! The basic version is forever free. You can manage up to 100 guests without any charges.",
  },
  {
    question: "Do I need to pay monthly?",
    answer: "No, we offer one-time payment plans. Once you upgrade, you own that tier forever.",
  },
  {
    question: "How do I track RSVPs?",
    answer: "The app lets you mark guests as Confirmed/Maybe/Unavailable, making it easy to track responses.",
  },
  {
    question: "Can I send digital invites?",
    answer: "This feature is coming soon in our Ultimate Plan! Stay tuned for updates.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-20 bg-[#FAF3E0]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C2C2C]">
          Got Questions? We've Got Answers!
        </h2>
        <p className="text-xl text-[#2C2C2C] text-center mb-12 max-w-3xl mx-auto">
          Find answers to our most commonly asked questions
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-[#2C2C2C] hover:text-[#FF6F00]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#2C2C2C]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
