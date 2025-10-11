import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-3xl p-12 border border-border">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to optimize your AI search presence?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of brands already using AEORank to track, analyze, and improve their performance across AI search platforms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 text-base font-medium"
              onClick={() => window.location.href = '/signup'}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background px-8 py-3 text-base font-medium"
              onClick={() => window.location.href = '/demo'}
            >
              Book a Demo
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;