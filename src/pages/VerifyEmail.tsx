import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

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
          console.log("Full verification response:", JSON.stringify(data, null, 2));

          // Try different possible token field names
          const possibleToken =
            data.accessToken || data.token || data.access_token || data.authToken;

          if (possibleToken) {
            localStorage.setItem("accessToken", possibleToken);
            console.log(
              "Token saved successfully:",
              possibleToken.substring(0, 20) + "..."
            );
          }

          toast({
            title: "Success",
            description: data.message || "Email verified successfully!",
          });

          // 👇 If user came via OAuth, skip brand check and go to onboarding
          if (isOAuth) {
            console.log("OAuth signup detected → redirecting to onboarding");
            try {
              localStorage.removeItem("aeorank_onboarding_completed");
              localStorage.removeItem("aeorank_onboarding_state");
            } catch {}
            navigate("/onboarding?fresh=1", { replace: true });
            return;
          }

          // Otherwise, check user onboarding status normally
          const checkUserStatus = async () => {
            try {
              const userResponse = await fetch(
                "https://aeotest-production.up.railway.app/user/brand",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${possibleToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                // If user has brand data, they've completed onboarding
                if (userData && (userData.brand_name || userData.name)) {
                  try {
                    localStorage.setItem("aeorank_onboarding_completed", "true");
                  } catch {}
                  navigate("/dashboard", { replace: true });
                } else {
                  // New user (no brand): ensure onboarding opens
                  try {
                    localStorage.removeItem("aeorank_onboarding_completed");
                    localStorage.removeItem("aeorank_onboarding_state");
                  } catch {}
                  navigate("/onboarding?fresh=1", { replace: true });
                }
              } else {
                // If no brand data exists, user needs onboarding
                try {
                  localStorage.removeItem("aeorank_onboarding_completed");
                  localStorage.removeItem("aeorank_onboarding_state");
                } catch {}
                navigate("/onboarding?fresh=1", { replace: true });
              }
            } catch (error) {
              console.error("Error checking user status:", error);
              // Default to onboarding if check fails
              try {
                localStorage.removeItem("aeorank_onboarding_completed");
                localStorage.removeItem("aeorank_onboarding_state");
              } catch {}
              navigate("/onboarding?fresh=1", { replace: true });
            }
          };

          if (possibleToken) {
            checkUserStatus();
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1>Verifying your account...</h1>
        <p className="text-gray-500">Please wait while we complete the process.</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
