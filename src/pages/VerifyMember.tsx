import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/hooks/redux";
import { loginSuccess } from "@/store/slices/authSlice";

const VerifyMember = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // Validate required parameters
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Verification token missing.",
        variant: "destructive",
      });
      navigate("/signup");
      return;
    }

    // Call backend to verify invited member using the correct endpoint
    // Email parameter is optional - backend should be able to verify with just token
    const url = `https://aeotest-production.up.railway.app/user/verify/member?token=${token}${
      email ? `&email=${encodeURIComponent(email)}` : ""
    }`;

    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
        console.log("Member verification response:", data);

        if (res.ok) {
          toast({
            title: "Success",
            description: data.message || "Invitation verified successfully!",
          });

          // If the backend provides an access token, this means the invited user
          // should be logged in directly to the inviter's account
          if (data.accessToken) {
            // Log in the user with the provided access token
            localStorage.setItem("accessToken", data.accessToken);
            dispatch(loginSuccess({ token: data.accessToken }));

            // Navigate directly to the dashboard with the inviter's data
            navigate("/dashboard");
          } else {
            // If no access token, redirect to signup but indicate this is an invitation
            const userEmail = email || data.email || "";
            const signupParams = new URLSearchParams();
            if (userEmail) {
              signupParams.set("email", userEmail);
            }
            signupParams.set("verified", "true");
            signupParams.set("invitation", "true");

            navigate(`/signup?${signupParams.toString()}`);
          }
        } else {
          toast({
            title: "Verification Failed",
            description: data.message || "Invalid or expired invitation.",
            variant: "destructive",
          });
          navigate("/signup");
        }
      })
      .catch((error) => {
        console.error("Verification error:", error);
        toast({
          title: "Network Error",
          description: "Please try again.",
          variant: "destructive",
        });
        navigate("/signup");
      });
  }, [navigate, searchParams, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <img
            src="/AEO-Rank.jpeg"
            alt="AEO Rank Logo"
            className="w-12 h-12 rounded-lg object-cover animate-pulse"
          />
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-foreground rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-foreground rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Verifying your invitation...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify your invitation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyMember;
