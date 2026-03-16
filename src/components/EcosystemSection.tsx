import { motion } from "motion/react";

const ecosystem = [
  "Solana Foundation",
  "AMINA Bank",
  "Solstice Labs",
  "UBS",
  "SIX BFI",
  "Keyrock",
  "Fireblocks",
  "Steakhouse Financial",
  "Softstack",
];

const EcosystemSection = () => {
  return (
    <section className="relative bg-card py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-muted-foreground font-sans text-xs tracking-[0.2em] uppercase text-center mb-14"
        >
          Built for the institutional ecosystem
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5"
        >
          {ecosystem.map((name, index) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * index, duration: 0.4 }}
              className="font-sans text-base sm:text-lg font-medium text-muted-foreground/40 hover:text-primary transition-colors duration-300 cursor-default select-none"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EcosystemSection;
