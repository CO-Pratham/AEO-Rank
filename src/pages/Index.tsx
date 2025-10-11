import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DashboardPreview from "@/components/DashboardPreview";
import AIPlattformsSection from "@/components/AIPlattformsSection";
import InteractiveMetrics from "@/components/InteractiveMetrics";
import DetailedFeaturesSection from "@/components/DetailedFeaturesSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <DashboardPreview />
        <AIPlattformsSection />
        <InteractiveMetrics />
        <DetailedFeaturesSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;