import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { label: "Protocol", target: "features" },
  { label: "Security", target: "security" },
  { label: "Ecosystem", target: "ecosystem" },
  { label: "Team", target: "team" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-serif text-xl font-bold text-primary tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          Fortis
        </a>

        {/* Center Links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.target)}
              className="font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hidden sm:block font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Book A Demo
          </a>
          <button className="hidden md:block bg-primary text-primary-foreground rounded-full px-5 py-2.5 font-sans font-semibold text-sm hover:bg-primary/90 transition-colors">
            Launch App
          </button>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

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

            <button className="mt-2 bg-primary text-primary-foreground rounded-full px-6 py-3.5 font-sans font-semibold text-base hover:bg-primary/90 transition-colors w-full">
              Launch App
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
