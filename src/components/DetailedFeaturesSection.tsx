import { Button } from "@/components/ui/button";
import aeoRankWorkflowImage from "@/assets/aeorank-workflow-section.png";

const DetailedFeaturesSection = () => {
  return (
    <>
      {/* AEORank Style Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Turn AI search insights into new customers with AEORank
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Identify the prompts that matter, monitor your rankings, and act before your competitors do.
            </p>
          </div>

          {/* Use actual AEORank workflow screenshot */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <img
              src={aeoRankWorkflowImage}
              alt="AEORank workflow showing Set up Prompts, Use Data to Pick Winners, Add Competitors, and Choose AI Models"
              className="w-full h-auto rounded-2xl shadow-large"
              loading="lazy"
            />
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg font-medium shadow-medium hover:shadow-large transition-all duration-200"
              onClick={() => window.location.href = '/signup'}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default DetailedFeaturesSection;