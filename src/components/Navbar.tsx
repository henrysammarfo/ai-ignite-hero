const navLinks = [
  { label: "Protocol", target: "features" },
  { label: "Security", target: "security" },
  { label: "Ecosystem", target: "ecosystem" },
  { label: "Team", target: "team" },
];

const Navbar = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="font-serif text-xl font-bold text-primary tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        Fortis
      </a>

      {/* Center Links */}
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
        <button className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 font-sans font-semibold text-sm hover:bg-primary/90 transition-colors">
          Launch App
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
