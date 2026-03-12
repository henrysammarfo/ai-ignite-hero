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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-sans text-sm font-semibold tracking-widest uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            From onboarding to yield
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex items-start gap-8 md:pl-20"
              >
                {/* Step Number */}
                <div className="absolute left-0 hidden md:flex w-16 h-16 items-center justify-center rounded-full border border-primary/30 bg-background">
                  <span className="font-sans text-primary font-bold text-lg">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-2xl border border-border bg-background p-8">
                  <span className="md:hidden text-primary font-sans font-bold text-sm mb-2 block">
                    Step {step.number}
                  </span>
                  <h3 className="font-sans text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
