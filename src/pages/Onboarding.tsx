import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("aeorank_user");
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if onboarding is already completed
    const onboardingCompleted = localStorage.getItem("aeorank_onboarding_completed");
    if (onboardingCompleted) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completed with data:", data);
    navigate("/dashboard");
  };

  const handleClose = () => {
    navigate("/dashboard");
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