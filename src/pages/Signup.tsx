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
import { apiCall, saveToken, testUserBrandAPI, checkUserStatus } from "@/utils/api";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { completeOnboarding } from "@/store/slices/onboardingSlice";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://aeotest-production.up.railway.app/send-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          baseurl: "localhost:8080",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📧 Full signup response:", JSON.stringify(data, null, 2));

        if (data.accessToken) {
          console.log("🔑 Access token received, saving and checking user status");
          saveToken(data.accessToken);

          // Update Redux auth state
          dispatch(loginSuccess({ token: data.accessToken }));

          // 🎯 Navigate based on action field from API response
          const action = data.action;
          console.log("🎯 Signup action:", action);

          if (action === "login") {
            // Existing user login - go to dashboard
            console.log("✅ Login action detected → Dashboard");
            localStorage.setItem("aeorank_onboarding_completed", "true");
            dispatch(completeOnboarding());
            navigate("/dashboard");
            return;
          } else if (action === "signup") {
            // New user signup - go to onboarding
            console.log("🆕 Signup action detected → Onboarding");
            localStorage.removeItem("aeorank_onboarding_completed");
            localStorage.removeItem("aeorank_onboarding_state");
            navigate("/onboarding?fresh=1");
            return;
          }

          // Fallback: If no action field, use existing logic
          console.log("⚠️ No action field found, falling back to user status check");

          // Test the API first to see what we get
          await testUserBrandAPI(data.accessToken);

          // Check if user already exists and has completed onboarding
          const userStatus = await checkUserStatus(data.accessToken);

          console.log("👤 User status result:", userStatus);

          if (userStatus.exists && userStatus.hasCompletedOnboarding) {
            // Existing user with completed onboarding - go to dashboard
            console.log("✅ Existing user with completed onboarding → Dashboard");
            localStorage.setItem("aeorank_onboarding_completed", "true");
            dispatch(completeOnboarding());
            navigate("/dashboard");
            return;
          } else {
            // New user or user without completed onboarding - go to onboarding
            console.log("🆕 New user or incomplete onboarding → Onboarding");
            localStorage.removeItem("aeorank_onboarding_completed");
            localStorage.removeItem("aeorank_onboarding_state");
            navigate("/onboarding?fresh=1");
          }
        } else {
          setVerificationSent(true);
          toast({
            title: "Verification Email Sent",
            description: "Please check your email and click the verification link.",
          });
        }
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

  };

  const handleGoogleOAuth = () => {
    // Start Google OAuth via backend to avoid client_id on frontend
    const oauthUrl = `https://aeotest-production.up.railway.app/oauth/google`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background font-bold text-sm">A</span>
            </div>
            <span className="text-2xl font-bold text-foreground">AEORank</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to AEORank</CardTitle>
            <CardDescription>Enter your email to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {verificationSent ? (
              <div className="space-y-4">
                <p className="text-center text-green-600">
                  Verification email sent! Check your inbox.
                </p>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleOAuth}>
                  Continue with Google
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Get Started"}
                  </Button>
                </form>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleOAuth}>
                  Continue with Google
                </Button>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
