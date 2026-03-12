import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";

const navLinks = [
  { label: "Protocol", target: "features" },
  { label: "How It Works", target: "how-it-works" },
  { label: "Security", target: "security" },
  { label: "Ecosystem", target: "ecosystem" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    navLinks.forEach((link) => {
      const el = document.getElementById(link.target);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="font-serif text-xl font-bold text-primary tracking-tight flex items-center gap-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Fortis
          </a>

          {/* Center pill nav — desktop */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-2 py-1.5">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.target)}
                className={`relative font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 ${
                  activeSection === item.target
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeSection === item.target && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hidden md:block font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
            <div className="hidden md:block w-px h-4 bg-border" />
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hidden md:flex items-center gap-2 rounded-full border border-border/50 px-4 py-1.5 font-sans text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
            >
              Book A Demo
            </button>
            <a href="/dashboard" className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground rounded-full pl-5 pr-1.5 py-1.5 font-sans font-semibold text-sm hover:shadow-[0_0_20px_hsl(43_72%_55%/0.25)] transition-all duration-300 group no-underline">
              <span>Launch App</span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
                <ArrowRight size={14} className="text-primary-foreground" />
              </span>
            </a>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-foreground"
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-20 px-8 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.target)}
                className="font-sans text-2xl font-medium text-foreground hover:text-primary transition-colors text-left"
              >
                {item.label}
              </button>
            ))}

            <hr className="border-border my-2" />

            <a
              href="#"
              className="font-sans text-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              Book A Demo
            </a>

            <a href="/dashboard" className="mt-2 bg-primary text-primary-foreground rounded-full px-6 py-3.5 font-sans font-semibold text-base hover:bg-primary/90 transition-colors w-full block text-center no-underline">
              Launch App
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
