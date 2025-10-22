import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  ArrowRight 
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import {
  setSubscription,
  setUsage,
  setInvoices,
  setLoading,
} from "@/store/slices/billingSlice";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import chatgptIcon from "@/assets/logos/chatgpt-icon.svg";
import geminiIcon from "@/assets/logos/google-gemini-icon.svg";
import perplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import googleAiStudioIcon from "@/assets/logos/google-ai-studio-icon.svg";

interface Subscription {
  id: number;
  name: string;
  prompts: number;
  type: string;
  state: string;
  models: string[];
  quantity: number;
}

const SubscriptionPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subscription, usage, invoices, loading } = useSelector(
    (state: RootState) => state.billing
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      dispatch(setLoading(true));
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          console.log("No access token found, using default subscription data");
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
        console.error("Error fetching subscription data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchSubscriptionData();
  }, [dispatch]);

  const getModelIcon = (modelName: string) => {
    const modelIcons: { [key: string]: string } = {
      chatgpt: chatgptIcon,
      perplexity: perplexityIcon,
      gemini: geminiIcon,
      'ai-overview': googleAiStudioIcon,
      'ai-mode': googleAiStudioIcon,
    };
    
    return modelIcons[modelName.toLowerCase()] || chatgptIcon;
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'trial':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0';
      case 'active':
        return 'bg-green-100 text-green-700 hover:bg-green-100 border-0';
      case 'expired':
        return 'bg-red-100 text-red-700 hover:bg-red-100 border-0';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0';
      default:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-0';
    }
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

  if (loading) {
    return <LoadingScreen text="Loading subscription information..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/dashboard/billing'}
          className="h-9 px-4"
        >
          Manage Billing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{subscription.plan}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan === 'Enterprise' ? 'Custom Pricing' : `${formatCurrency(subscription.amount)}/${subscription.interval}`}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : subscription.status === 'trial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {subscription.status}
              </Badge>
            </div>
            
            {subscription.nextBillingDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Next billing: {formatDate(subscription.nextBillingDate)}
              </div>
            )}

            {subscription.paymentMethod && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                **** **** **** {subscription.paymentMethod.last4}
                <span className="text-muted-foreground">
                  ({subscription.paymentMethod.brand})
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard/billing'}
                className="flex-1"
              >
                Change Plan
              </Button>
              {subscription.status === 'active' && subscription.plan !== 'Free' && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscription.plan === 'Starter' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 1 brands monitored
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    1 AI platforms tracked
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Basic analytics dashboard
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Email alerts & support
                  </div>
                </>
              )}
              {subscription.plan === 'Professional' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 5 brands monitored
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    All 5+ AI platforms tracked
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 50 prompts
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced analytics & insights
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    API access & priority support
                  </div>
                </>
              )}
              {subscription.plan === 'Enterprise' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Unlimited brands monitored
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    All AI platforms + custom integrations
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom analytics & reporting
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    White-label options
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Dedicated account manager
                  </div>
                </>
              )}
              {subscription.plan === 'Free' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Basic AI search monitoring
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Limited competitors tracking
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Email support
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatDate(invoice.date)}</p>
                      <p className="text-xs text-muted-foreground">Invoice #{invoice.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(invoice.amount)}</p>
                      <Badge
                        variant="secondary"
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700 text-xs'
                            : 'bg-yellow-100 text-yellow-700 text-xs'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    {invoice.downloadUrl && (
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionPage;
