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
    <section className="relative bg-card py-20 px-6 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-muted-foreground font-sans text-sm tracking-widest uppercase">
            Built for the institutional ecosystem
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        >
          {ecosystem.map((name, index) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="font-sans text-lg sm:text-xl font-medium text-muted-foreground/60 hover:text-primary transition-colors duration-300 cursor-default"
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
