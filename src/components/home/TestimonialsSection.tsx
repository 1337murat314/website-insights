import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TESTIMONIALS } from "@/lib/constants";

const TestimonialsSection = () => {
  const { language, t } = useLanguage();

  return (
    <section className="section-padding bg-charcoal text-cream relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Testimonials", "Yorumlar")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            {t("What Our Guests Say", "Misafirlerimiz Ne Diyor")}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-cream/5 backdrop-blur-sm rounded-2xl p-8 border border-cream/10 hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote Icon */}
              <Quote className="text-primary/30 mb-4" size={40} />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="text-gold fill-gold" size={18} />
                ))}
              </div>

              {/* Text */}
              <p className="text-cream/80 leading-relaxed mb-6 italic">
                "{language === "en" ? testimonial.text : testimonial.textTr}"
              </p>

              {/* Author */}
              <p className="font-semibold text-cream">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;