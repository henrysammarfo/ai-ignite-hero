import { ChevronDown } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill="white" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="12"
              y1="12"
              x2={12 + 10 * Math.cos((angle * Math.PI) / 180)}
              y2={12 + 10 * Math.sin((angle * Math.PI) / 180)}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Products", hasChevron: true },
          { label: "Customer Stories" },
          { label: "Resources" },
          { label: "Pricing" },
        ].map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-1 font-sans text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {item.label}
            {item.hasChevron && <ChevronDown size={14} />}
          </a>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="hidden sm:block font-sans text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Book A Demo
        </a>
        <button className="bg-white text-black rounded-full px-5 py-2.5 font-sans font-semibold text-sm hover:bg-white/90 transition-colors">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
