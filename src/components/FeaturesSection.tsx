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
    <section className="relative bg-background py-28 px-6 overflow-hidden">
      {/* Decorative line accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-primary font-sans text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Compliance Infrastructure
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-2xl">
            Regulation-native by design
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl leading-relaxed">
            Every compliance layer is enforced at the smart contract level — not bolted on as an afterthought.
          </p>
        </motion.div>

        {/* Feature Cards — asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/50 rounded-2xl overflow-hidden">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-background p-10 md:p-12 flex flex-col gap-5 hover:bg-card transition-colors duration-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                  <feature.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-sans text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
