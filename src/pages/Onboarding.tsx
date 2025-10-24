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
    
    // Only redirect if onboarding was completed in a previous session
    // Don't redirect if we just completed it in this session
    if (isCompleted && !searchParams.get("justCompleted")) {
      navigate("/dashboard", { replace: true });
    }
  }, [isCompleted, navigate, dispatch, searchParams, isAuthenticated, loading]);

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    
    // Set completion flag
    dispatch(completeOnboarding());
    
    // Navigate to dashboard immediately
    navigate("/dashboard", { replace: true });
  };

  const handleClose = () => {
    navigate("/signup", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <img src="/AEO-Rank.jpeg" alt="AEO Rank Logo" className="w-10 h-10 rounded object-cover animate-pulse" />
          <span className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signup
  }

  return (
    <OnboardingWizard
      isOpen={!isCompleted || searchParams.get("fresh") === "1"}
      onClose={handleClose}
      onComplete={handleOnboardingComplete}
    />
  );
};

export default Onboarding;