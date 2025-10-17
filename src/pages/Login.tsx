import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { checkUserStatus, testUserBrandAPI } from "@/utils/api";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { completeOnboarding } from "@/store/slices/onboardingSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const loginWithCredentials = async (
    email: string,
    password: string,
    isDemo = false
  ) => {
    setLoading(true);

    try {
      if (email === "demo@aeorank.com" && password === "demo123") {
        // Demo login - create demo token and user
        const demoToken = "demo_token_" + Date.now();
        localStorage.setItem("accessToken", demoToken);
        localStorage.setItem(
          "aeorank_user",
          JSON.stringify({
            email: "demo@aeorank.com",
            name: "Demo User",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          })
        );

        toast({
          title: "Login Successful",
          description: "Welcome back to AEORank!",
        });

        // Update Redux auth state
        dispatch(loginSuccess({ token: demoToken }));

        // For demo login, always set onboarding as completed and go to dashboard
        if (isDemo) {
          console.log("🎯 Demo login → Dashboard");
          localStorage.setItem("aeorank_onboarding_completed", "true");
          dispatch(completeOnboarding());
          navigate("/dashboard");
        } else {
          // Check user status for regular demo login
          console.log("🔍 Checking demo user status");
          await testUserBrandAPI(demoToken);
          const userStatus = await checkUserStatus(demoToken);
          console.log("👤 Demo user status:", userStatus);

          if (userStatus.hasCompletedOnboarding) {
            console.log("✅ Demo user has completed onboarding → Dashboard");
            localStorage.setItem("aeorank_onboarding_completed", "true");
            dispatch(completeOnboarding());
            navigate("/dashboard");
          } else {
            console.log("🆕 Demo user needs onboarding → Show wizard");
            setShowOnboarding(true);
          }
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Use demo@aeorank.com / demo123",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@aeorank.com");
    setPassword("demo123");
    loginWithCredentials("demo@aeorank.com", "demo123", true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(email, password);
  };

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    navigate("/dashboard");
  };



  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img src="/AEO-Rank.jpeg" alt="AEO Rank Logo" className="w-8 h-8 rounded-sm object-cover" />
              <span className="text-2xl font-bold text-foreground">
                AEORank
              </span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="demo@aeorank.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="demo123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={fillDemoCredentials}
                    disabled={loading}
                  >
                    Try Demo Account
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Demo Credentials:</strong>
                  <br />
                  Email: demo@aeorank.com
                  <br />
                  Password: demo123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default Login;
