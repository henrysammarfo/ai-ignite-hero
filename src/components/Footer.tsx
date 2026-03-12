import { motion } from "motion/react";

const footerLinks = {
  Protocol: ["Overview", "How It Works", "Security", "Audit Reports"],
  Resources: ["Documentation", "GitHub", "Blog", "FAQs"],
  Legal: ["Terms of Service", "Privacy Policy", "Risk Disclosure"],
};

const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-border">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8"
        >
          {/* Brand Column */}
          <div className="md:col-span-1">
            <span
              className="font-serif text-2xl text-primary tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Fortis
            </span>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-[240px]">
              Institutional-grade permissioned DeFi vaults on Solana. Built for
              StableHacks 2026.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-sans text-xs font-semibold tracking-widest uppercase text-foreground mb-5">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-sans">
            © 2026 Fortis Protocol. Built for StableHacks 2026.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors"
            >
              Discord
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
