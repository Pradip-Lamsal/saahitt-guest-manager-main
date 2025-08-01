
import { GlassWater, Cake, Building, Users } from "lucide-react";

const eventTypes = [
  {
    title: "Weddings",
    description: "Plan your big day stress-free",
    icon: GlassWater,
  },
  {
    title: "Birthdays",
    description: "Track invites for your celebration",
    icon: Cake,
  },
  {
    title: "Corporate Events",
    description: "Organize your guest list like a pro",
    icon: Building,
  },
  {
    title: "Conferences & Seminars",
    description: "Ensure smooth check-ins",
    icon: Users,
  },
];

export const EventTypes = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C2C2C]">
          Perfect for Any Occasion in Nepal
        </h2>
        <p className="text-xl text-[#2C2C2C] text-center mb-12 max-w-3xl mx-auto">
          From traditional ceremonies to modern gatherings, we've got you covered
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {eventTypes.map((type) => (
            <div
              key={type.title}
              className="bg-[#FAF3E0] p-8 rounded-lg shadow-sm hover:shadow-md transition-all animate-fade-in"
            >
              <type.icon className="w-12 h-12 text-[#FF6F00] mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2 text-[#2C2C2C] text-center">{type.title}</h3>
              <p className="text-[#2C2C2C] text-center">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
