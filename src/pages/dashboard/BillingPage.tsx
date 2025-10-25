import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChatGPTIcon from "@/assets/logos/chatgpt-icon.svg";
import ClaudeIcon from "@/assets/logos/claude-ai-icon.svg";
import GeminiIcon from "@/assets/logos/google-gemini-icon.svg";
import PerplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  Crown,
  Zap,
  Star,
  ArrowRight,
  AlertCircle,
  CreditCardIcon,
  Receipt,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import {
  setSubscription,
  setUsage,
  setInvoices,
  updatePaymentMethod,
  changePlan,
  cancelSubscription,
  setLoading,
} from "@/store/slices/billingSlice";
import { LoadingScreen } from "@/components/ui/loading-spinner";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  limits: {
    prompts: number;
    competitors: number;
    apiCalls: number;
  };
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const BillingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subscription, usage, invoices, loading } = useSelector(
    (state: RootState) => state.billing
  );
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Pricing plans - Updated to match exactly with PricingSection.tsx
  const pricingPlans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: 20,
      interval: "month",
      description: "Perfect for small teams getting started with AI search optimization",
      features: [
        "Up to 1 brands monitored",
        "1 AI platforms tracked",
        "Basic analytics dashboard",
        "Email alerts",
        "Email support",
      ],
      limits: {
        prompts: 10,
        competitors: 3,
        apiCalls: 1000,
      },
      icon: <Zap className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "professional",
      name: "Professional",
      price: 99,
      interval: "month",
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
      limits: {
        prompts: 50,
        competitors: 25,
        apiCalls: 10000,
      },
      popular: true,
      icon: <Star className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 0, // Custom pricing
      interval: "custom",
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
      limits: {
        prompts: -1, // Unlimited
        competitors: -1, // Unlimited
        apiCalls: -1, // Unlimited
      },
      icon: <Crown className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      dispatch(setLoading(true));
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          console.log("No access token found, using default billing data");
          dispatch(setLoading(false));
          return;
        }
        
        // Fetch subscription data
        try {
          const subscriptionResponse = await fetch(
            "https://aeotest-production.up.railway.app/user/subscription",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            dispatch(setSubscription(subscriptionData));
          } else {
            console.log("Subscription API not available, using default data");
          }
        } catch (err) {
          console.log("Subscription API error:", err);
        }

        // Fetch usage data
        try {
          const usageResponse = await fetch(
            "https://aeotest-production.up.railway.app/user/usage",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            dispatch(setUsage(usageData));
          } else {
            console.log("Usage API not available, using default data");
          }
        } catch (err) {
          console.log("Usage API error:", err);
        }

        // Fetch invoices
        try {
          const invoicesResponse = await fetch(
            "https://aeotest-production.up.railway.app/user/invoices",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (invoicesResponse.ok) {
            const invoicesData = await invoicesResponse.json();
            dispatch(setInvoices(invoicesData));
          } else {
            console.log("Invoices API not available, using default data");
          }
        } catch (err) {
          console.log("Invoices API error:", err);
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchBillingData();
  }, [dispatch]);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    
    // Handle Enterprise plan differently
    if (selectedPlan === 'enterprise') {
      window.open('mailto:sales@yourcompany.com?subject=Enterprise Plan Inquiry', '_blank');
      setShowUpgradeDialog(false);
      setSelectedPlan(null);
      return;
    }
    
    try {
      const token = localStorage.getItem("accessToken");
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      
      if (!plan) return;

      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/subscription/upgrade",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            interval: plan.interval,
          }),
        }
      );

      if (response.ok) {
        dispatch(changePlan({ plan: plan.name, amount: plan.price }));
        setShowUpgradeDialog(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/subscription/cancel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        dispatch(cancelSubscription());
        setShowCancelDialog(false);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  const getCurrentPlan = () => {
    return pricingPlans.find(plan => 
      plan.name.toLowerCase() === subscription.plan.toLowerCase()
    ) || pricingPlans[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  console.log("BillingPage render - loading:", loading, "subscription:", subscription, "usage:", usage);

  if (loading) {
    return <LoadingScreen text="Loading billing information..." />;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Billing & Plans</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPaymentDialog(true)}
          className="h-9 px-4"
        >
          <CreditCardIcon className="w-4 h-4 mr-2" />
          Manage Payment
        </Button>
      </div>


      {/* Pricing Plans */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => {
            const isCurrentPlan = plan.name === subscription.plan;
            const isUpgrade = plan.price > subscription.amount;
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col bg-white ${
                  plan.popular
                    ? "border-gray-900 shadow-xl"
                    : isCurrentPlan 
                      ? "border-blue-500 shadow-lg"
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

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.id === 'enterprise' ? 'Custom' : formatCurrency(plan.price)}
                    </span>
                    {plan.id !== 'enterprise' && (
                      <span className="text-gray-600 text-sm">/{plan.interval}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full mb-6 ${
                    isCurrentPlan
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                      : plan.popular
                        ? "bg-black hover:bg-black/90 text-white"
                        : "border-gray-300 hover:bg-gray-50"
                  }`}
                  disabled={isCurrentPlan}
                  onClick={() => {
                    if (isCurrentPlan) return;
                    
                    if (plan.id === 'enterprise') {
                      window.open('mailto:support@aeorank.ai?subject=Enterprise Contact', '_blank');
                    } else if (isUpgrade) {
                      handleUpgrade(plan.id);
                    } else {
                      handleUpgrade(plan.id);
                    }
                  }}
                >
                  {isCurrentPlan ? (
                    "Current Plan"
                  ) : plan.id === 'enterprise' ? (
                    "Contact Sales →"
                  ) : isUpgrade ? (
                    "Upgrade Now →"
                  ) : (
                    "Change Plan →"
                  )}
                </Button>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.downloadUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {selectedPlan === 'enterprise' ? 'Contact Sales' : 'Upgrade Plan'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedPlan === 'enterprise' 
                ? 'Get a custom quote for your enterprise requirements'
                : `Upgrade to ${pricingPlans.find(p => p.id === selectedPlan)?.name} plan`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6 py-6">
              {/* Plan Overview */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    {pricingPlans.find(p => p.id === selectedPlan)?.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pricingPlans.find(p => p.id === selectedPlan)?.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-gray-900">
                        {selectedPlan === 'enterprise' 
                          ? 'Custom Pricing'
                          : formatCurrency(pricingPlans.find(p => p.id === selectedPlan)?.price || 0)
                        }
                      </span>
                      {selectedPlan !== 'enterprise' && (
                        <span className="text-gray-600">
                          /{pricingPlans.find(p => p.id === selectedPlan)?.interval}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {pricingPlans.find(p => p.id === selectedPlan)?.description}
                </p>
              </div>

              {/* Current Plan Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Current Plan</span>
                </div>
                <p className="text-sm text-gray-600">
                  You're currently on the <span className="font-medium">{subscription.plan}</span> plan.
                  {selectedPlan === 'enterprise' 
                    ? ' Contact sales to discuss enterprise options.'
                    : ` Upgrade to ${pricingPlans.find(p => p.id === selectedPlan)?.name} for additional features.`
                  }
                </p>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Plan Features
                </h4>
                <div className="space-y-3">
                  {pricingPlans.find(p => p.id === selectedPlan)?.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1 h-10 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmUpgrade}
                  className={`flex-1 h-10 text-sm font-medium ${
                    selectedPlan === 'enterprise'
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {selectedPlan === 'enterprise' ? (
                    'Contact Sales'
                  ) : (
                    'Confirm Upgrade'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md mx-auto">
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-lg -m-6"></div>
            
            <DialogHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Cancel Subscription
                </DialogTitle>
              </div>
              <DialogDescription className="text-base text-gray-600 leading-relaxed">
                ⚠️ Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg">
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 mb-3">What you'll lose:</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Premium analytics and insights
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Advanced competitor tracking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Priority customer support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    API access and integrations
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(false)}
                  className="px-6 py-2 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  className="px-8 py-2 font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Cancel Subscription
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Payment Method</DialogTitle>
            <DialogDescription>
              Update your payment information and billing details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Payment method management will be implemented with your payment provider integration.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;
