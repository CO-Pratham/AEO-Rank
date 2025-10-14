import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { resetOnboarding, completeOnboarding } from "@/store/slices/onboardingSlice";

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isCompleted } = useAppSelector((state) => state.onboarding);

  // Do not reset onboarding on mount; persist current step instead

  // If onboarding is already completed, redirect to dashboard to avoid blank screen
  useEffect(() => {
    const isFresh = searchParams.get("fresh") === "1";
    if (isFresh) {
      // Force wizard open for fresh onboarding
      dispatch(resetOnboarding());
      return;
    }
    if (isCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [isCompleted, navigate, dispatch, searchParams]);

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