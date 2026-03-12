import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Institutional Onboarding",
    description:
      "Banks and financial institutions complete KYC/AML verification. Approved entities receive a credential NFT granting vault access.",
  },
  {
    number: "02",
    title: "Deposit & Segregation",
    description:
      "Stablecoins (USDC, USDT) are deposited into permissioned vaults. Each institution's funds are segregated via Solana PDAs — no commingling.",
  },
  {
    number: "03",
    title: "DeFi Yield Strategies",
    description:
      "Vault managers deploy capital across whitelisted DeFi protocols — lending, LPing, and RWA-backed strategies — generating 4–12% APY.",
  },
  {
    number: "04",
    title: "Withdraw & Audit",
    description:
      "Institutions withdraw at any time with full on-chain audit trails. Every transaction is Travel Rule compliant with immutable compliance records.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative bg-card py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-primary font-sans text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-xl">
            From onboarding to yield
          </h2>
        </motion.div>

        {/* Steps — horizontal number, stacked content */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-6 py-10 border-t border-border first:border-t-0"
            >
              <span className="font-sans text-primary/40 group-hover:text-primary font-bold text-3xl md:text-4xl transition-colors duration-500 pt-1">
                {step.number}
              </span>
              <div>
                <h3 className="font-sans text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
