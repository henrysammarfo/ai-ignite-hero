import { motion } from "motion/react";
import { Lock, Layers, Eye, Server } from "lucide-react";

const layers = [
  {
    icon: Lock,
    title: "PDA-Level Fund Segregation",
    description:
      "Each institution's assets are isolated in dedicated Program Derived Addresses. No commingling — even at the protocol level.",
  },
  {
    icon: Layers,
    title: "Multi-Sig Governance",
    description:
      "Vault operations require multi-signature approval from authorized compliance officers. No single point of failure.",
  },
  {
    icon: Eye,
    title: "Real-Time KYT Monitoring",
    description:
      "Know-Your-Transaction monitoring flags suspicious activity in real time. Automated alerts and transaction freezing for anomalous patterns.",
  },
  {
    icon: Server,
    title: "On-Chain Audit Trail",
    description:
      "Every deposit, withdrawal, and yield distribution is permanently recorded on Solana. Full transparency for regulators and auditors.",
  },
];

const SecuritySection = () => {
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
            Security Architecture
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Institutional-grade security
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Defense in depth — from smart contract isolation to real-time transaction monitoring.
          </p>
        </motion.div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-card p-10 flex flex-col gap-4"
            >
              <layer.icon size={28} className="text-primary" />
              <h3 className="font-sans text-xl font-semibold text-foreground">
                {layer.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {layer.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
