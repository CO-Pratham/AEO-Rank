import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const features = [
    {
      category: "Core Features",
      items: [
        {
          name: "AI Search Monitoring",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Visibility Tracking",
          starter: "1 brands",
          pro: "5 brands",
          enterprise: "Unlimited",
        },
        {
          name: "Position Analysis",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Sentiment Monitoring",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Competitor Tracking",
          starter: "3 competitors",
          pro: "25 competitors",
          enterprise: "Unlimited",
        },
        {
          name: "Custom Prompts",
          starter: "10/month",
          pro: "50/month",
          enterprise: "Unlimited",
        },
        { name: "Data Export", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Analytics & Reporting",
      items: [
        {
          name: "Real-time Dashboard",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Historical Data",
          starter: "30 days",
          pro: "1 year",
          enterprise: "Unlimited",
        },
        { name: "Custom Reports", starter: false, pro: true, enterprise: true },
        {
          name: "API Access",
          starter: false,
          pro: "Limited",
          enterprise: "Full",
        },
        {
          name: "White-label Reports",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "AI Platforms",
      items: [
        { name: "ChatGPT", starter: true, pro: true, enterprise: true },
        { name: "Claude", starter: true, pro: true, enterprise: true },
        { name: "Gemini", starter: true, pro: true, enterprise: true },
        { name: "Perplexity", starter: false, pro: true, enterprise: true },
        {
          name: "Custom AI Models",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support & Training",
      items: [
        { name: "Email Support", starter: true, pro: true, enterprise: true },
        {
          name: "Priority Support",
          starter: false,
          pro: true,
          enterprise: true,
        },
        { name: "Phone Support", starter: false, pro: false, enterprise: true },
        {
          name: "Dedicated Account Manager",
          starter: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "Custom Training",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      );
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your AI search optimization needs.
              Start free and scale as you grow.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <PricingSection />

        {/* Feature Comparison */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Compare All Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get a detailed breakdown of what's included in each plan
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Features</th>
                        <th className="text-center p-4 font-medium">Starter</th>
                        <th className="text-center p-4 font-medium">
                          Professional
                        </th>
                        <th className="text-center p-4 font-medium">
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((category) => (
                        <>
                          <tr key={category.category} className="bg-muted/50">
                            <td
                              colSpan={4}
                              className="p-4 font-semibold text-sm uppercase tracking-wide"
                            >
                              {category.category}
                            </td>
                          </tr>
                          {category.items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-4">{item.name}</td>
                              <td className="p-4 text-center">
                                {renderFeatureValue(item.starter)}
                              </td>
                              <td className="p-4 text-center">
                                {renderFeatureValue(item.pro)}
                              </td>
                              <td className="p-4 text-center">
                                {renderFeatureValue(item.enterprise)}
                              </td>
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
                },
                {
                  q: "Do you offer custom pricing?",
                  a: "Yes, we offer custom pricing for large teams and specialized requirements. Contact our sales team.",
                },
                {
                  q: "What happens to my data if I cancel?",
                  a: "You can export your data anytime. After cancellation, data is retained for 30 days before deletion.",
                },
                {
                  q: "Is there an API available?",
                  a: "Yes, API access is available on Professional and Enterprise plans with different rate limits.",
                },
              ].map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of brands already optimizing their AI search
              presence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/signup">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/demo">Book a Demo</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
