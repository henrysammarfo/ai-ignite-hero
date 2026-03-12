import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.08, 0]);

  return (
    <section ref={ref} className="relative bg-background py-28 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Parallax glow — opposite direction */}
      <motion.div
        style={{ y: bgY, opacity: glowOpacity }}
        className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-primary blur-[180px] pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-primary font-sans text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Security Architecture
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-2xl">
            Institutional-grade security
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl leading-relaxed">
            Defense in depth — from smart contract isolation to real-time transaction monitoring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50 rounded-2xl overflow-hidden">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-card p-10 md:p-12 flex flex-col gap-5 hover:bg-card/80 transition-colors duration-500"
            >
              <layer.icon size={24} className="text-primary/60 group-hover:text-primary transition-colors duration-500" />
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {layer.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
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
