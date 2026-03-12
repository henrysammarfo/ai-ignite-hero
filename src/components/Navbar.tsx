const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="font-serif text-xl font-bold text-primary tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        Fortis
      </a>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Protocol", "Security", "Docs", "Team"].map((label) => (
          <a
            key={label}
            href="#"
            className="font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {label}
          </a>
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
