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
          console.log("🎯 Email verification action from backend:", action);
          console.log("📋 Full verification data:", JSON.stringify(data, null, 2));

          // PRIMARY CHECK: Use action field from backend (most reliable)
          // Make comparison case-insensitive and trim whitespace
          const normalizedAction = (action || "").toString().toLowerCase().trim();
          console.log("🔍 Normalized action:", normalizedAction);

          if (normalizedAction === "login") {
            // Existing user login - go to dashboard
            console.log("✅ LOGIN action detected → Navigating to Dashboard");
            try {
              localStorage.setItem("aeorank_onboarding_completed", "true");
              dispatch(completeOnboarding());
            } catch (e) {
              console.error("Error setting onboarding complete:", e);
            }
            navigate("/dashboard", { replace: true });
            return; // STOP HERE - Don't run any fallback logic
          }
          
          if (normalizedAction === "signup") {
            // New user signup - go to onboarding
            console.log("✅ SIGNUP action detected → Navigating to Onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch (e) {
              console.error("Error clearing onboarding:", e);
            }
            navigate("/onboarding", { replace: true });
            return; // STOP HERE - Don't run any fallback logic
          }

          // SECONDARY CHECK: Check if backend explicitly says it's a new user
          if (data.isNewUser === true || data.new_user === true || data.newUser === true) {
            console.log("🆕 New user flag detected → Navigating to Onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding", { replace: true });
            return; // STOP HERE
          }

          // TERTIARY CHECK: OAuth special handling
          if (isOAuth) {
            console.log("🔗 OAuth signup detected → Navigating to Onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding", { replace: true });
            return; // STOP HERE
          }

          // FINAL FALLBACK: Check user status via API (only if no action field found)
          console.log("⚠️ No valid action field found, checking user status via API");
          const handleUserStatusCheck = async () => {
            if (!possibleToken) {
              console.log("❌ No token available → Onboarding");
              try {
                localStorage.removeItem("aeorank_onboarding_completed");
                localStorage.removeItem("aeorank_onboarding_state");
              } catch {}
              navigate("/onboarding", { replace: true });
              return;
            }

            console.log("🔍 Checking user status after email verification");
            const userStatus = await checkUserStatus(possibleToken);
            console.log("👤 User status result:", userStatus);

            // Check if user has brand_name specifically (indicates completed onboarding)
            const hasBrandSetup = userStatus.userData && (
              userStatus.userData.brand_name || 
              userStatus.userData.brandName
            );

            if (userStatus.exists && hasBrandSetup) {
              console.log("✅ Existing user with brand setup → Dashboard");
              try {
                localStorage.setItem("aeorank_onboarding_completed", "true");
                dispatch(completeOnboarding());
              } catch {}
              navigate("/dashboard", { replace: true });
            } else {
              console.log("🆕 New user or no brand setup → Onboarding");
              try {
                localStorage.removeItem("aeorank_onboarding_completed");
                localStorage.removeItem("aeorank_onboarding_state");
              } catch {}
              navigate("/onboarding", { replace: true });
            }
          };

          // Use await to ensure this completes
          await handleUserStatusCheck();
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
          <img src="/AEO-Rank.jpeg" alt="AEO Rank Logo" className="w-12 h-12 rounded-lg object-cover animate-pulse" />
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
