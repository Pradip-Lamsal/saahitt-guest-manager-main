import { ClipboardList, Users, Printer, FileSpreadsheet, Calendar, Star } from "lucide-react";

const features = [
  {
    title: "Guest List Management",
    description: "Add, categorize, and rank guests with one click.",
    icon: Users,
  },
  {
    title: "Priority-Based Sorting",
    description: "Ensure VIPs are always listed first.",
    icon: Star,
  },
  {
    title: "Track RSVP Status",
    description: "Know who's attending instantly.",
    icon: Calendar,
  },
  {
    title: "Export & Print",
    description: "Download your list as a neat, formatted PDF.",
    icon: Printer,
  },
  {
    title: "One-Time Payment",
    description: "No subscriptions, just pay once, use forever.",
    icon: FileSpreadsheet,
  },
  {
    title: "Easy Import",
    description: "Import guest lists from Excel or CSV files.",
    icon: ClipboardList,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C2C2C]">
          What Makes It So Powerful?
        </h2>
        <p className="text-xl text-[#2C2C2C] text-center mb-12 max-w-3xl mx-auto">
          Discover the features that make our guest management tool indispensable for event planning.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#FAF3E0] p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in"
            >
              <feature.icon className="w-12 h-12 text-[#FF6F00] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2C2C2C]">{feature.title}</h3>
              <p className="text-[#2C2C2C]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};