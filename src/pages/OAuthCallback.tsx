import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const action = params.get("action");

    console.log("🔍 OAuthCallback params:", { token: token ? "present" : "missing", email, action });

    if (token) {
      localStorage.setItem("accessToken", token);
      if (email) {
        localStorage.setItem("aeorank_user", email);
      }
      
      // Normalize action for comparison
      const normalizedAction = (action || "").toLowerCase().trim();
      console.log("🎯 OAuth action (normalized):", normalizedAction);
      
      // Check for signup actions
      if (normalizedAction === "oauth_signup" || normalizedAction === "signup") {
        console.log("✅ OAuth SIGNUP detected → Onboarding");
        localStorage.removeItem("aeorank_onboarding_completed");
        localStorage.removeItem("aeorank_onboarding_state");
        navigate("/onboarding");
      } 
      // Check for login actions  
      else if (normalizedAction === "oauth_login" || normalizedAction === "login") {
        console.log("✅ OAuth LOGIN detected → Dashboard");
        localStorage.setItem("aeorank_onboarding_completed", "true");
        navigate("/dashboard");
      }
      // Default fallback (treat as login if no clear signup indicator)
      else {
        console.log("⚠️ No clear action, defaulting to Dashboard");
        navigate("/dashboard");
      }
    } else {
      console.error("❌ OAuth callback failed: No token received");
      setError("Google login failed. Please try again.");
    }
  }, [navigate]);


  const handleGoLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      {!error ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">Signing you in with Google...</h2>
          <p className="text-gray-500">Please wait while we complete your login.</p>
          <div className="mt-10 w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Login Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleGoLogin}
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;