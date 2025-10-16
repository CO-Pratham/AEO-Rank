import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { checkUserStatus } from "@/utils/api";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { completeOnboarding } from "@/store/slices/onboardingSlice";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  useEffect(() => {
    const token = searchParams.get("token");
    const isOAuth = searchParams.get("oauth") === "true"; // 👈 detect OAuth redirect

    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Verification token missing.",
        variant: "destructive",
      });
      navigate("/signup");
      return;
    }

    // Call backend to verify token
    fetch(`https://aeotest-production.up.railway.app/verify?token=${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const data = await res.json();
        console.log("Verification response:", data);

        if (res.ok) {
          console.log("📧 Full verification response:", JSON.stringify(data, null, 2));

          // Try different possible token field names
          const possibleToken =
            data.accessToken || data.token || data.access_token || data.authToken;

          if (possibleToken) {
            localStorage.setItem("accessToken", possibleToken);
            console.log(
              "🔑 Token saved successfully:",
              possibleToken.substring(0, 20) + "..."
            );

            // Update Redux auth state
            dispatch(loginSuccess({ token: possibleToken }));
          }

          toast({
            title: "Success",
            description: data.message || "Email verified successfully!",
          });

          // 🎯 Navigate based on action field from API response
          const action = data.action;
          console.log("🎯 Email verification action:", action);

          if (action === "login") {
            // Existing user login - go to dashboard
            console.log("✅ Login action detected → Dashboard");
            try {
              localStorage.setItem("aeorank_onboarding_completed", "true");
              dispatch(completeOnboarding());
            } catch {}
            navigate("/dashboard", { replace: true });
            return;
          } else if (action === "signup") {
            // New user signup - go to onboarding
            console.log("🆕 Signup action detected → Onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding?fresh=1", { replace: true });
            return;
          }

          // 👇 Fallback: If no action field or OAuth, use existing logic
          if (isOAuth) {
            console.log("🔗 OAuth signup detected → redirecting to onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding?fresh=1", { replace: true });
            return;
          }

          // Fallback: If no action field, check user status (legacy support)
          console.log("⚠️ No action field found, falling back to user status check");
          const handleUserStatusCheck = async () => {
            console.log("🔍 Checking user status after email verification");
            const userStatus = await checkUserStatus(possibleToken);

            console.log("👤 User status result:", userStatus);

            if (userStatus.exists && userStatus.hasCompletedOnboarding) {
              // Existing user with completed onboarding - go to dashboard
              console.log("✅ Existing user with completed onboarding → Dashboard");
              try {
                localStorage.setItem("aeorank_onboarding_completed", "true");
                dispatch(completeOnboarding());
              } catch {}
              navigate("/dashboard", { replace: true });
            } else {
              // New user or user without completed onboarding - go to onboarding
              console.log("🆕 New user or incomplete onboarding → Onboarding");
              try {
                localStorage.removeItem("aeorank_onboarding_completed");
                localStorage.removeItem("aeorank_onboarding_state");
              } catch {}
              navigate("/onboarding?fresh=1", { replace: true });
            }
          };

          if (possibleToken) {
            handleUserStatusCheck();
          } else {
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding?fresh=1", { replace: true });
          }
        } else {
          toast({
            title: "Verification Failed",
            description: data.message || "Invalid or expired token.",
            variant: "destructive",
          });
          navigate("/signup");
        }
      })
      .catch(() => {
        toast({
          title: "Network Error",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-background font-bold text-xl">A</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verifying your account...</h1>
          <p className="text-muted-foreground">Please wait while we complete the verification process.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
