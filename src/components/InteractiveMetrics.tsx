import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const InteractiveMetrics = () => {
  const [animatedValues, setAnimatedValues] = useState({
    visibility: 0,
    position: 0, 
    sentiment: 0
  });

  const targetValues = {
    visibility: 89.8,
    position: 92.4,
    sentiment: 85.2
  };

  const metrics = [
    {
      key: "visibility",
      title: "Brand Visibility",
      description: "How often your brand appears in AI responses",
      color: "chart-1",
      trend: "up",
      change: "+5.2%"
    },
    {
      key: "position", 
      title: "Average Position",
      description: "Your ranking position in AI recommendations",
      color: "chart-2", 
      trend: "up",
      change: "+2.8%"
    },
    {
      key: "sentiment",
      title: "Sentiment Score", 
      description: "Overall sentiment of AI responses about your brand",
      color: "chart-3",
      trend: "down", 
      change: "-1.2%"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(targetValues);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-chart-2" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Track the metrics that matter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your brand's performance with comprehensive analytics across all AI platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={metric.key}
              className="bg-card rounded-2xl p-8 border border-border shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-4 h-4 bg-${metric.color} rounded-full`}></div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-chart-2" : 
                    metric.trend === "down" ? "text-destructive" : 
                    "text-muted-foreground"
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-foreground mb-2 transition-all duration-1000 ease-out">
                  {animatedValues[metric.key as keyof typeof animatedValues].toFixed(1)}%
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {metric.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`bg-${metric.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${animatedValues[metric.key as keyof typeof animatedValues]}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Insights */}
        <div className="mt-16 bg-muted/30 rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">8+</div>
              <div className="text-sm text-muted-foreground">AI Platforms Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">10M+</div>
              <div className="text-sm text-muted-foreground">Queries Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Real-time Monitoring</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMetrics;