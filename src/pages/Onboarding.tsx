import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { resetOnboarding, completeOnboarding } from "@/store/slices/onboardingSlice";

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isCompleted } = useAppSelector((state) => state.onboarding);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication first
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/signup", { replace: true });
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  // If onboarding is already completed, redirect to dashboard to avoid blank screen
  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const isFresh = searchParams.get("fresh") === "1";
    if (isFresh) {
      // Force wizard open for fresh onboarding
      dispatch(resetOnboarding());
      return;
    }
    if (isCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [isCompleted, navigate, dispatch, searchParams, isAuthenticated, loading]);

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    dispatch(completeOnboarding());
    try {
      localStorage.setItem("aeorank_onboarding_completed", "true");
    } catch {}
    navigate("/dashboard", { replace: true });
  };

  const handleClose = () => {
    navigate("/signup", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center animate-pulse">
            <span className="text-background font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signup
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard
        isOpen={!isCompleted || searchParams.get("fresh") === "1"}
        onClose={handleClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Onboarding;