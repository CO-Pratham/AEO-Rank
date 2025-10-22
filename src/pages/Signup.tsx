import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const Signup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Handle email pre-filling and verification success messages
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const verifiedParam = searchParams.get("verified");
    const invitationParam = searchParams.get("invitation");

    // Pre-fill email from query parameters
    if (emailParam) {
      setEmail(emailParam);
    }

    // Show success message if user just verified their email
    if (verifiedParam === "true") {
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully.",
      });

      // If this is an invitation, show a special message
      if (invitationParam === "true") {
        toast({
          title: "Invitation Accepted",
          description:
            "You've been successfully added to the team. Please complete your registration.",
        });
      }
    }
  }, [searchParams, toast]);

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
            baseurl: "https://aeo-frontend-main-branch-main.vercel.app",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📧 Full signup response:", JSON.stringify(data, null, 2));

        if (data.accessToken) {
          console.log("🔑 Access token received, saving and navigating");
          saveToken(data.accessToken);

          // Update Redux auth state
          dispatch(loginSuccess({ token: data.accessToken }));

          // 🎯 Navigate based on action field from API response (same logic as OAuth)
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
            <img
              src="/AEO-Rank.jpeg"
              alt="AEO Rank Logo"
              className="w-8 h-8 rounded-sm object-cover"
            />
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
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleOAuth}
                >
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
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleOAuth}
                >
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
