import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative bg-background py-28 px-6">
      {/* Decorative glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
          Ready to earn institutional yield?
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Book a demo to see how Fortis can integrate with your institution's
          treasury operations — compliant, on-chain, and fully segregated.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/30 bg-card p-8"
          >
            <p className="text-primary font-sans font-semibold text-lg mb-2">
              We'll be in touch.
            </p>
            <p className="text-muted-foreground">
              Our team will reach out to schedule your demo.
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your institutional email"
              className="flex-1 w-full sm:w-auto rounded-full bg-card border border-border px-6 py-3.5 text-foreground placeholder:text-muted-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="submit"
              className="group flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-primary hover:shadow-[0_0_20px_hsl(43_72%_55%/0.3)] hover:scale-105 transition-all duration-300"
            >
              <span className="font-medium text-sm text-primary-foreground font-sans whitespace-nowrap">
                Book A Demo
              </span>
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
                <ArrowRight size={16} className="text-primary-foreground" />
              </span>
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default CTASection;
