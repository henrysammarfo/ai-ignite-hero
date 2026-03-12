import { motion } from "motion/react";
import { ShieldCheck, Fingerprint, ArrowLeftRight, FileSearch } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "KYC at the Smart Contract Level",
    description:
      "On-chain identity verification via credential NFTs. Only whitelisted, KYC-approved wallets can deposit into vaults — enforced by Solana program logic, not middleware.",
  },
  {
    icon: ShieldCheck,
    title: "AML & Sanctions Screening",
    description:
      "Real-time anti-money laundering checks integrated into the deposit flow. Wallets are screened against OFAC, EU, and UN sanctions lists before any funds move on-chain.",
  },
  {
    icon: ArrowLeftRight,
    title: "Travel Rule Compliance",
    description:
      "Automated originator and beneficiary data exchange for cross-border transfers above regulatory thresholds, meeting FATF and MiCA requirements natively.",
  },
  {
    icon: FileSearch,
    title: "Source-of-Funds Verification",
    description:
      "Institutional depositors must provide auditable proof of fund origin. Verified attestations are stored on-chain, creating an immutable compliance trail.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative bg-background py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-sans text-sm font-semibold tracking-widest uppercase mb-4">
            Compliance Infrastructure
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Regulation-native by design
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Every compliance layer is enforced at the smart contract level — not bolted on as an afterthought.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-sans text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
