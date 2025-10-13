import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getToken } from "@/utils/api";

const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing onboarding completion flag to allow fresh onboarding
    localStorage.removeItem("aeorank_onboarding_completed");
  }, []);

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    localStorage.setItem("aeorank_onboarding_completed", "true");
    navigate("/dashboard", { replace: true });
  };

  const handleClose = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard
        isOpen={isOpen}
        onClose={handleClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Onboarding;