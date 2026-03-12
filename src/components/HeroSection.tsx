import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const videoSrc =
  "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";
const posterSrc =
  "https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        poster={posterSrc}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />

      {/* Decorative Gradients */}
      <div
        className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen pointer-events-none"
      />
      <div
        className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] mix-blend-screen pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center mx-auto max-w-5xl px-6 mt-20 min-h-screen justify-center space-y-12">
        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-5xl lg:text-[48px] leading-[1.1] text-white"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Institutional yield, on-chain compliance
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-sans font-semibold text-6xl sm:text-8xl lg:text-[136px] leading-[0.9] tracking-tighter bg-gradient-to-b from-primary via-primary to-foreground bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Fortis
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-sans text-lg sm:text-[20px] leading-[1.65] text-white max-w-xl"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Permissioned DeFi vaults on Solana. Earn 4–12% APY on stablecoin
          holdings with KYC, AML, and Travel Rule compliance enforced at the
          smart contract level.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          {/* Primary Button */}
          <button
            className="group flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            <span
              className="font-medium text-lg text-[#0a0400]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Launch App
            </span>
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3054ff] group-hover:bg-[#2040e0] transition-colors">
              <ArrowRight size={20} className="text-white" />
            </span>
          </button>

          {/* Secondary Button */}
          <a
            href="#"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-white backdrop-blur-sm hover:bg-white/5 transition-all"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Read the Docs
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
