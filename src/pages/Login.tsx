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
import { saveToken } from "@/utils/api";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { completeOnboarding } from "@/store/slices/onboardingSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://aeotest-production.up.railway.app/send-verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            baseurl: "https://aeo-rank.ai",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📧 Full login response:", JSON.stringify(data, null, 2));

        if (data.accessToken) {
          console.log("🔑 Access token received, saving and navigating");
          saveToken(data.accessToken);

          // Update Redux auth state
          dispatch(loginSuccess({ token: data.accessToken }));

          // 🎯 Navigate based on action field from API response (same logic as signup)
          const action = data.action;
          console.log("🎯 Login action:", action);

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
            navigate("/onboarding");
            return;
          }

          // Fallback: If no action field, go to dashboard (assume existing user)
          console.log("⚠️ No action field found → Dashboard");
          localStorage.setItem("aeorank_onboarding_completed", "true");
          dispatch(completeOnboarding());
          navigate("/dashboard");
        } else {
          setVerificationSent(true);
          toast({
            title: "Verification Email Sent",
            description:
              "Please check your email and click the verification link.",
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

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img
                src="/AEO-Rank.jpeg"
                alt="AEO Rank Logo"
                className="w-8 h-8 rounded-sm object-cover"
              />
              <span className="text-2xl font-bold text-foreground">
                AEORank
              </span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Enter your email to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationSent ? (
                <div className="space-y-4">
                  <p className="text-center text-green-600">
                    Verification email sent! Check your inbox.
                  </p>
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
                      {loading ? "Sending..." : "Magic Link"}
                    </Button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;
