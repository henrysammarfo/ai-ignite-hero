import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SecuritySection from "@/components/SecuritySection";
import TeamSection from "@/components/TeamSection";

const Index = () => {
  return (
    <div className="bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <TeamSection />
    </div>
  );
};

export default Index;
