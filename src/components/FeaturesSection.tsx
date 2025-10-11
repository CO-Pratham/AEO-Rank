import { TrendingUp, Search, Target, BarChart3, Bell, Users } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Answer Engine Insights",
      description: "Deep analysis of how AI platforms interpret and respond to queries about your brand",
      color: "bg-chart-1/10 text-chart-1"
    },
    {
      icon: BarChart3,
      title: "Agent Analytics",
      description: "Track performance across different AI models and understand their unique characteristics",
      color: "bg-chart-2/10 text-chart-2"
    },
    {
      icon: TrendingUp,
      title: "Prompt Volumes",
      description: "Monitor trending topics and query volumes related to your industry and competitors",
      color: "bg-chart-3/10 text-chart-3"
    },
    {
      icon: Target,
      title: "Competitive Intelligence",
      description: "Compare your brand performance against competitors across all major AI platforms",
      color: "bg-chart-4/10 text-chart-4"
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Get notified instantly when your brand mentions change or new opportunities arise",
      color: "bg-chart-5/10 text-chart-5"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights and coordinate optimization efforts across your entire marketing team",
      color: "bg-chart-1/10 text-chart-1"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to optimize AI search performance
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools and insights to help your brand succeed in the era of AI-powered search
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-medium transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;