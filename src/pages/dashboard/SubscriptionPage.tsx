import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        // ====== BACKEND ENDPOINT ======
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/subscriptions');
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // API not implemented yet, show empty state
          setSubscriptions([]);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const data = await response.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        // If API is not available, show empty state instead of error
        console.log('API not available, showing empty state:', err);
        setSubscriptions([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

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

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Crown className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Subscription</h1>
      </div>

      {/* Subscription Card */}
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading subscriptions...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">Error: {error}</div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-6">
              <div className="text-center">
                <Crown className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No active subscription
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You don't have any active subscriptions yet
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      Subscription
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      State
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      Models
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      Quantity
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">
                      Prompts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {subscription.name} • {subscription.prompts} Prompts
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {subscription.type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium px-2 py-1 ${getStateColor(
                            subscription.state
                          )}`}
                        >
                          {subscription.state}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {subscription.models.map((model, index) => (
                            <img
                              key={index}
                              src={getModelIcon(model)}
                              alt={model}
                              className="w-5 h-5"
                              title={model}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {subscription.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {subscription.prompts}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
