import { Star, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { TESTIMONIALS } from "@/lib/constants";

const TestimonialsSection = () => {
  const { language, t } = useLanguage();

  return (
    <section className="section-padding bg-charcoal text-cream relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <Sparkles className="text-primary" size={18} />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>
          
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6">
            {t("Testimonials", "Yorumlar")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t("What Our", "Misafirlerimiz")}
            <span className="font-script text-primary ml-3">{t("Guests Say", "Ne Diyor")}</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {/* Card */}
              <motion.div
                className="relative bg-gradient-to-b from-cream/10 to-cream/5 backdrop-blur-sm rounded-3xl p-8 border border-cream/10 h-full"
                whileHover={{ 
                  y: -10,
                  borderColor: 'hsl(var(--primary) / 0.4)',
                  transition: { duration: 0.3 } 
                }}
              >
                {/* Glow Effect on Hover */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-2">
                  <Quote className="text-primary/40" size={60} strokeWidth={1} />
                </div>

                {/* Rating */}
                <div className="flex gap-1.5 mb-6 pt-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    >
                      <Star className="text-gold fill-gold" size={18} />
                    </motion.div>
                  ))}
                </div>

                {/* Text */}
                <p className="text-cream/85 text-lg leading-relaxed mb-8 font-light italic">
                  "{language === "en" ? testimonial.text : testimonial.textTr}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-cream/10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-serif text-lg text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-cream">{testimonial.name}</p>
                    <p className="text-cream/50 text-sm">{t("Verified Guest", "Doğrulanmış Misafir")}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;