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
            baseurl: "https://aeo-rank.ai",
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
                  className="w-full border-2 border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-700 font-medium"
                  onClick={handleGoogleOAuth}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
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
                  className="w-full border-2 border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-700 font-medium"
                  onClick={handleGoogleOAuth}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
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
