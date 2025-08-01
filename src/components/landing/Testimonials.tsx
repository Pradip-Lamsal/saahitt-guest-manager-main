
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    quote: "This saved me 10+ hours of manual work!",
    author: "Priya",
    role: "Wedding Planner",
  },
  {
    quote: "Finally, a guest management tool that actually makes sense.",
    author: "Raj",
    role: "Event Organizer",
  },
  {
    quote: "The best investment for my event planning business.",
    author: "Anisha",
    role: "Corporate Event Manager",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-[#2C2C2C]">
          See What Others Are Saying
        </h2>
        <p className="text-xl text-[#2C2C2C] text-center mb-12 max-w-3xl mx-auto">
          Don't just take our word for it - hear from our satisfied users
        </p>
        <div className="max-w-4xl mx-auto">
          <Carousel>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="bg-[#FAF3E0] p-8 rounded-lg text-center">
                    <p className="text-xl italic mb-4 text-[#2C2C2C]">"{testimonial.quote}"</p>
                    <p className="font-semibold text-[#FF6F00]">{testimonial.author}</p>
                    <p className="text-[#2C2C2C]">{testimonial.role}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
