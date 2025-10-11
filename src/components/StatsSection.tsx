const StatsSection = () => {
  const stats = [
    {
      number: "10M+",
      label: "AI Queries Analyzed",
      description: "Monthly analysis across all platforms"
    },
    {
      number: "500+",
      label: "Brands Monitored",
      description: "Leading companies trust our platform"
    },
    {
      number: "95%",
      label: "Accuracy Rate",
      description: "Precise brand mention detection"
    },
    {
      number: "24/7",
      label: "Real-time Monitoring",
      description: "Continuous tracking and alerts"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by leading brands worldwide
          </h2>
          <p className="text-xl text-background/80 max-w-3xl mx-auto">
            Our platform processes millions of AI interactions daily to deliver actionable insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-background mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-medium text-background mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-background/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;