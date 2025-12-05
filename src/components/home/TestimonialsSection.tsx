import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
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
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Testimonials", "Yorumlar")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            {t("What Our Guests Say", "Misafirlerimiz Ne Diyor")}
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="relative bg-cream/5 backdrop-blur-sm rounded-2xl p-8 border border-cream/10 hover:border-primary/30 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              {/* Quote Icon */}
              <Quote className="text-primary/30 mb-4" size={40} />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  >
                    <Star className="text-gold fill-gold" size={18} />
                  </motion.div>
                ))}
              </div>

              {/* Text */}
              <p className="text-cream/80 leading-relaxed mb-6 italic">
                "{language === "en" ? testimonial.text : testimonial.textTr}"
              </p>

              {/* Author */}
              <p className="font-semibold text-cream">{testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;