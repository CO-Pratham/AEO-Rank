import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveToken } from "@/utils/api";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

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
        console.log('Verification response:', data);
        
        if (res.ok) {
            console.log('Full verification response:', JSON.stringify(data, null, 2));
            
            // Try different possible token field names
            const possibleToken = data.accessToken || data.token || data.access_token || data.authToken;
            
            if (possibleToken) {
              localStorage.setItem("accessToken", possibleToken);
              console.log("Token saved successfully:", possibleToken.substring(0, 20) + "...");
            }
          
          toast({
            title: "Success",
            description: data.message || "Email verified successfully!",
          });
          
          // Check if user already exists from API response
          if (data.isExistingUser || data.hasCompletedOnboarding) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/onboarding", { replace: true });
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

  const checkToken = () => {
    console.log('=== TOKEN CHECK START ===');
    const token = localStorage.getItem("accessToken");
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN FOUND');
    console.log('Full token:', token);
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All localStorage:', localStorage);
    console.log('=== TOKEN CHECK END ===');
    
    // Also show alert for immediate feedback
    alert(`Token exists: ${!!token}\nToken preview: ${token ? token.substring(0, 50) + '...' : 'NO TOKEN'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1>Verifying your email...</h1>
      </div>
    </div>
  );
};

export default VerifyEmail;
