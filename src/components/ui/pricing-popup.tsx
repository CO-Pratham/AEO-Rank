import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import ChatGPTIcon from "@/assets/logos/chatgpt-icon.svg";
import ClaudeIcon from "@/assets/logos/claude-ai-icon.svg";
import GeminiIcon from "@/assets/logos/google-gemini-icon.svg";
import PerplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";

interface PricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingPopup = ({ isOpen, onClose }: PricingPopupProps) => {
  const plans = [
    {
      name: "Starter",
      price: "$20",
      period: "/month",
      description: "Perfect for small teams getting started with AI search optimization",
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
      description: "Comprehensive solution for growing businesses and marketing teams",
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
      description: "Tailored solution for large organizations with specific requirements",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 gap-0 [&>button]:top-6 [&>button]:right-6 [&>button]:hover:bg-gray-100 [&>button]:rounded-md [&>button]:transition-colors">
        <div className="relative bg-white overflow-y-auto max-h-[90vh]">
          {/* Pricing Cards */}
          <div className="px-8 py-8 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 p-6 flex flex-col bg-white ${
                    plan.popular
                      ? "border-gray-900 shadow-xl"
                      : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-600 text-sm">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? "bg-black hover:bg-black/90 text-white"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (plan.cta === "Start Free Trial") {
                        window.location.href = "mailto:support@aeorank.ai?subject=Start Free Trial";
                      } else {
                        window.location.href = "mailto:support@aeorank.ai?subject=Enterprise Contact";
                      }
                    }}
                  >
                    {plan.cta} →
                  </Button>

                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Note */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-lg">
                <span className="text-gray-900 font-medium">+</span>
                <span>Add Gemini, AI Mode, Claude, DeepSeek, Llama, Grok and more for an additional fee.</span>
                <div className="flex items-center gap-1">
                  <img src={GeminiIcon} alt="" className="w-4 h-4" />
                  <img src={ClaudeIcon} alt="" className="w-4 h-4" />
                  <img src={ChatGPTIcon} alt="" className="w-4 h-4" />
                  <img src={PerplexityIcon} alt="" className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

