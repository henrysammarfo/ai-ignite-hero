import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SecuritySection from "@/components/SecuritySection";
import EcosystemSection from "@/components/EcosystemSection";
import TeamSection from "@/components/TeamSection";

const Index = () => {
  return (
    <div className="bg-background scroll-smooth">
      <Navbar />
      <HeroSection />
      <section id="features"><FeaturesSection /></section>
      <section id="how-it-works"><HowItWorksSection /></section>
      <section id="security"><SecuritySection /></section>
      <section id="ecosystem"><EcosystemSection /></section>
      <section id="team"><TeamSection /></section>
    </div>
  );
};

export default Index;
