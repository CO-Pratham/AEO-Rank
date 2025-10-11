import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "$20",
      period: "/month",
      description:
        "Perfect for small teams getting started with AI search optimization",
      features: [
        "Up to 1 brands monitored",
        "1 AI platforms tracked",
        "Basic analytics dashboard",
        "Email alerts",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description:
        "Comprehensive solution for growing businesses and marketing teams",
      features: [
        "Up to 5 brands monitored",
        "All 5+ AI platforms tracked",
        "Upto 50 prompts",
        "Advanced analytics & insights",
        "Real-time alerts",
        "Competitor analysis",
        "API access",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description:
        "Tailored solution for large organizations with specific requirements",
      features: [
        "Unlimited brands monitored",
        "All AI platforms + custom integrations",
        "Custom analytics & reporting",
        "White-label options",
        "Dedicated account manager",
        "SLA guarantees",
        "Custom training & onboarding",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose the right plan for your business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with our free trial and scale as your AI search optimization
            needs grow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-background rounded-2xl border-2 transition-all duration-200 animate-fade-in-up ${
                plan.popular
                  ? "border-foreground shadow-large"
                  : "border-border hover:border-muted-foreground shadow-soft hover:shadow-medium"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 ${
                  plan.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
                onClick={() => (window.location.href = "/signup")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include 14-day free trial • No credit card required •
            Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
