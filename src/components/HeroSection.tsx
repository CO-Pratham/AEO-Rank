import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentPlatform, setCurrentPlatform] = useState(0);
  const platforms = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-background py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-chart-1 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-chart-2 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-chart-3 rounded-full blur-xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Hiring Banner removed */}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Check Where You Stand in{" "}
            <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent inline-block min-w-[200px] text-left transition-all duration-500 ease-in-out">
              {platforms[currentPlatform]}
            </span>{" "}
            Searches
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Monitor your brand visibility across ChatGPT, Claude, Gemini, Grok, and Perplexity. Optimize your AI search presence with actionable insights.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <span className="inline-flex items-center space-x-2 bg-chart-1/10 border border-chart-1/20 px-4 py-2 rounded-full text-foreground font-medium animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
              <span>Visibility</span>
            </span>
            <span className="inline-flex items-center space-x-2 bg-chart-2/10 border border-chart-2/20 px-4 py-2 rounded-full text-foreground font-medium animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
              <span>Position</span>
            </span>
            <span className="inline-flex items-center space-x-2 bg-chart-3/10 border border-chart-3/20 px-4 py-2 rounded-full text-foreground font-medium animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
              <span>Sentiment</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg" 
              className="btn-solid-hero px-8 py-4 text-lg font-medium shadow-large hover:shadow-xl transition-all duration-200"
              onClick={() => window.location.href = '/demo'}
            >
              Get a Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="btn-outline-hero px-8 py-4 text-lg font-medium"
              onClick={() => window.location.href = '/signup'}
            >
              Start Free Trial
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '1s' }}>
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
              <span>500+ brands monitored</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;