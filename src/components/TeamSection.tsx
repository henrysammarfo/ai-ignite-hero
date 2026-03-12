import { motion } from "motion/react";

const team = [
  {
    name: "M1",
    role: "Solana Smart Contract Lead",
    focus: "Anchor programs, PDA vaults, on-chain compliance logic",
  },
  {
    name: "M2",
    role: "Backend & Integration",
    focus: "KYC/AML APIs, off-chain oracles, Travel Rule engine",
  },
  {
    name: "M3",
    role: "Security & Compliance",
    focus: "Threat modeling, audit trails, regulatory alignment",
  },
  {
    name: "M4",
    role: "Frontend & Demo",
    focus: "Institutional dashboard, demo flows, submission materials",
  },
];

const TeamSection = () => {
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
            The Team
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Built by specialists
          </h2>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-background p-8 text-center"
            >
              {/* Avatar Placeholder */}
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                <span className="text-primary font-sans font-bold text-lg">
                  {member.name}
                </span>
              </div>
              <h3 className="font-sans font-semibold text-foreground text-lg mb-1">
                {member.role}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {member.focus}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-28 pt-8 border-t border-border text-center">
        <p className="text-muted-foreground text-sm">
          © 2026 Fortis. Built for StableHacks 2026 — Institutional Permissioned DeFi Vaults on Solana.
        </p>
      </div>
    </section>
  );
};

export default TeamSection;
