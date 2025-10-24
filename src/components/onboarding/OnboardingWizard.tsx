import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Check, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateOnboardingData, setCurrentStep } from "@/store/slices/onboardingSlice";
import { setBrand } from "@/store/slices/userSlice";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  brandName: string;
  brandWebsite: string;
  defaultLocation: string;
  competitors: string[];
  prompts: string[];
}

const OnboardingWizard = ({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps) => {
  const dispatch = useAppDispatch();
  const { data: formData, currentStep } = useAppSelector((state) => state.onboarding);
  const [tempInput, setTempInput] = useState("");
  const [tempCompetitorName, setTempCompetitorName] = useState("");
  const [tempCompetitorDomain, setTempCompetitorDomain] = useState("");
  const [suggestedCompetitorsList, setSuggestedCompetitorsList] = useState<
    Array<{ name: string; url?: string }>
  >([]);
  const [suggestedPromptsList, setSuggestedPromptsList] = useState<string[]>(
    []
  );
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isProcessingNext, setIsProcessingNext] = useState(false);
  const [hasUserNavigatedToStep2, setHasUserNavigatedToStep2] = useState(false);
  const [hasUserNavigatedToStep3, setHasUserNavigatedToStep3] = useState(false);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const defaultLocations = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "India",
  ];

  // Helper function to get country flag
  const getCountryFlag = (country: string) => {
    const flagMap: Record<string, string> = {
      "United States": "🇺🇸",
      "United Kingdom": "🇬🇧",
      "Canada": "🇨🇦",
      "Australia": "🇦🇺",
      "Germany": "🇩🇪",
      "India": "🇮🇳",
    };
    return flagMap[country] || "🇺🇸";
  };



  // Initialize navigation flags based on current step when component mounts
  useEffect(() => {
    if (currentStep >= 2) {
      setHasUserNavigatedToStep2(true);
    }
    if (currentStep >= 3) {
      setHasUserNavigatedToStep3(true);
    }
  }, []); // Only run on mount

  // Track when user navigates to each step
  useEffect(() => {
    if (currentStep === 2 && !hasUserNavigatedToStep2) {
      setHasUserNavigatedToStep2(true);
    }
    if (currentStep === 3 && !hasUserNavigatedToStep3) {
      setHasUserNavigatedToStep3(true);
    }
  }, [currentStep, hasUserNavigatedToStep2, hasUserNavigatedToStep3]);

  // Fetch suggested competitors using brand name and domain
  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      if (currentStep !== 2 || !hasUserNavigatedToStep2 || suggestedCompetitorsList.length > 0) return;
      if (!formData.brandName || !formData.brandWebsite) return;

      setLoadingCompetitors(true);
      try {
        const response = await apiCall("/competitor/generate", {
          method: "POST",
          body: JSON.stringify({
            brand_name: formData.brandName,
            domain: formData.brandWebsite,
            country: formData.defaultLocation,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch competitors: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const competitors = data
            .map((comp: { name?: string; brand?: string; competitor?: string; url?: string; domain?: string; website?: string }) => {
              const name = comp?.name || comp?.brand || comp?.competitor || "";
              const url = comp?.url || comp?.domain || comp?.website || "";
              return name ? { name, url: url || undefined } : null;
            })
            .filter((comp) => comp !== null) as Array<{ name: string; url?: string }>;
          setSuggestedCompetitorsList(competitors);
        } else if (data && data.competitors && Array.isArray(data.competitors)) {
          const competitors = data.competitors
            .map((comp: { name?: string; brand?: string; competitor?: string; url?: string; domain?: string; website?: string }) => {
              const name = comp?.name || comp?.brand || comp?.competitor || "";
              const url = comp?.url || comp?.domain || comp?.website || "";
              return name ? { name, url: url || undefined } : null;
            })
            .filter((comp) => comp !== null) as Array<{ name: string; url?: string }>;
          setSuggestedCompetitorsList(competitors);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching suggested competitors:", error);
        toast({
          title: "Could not load suggested competitors",
          description: "You can still add competitors manually.",
          variant: "destructive",
        });
        setSuggestedCompetitorsList([]);
      } finally {
        setLoadingCompetitors(false);
      }
    };

    if (isOpen && currentStep === 2 && hasUserNavigatedToStep2) {
      fetchSuggestedCompetitors();
    }
  }, [isOpen, currentStep, hasUserNavigatedToStep2, suggestedCompetitorsList.length, toast, formData.brandName, formData.brandWebsite]);

  // Fetch suggested prompts
  useEffect(() => {
    const fetchSuggestedPrompts = async () => {
      if (currentStep !== 3 || !hasUserNavigatedToStep3 || !formData.brandWebsite) return;

      setLoadingPrompts(true);
      try {
        console.log('=== PROMPTS API CALL ===');
        console.log('Domain:', formData.brandWebsite);
        console.log('User has navigated to step 3:', hasUserNavigatedToStep3);

        const response = await apiCall(`/prompts/generate`, {
          method: "POST",
          body: JSON.stringify({
            domain: formData.brandWebsite
          })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch prompts: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));

        if (data && data.prompts && Array.isArray(data.prompts)) {
          const promptTexts = data.prompts.map(
            (item: { prompt: string }) => item.prompt
          );
          console.log('Extracted prompts:', promptTexts);
          setSuggestedPromptsList(promptTexts);
        } else if (data && Array.isArray(data)) {
          const promptTexts = data.map(
            (item: { prompt: string }) => item.prompt
          );
          console.log('Extracted prompts from array:', promptTexts);
          setSuggestedPromptsList(promptTexts);
        } else {
          console.log('No prompts found in response');
          setSuggestedPromptsList([]);
        }
      } catch (error) {
        console.error("Error fetching suggested prompts:", error);
        toast({
          title: "Could not load suggested prompts",
          description: "You can still add prompts manually.",
          variant: "destructive",
        });
        setSuggestedPromptsList([]);
      } finally {
        setLoadingPrompts(false);
      }
    };

    if (isOpen && currentStep === 3 && hasUserNavigatedToStep3 && formData.brandWebsite) {
      fetchSuggestedPrompts();
    }
  }, [isOpen, currentStep, hasUserNavigatedToStep3, formData.brandWebsite, toast]);

  const handleNext = async () => {
    setIsProcessingNext(true);

    // Save brand details
    if (currentStep === 1) {
      try {
        const response = await apiCall("/user/brand", {
          method: "POST",
          body: JSON.stringify({
            brand_name: formData.brandName,
            domain: formData.brandWebsite,
            country: formData.defaultLocation,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to save brand details");
        }

        toast({
          title: "Brand details saved",
          description: "Your brand information has been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving brand details:", error);
        toast({
          title: "Error saving brand details",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
        setIsProcessingNext(false);
        return; // Don't proceed if save fails
      }
    }

    // Persist competitors when leaving step 2
    if (currentStep === 2) {
      // Build JSON array payload: [{ brand_name, domain }, ...]
      const competitorsArray = (formData.competitors || []).map((entry) => {
        const raw = (entry || "").trim();
        
        // Check if entry uses the || separator (manually added competitors)
        const hasSeparator = raw.includes("||");
        let competitorName = "";
        let competitorDomain = "";

        if (hasSeparator) {
          const [name, domain] = raw.split("||");
          competitorName = name.trim();
          competitorDomain = domain.trim();
        } else {
          // For suggested competitors (just the name)
          competitorName = raw;
          // Try to infer domain from name (optional)
          const match = raw.match(/([a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\S*)/);
          if (match) {
            competitorDomain = match[1];
          }
        }

        // Normalize domain to full URL with protocol and without paths
        if (competitorDomain) {
          // Remove protocol if present
          competitorDomain = competitorDomain.replace(/^https?:\/\//i, "");
          // Remove path if present (keep only domain)
          competitorDomain = competitorDomain.split("/")[0];
          // Add https:// protocol
          competitorDomain = `https://${competitorDomain}`;
        }

        // Return brand_name and domain (no country)
        return {
          brand_name: competitorName,
          domain: competitorDomain || "", // Send empty string if no domain
        };
      });

      try {
        const response = await apiCall("/user/competitor", {
          method: "POST",
          body: JSON.stringify(competitorsArray),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to save competitors");
        }

        toast({
          title: "Competitors saved",
          description: "Your competitors have been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving competitors:", error);
        toast({
          title: "Error saving competitors",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
        setIsProcessingNext(false);
        return; // Don't proceed if save fails
      }
    }

    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      dispatch(setCurrentStep(nextStep));

      // Mark that user has navigated to the next step
      if (nextStep === 2) {
        setHasUserNavigatedToStep2(true);
      } else if (nextStep === 3) {
        setHasUserNavigatedToStep3(true);
      }
    }

    setIsProcessingNext(false);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

 // const addCompetitor = async (competitorName: string) => {
//       if (
//           !competitorName.trim() ||
//           formData.competitors.includes(competitorName.trim())
//       ) {
//           return;
//       }

//       setAddingCompetitor(true);

//       try {
//           const response = await apiCall("/user/competitor", {
//               method: "POST",
//               body: JSON.stringify({
//                   competitor: competitorName.trim(),
//               }),
//           });

//           if (!response.ok) {
//               const errorData = await response.json().catch(() => ({}));
//               throw new Error(errorData.message || "Failed to add competitor");
//           }

//           setFormData({
//               ...formData,
//               competitors: [...formData.competitors, competitorName.trim()],
//           });

//           toast({
//               title: "Competitor added",
//               description: `${competitorName.trim()} has been added successfully.`,
//           });
//       } catch (error) {
//           console.error("Error adding competitor:", error);
//           toast({
//               title: "Error adding competitor",
//               description:
//                   error instanceof Error ? error.message : "Please try again.",
//               variant: "destructive",
//           });
//       } finally {
//           setAddingCompetitor(false);
    //   }
  //   };

//   const removeCompetitor = async (competitor: string) => {
//       try {
//           const response = await apiCall("/user/competitor", {
//               method: "DELETE",
//               body: JSON.stringify({
//                   competitor: competitor,
//               }),
//           });

//           if (!response.ok) {
//               throw new Error("Failed to remove competitor");
//           }

//           setFormData({
//               ...formData,
//               competitors: formData.competitors.filter((c) => c !== competitor),
//           });

//           toast({
//               title: "Competitor removed",
//               description: `${competitor} has been removed.`,
//           });
//       } catch (error) {
//           console.error("Error removing competitor:", error);
//           toast({
//               title: "Error removing competitor",
//               description: "Please try again.",
//               variant: "destructive",
//           });
    //   }
  //   };

  const addCompetitor = async (competitorValue: string) => {
    const trimmed = competitorValue.trim();
    if (!trimmed || formData.competitors.includes(trimmed)) {
      return;
    }
    dispatch(updateOnboardingData({
      competitors: [...formData.competitors, trimmed],
    }));
  };

  const removeCompetitor = async (competitor: string) => {
    dispatch(updateOnboardingData({
      competitors: formData.competitors.filter((c) => c !== competitor),
    }));
  };

  const addPrompt = (promptText: string) => {
    if (!promptText.trim() || formData.prompts.includes(promptText.trim())) {
      return;
    }

    dispatch(updateOnboardingData({
      prompts: [...formData.prompts, promptText.trim()],
    }));
  };

  const removePrompt = (prompt: string) => {
    dispatch(updateOnboardingData({
      prompts: formData.prompts.filter((p) => p !== prompt),
    }));
  };

  const handleComplete = async () => {
    if (formData.prompts.length === 0) {
      toast({
        title: "No prompts added",
        description: "Please add at least one prompt before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsLaunching(true);

    try {
      const promptData = {
        prompts: formData.prompts.map(prompt => ({
          prompt: prompt,
          country: formData.defaultLocation
        }))
      };
      
      console.log('Sending prompts data:', promptData);

      const response = await apiCall("/prompts/analysis", {
        method: "POST",
        body: JSON.stringify(promptData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      dispatch(setBrand({
        name: formData.brandName,
        website: formData.brandWebsite,
        location: formData.defaultLocation,
      }));
      localStorage.setItem("aeorank_onboarding_completed", "true");

      toast({
        title: "Welcome to AEORank!",
        description: "Your account has been set up successfully. Let's start optimizing your AI search presence!",
      });

      onComplete(formData);
    } catch (error) {
      console.error("Error analyzing prompts:", error);
      
      toast({
        title: "Error saving prompts",
        description: error instanceof Error ? error.message : "Failed to save prompts. Please try again.",
        variant: "destructive",
      });
      
      setIsLaunching(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.brandName.trim() &&
          formData.brandWebsite.trim() &&
          formData.defaultLocation.trim()
        );
      case 2:
        return true; // allow proceeding from competitors step
      case 3:
        return formData.prompts.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Tell us about your brand
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let's start by setting up your brand profile
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand Name *
                </Label>
                <Input
                  id="brandName"
                  placeholder="Enter your brand name"
                  value={formData.brandName}
                  onChange={(e) =>
                    dispatch(updateOnboardingData({ brandName: e.target.value }))
                  }
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandWebsite" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand Website *
                </Label>
                <Input
                  id="brandWebsite"
                  placeholder="example.com"
                  value={formData.brandWebsite}
                  onChange={(e) => {
                    let cleanValue = e.target.value.trim();
                    cleanValue = cleanValue.replace(/^https?:\/\//i, '');
                    cleanValue = cleanValue.replace(/^www\./i, '');
                    cleanValue = cleanValue.split('/')[0];
                    dispatch(updateOnboardingData({ brandWebsite: cleanValue }));
                  }}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLocation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country *
                </Label>
                <Select
                  value={formData.defaultLocation}
                  onValueChange={(value) =>
                    dispatch(updateOnboardingData({ defaultLocation: value }))
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select your country">
                      {formData.defaultLocation && (
                        <span className="flex items-center gap-2">
                          <span>{getCountryFlag(formData.defaultLocation)}</span>
                          <span>{formData.defaultLocation}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {defaultLocations.map((location) => (
                      <SelectItem key={location} value={location} className="text-sm">
                        <span className="flex items-center gap-2">
                          <span>{getCountryFlag(location)}</span>
                          <span>{location}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Add your competitors
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Who are your main competitors? We'll help you track their performance.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
              {/* Suggested Competitors */}
              {loadingCompetitors ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Sparkles className="w-5 h-5 text-gray-400 animate-pulse" />
                  <div className="space-y-1.5 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Finding your competitors...</p>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mx-auto">
                      <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              ) : suggestedCompetitorsList.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested competitors</Label>
                  <div className="space-y-2">
                    {suggestedCompetitorsList.map((competitor, index) => {
                      // Format: name||url for checking if added
                      const competitorString = competitor.url 
                        ? `${competitor.name}||${competitor.url}`
                        : competitor.name;
                      const isAdded = formData.competitors.some(c => 
                        c === competitorString || c === competitor.name
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span
                              className={`text-sm ${
                                isAdded
                                  ? "text-gray-400 line-through"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {competitor.name}
                            </span>
                            {competitor.url && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {competitor.url.replace(/^https?:\/\//i, '')}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-xs"
                            disabled={isAdded || addingCompetitor}
                            onClick={() => addCompetitor(competitorString)}
                          >
                            {addingCompetitor ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isAdded ? (
                              "Added"
                            ) : (
                              "Add"
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Add Custom Competitors Form */}
              <div className="space-y-3">
                <Label htmlFor="competitor-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Add competitor (Name & Domain required)</Label>
                <div className="flex gap-3">
                  <Input
                    id="competitor-name"
                    placeholder="Competitor name"
                    value={tempCompetitorName}
                    onChange={(e) => setTempCompetitorName(e.target.value)}
                    onKeyPress={(e) => {
                      if (
                        e.key === "Enter" &&
                        tempCompetitorName.trim() &&
                        tempCompetitorDomain.trim() &&
                        !addingCompetitor
                      ) {
                        e.preventDefault();
                        addCompetitor(`${tempCompetitorName}||${tempCompetitorDomain}`);
                        setTempCompetitorName("");
                        setTempCompetitorDomain("");
                      }
                    }}
                    disabled={addingCompetitor}
                    className="h-10 text-sm flex-1"
                  />
                  <Input
                    id="competitor-domain"
                    placeholder="www.example.com"
                    value={tempCompetitorDomain}
                    onChange={(e) => {
                      let cleanValue = e.target.value.trim();
                      cleanValue = cleanValue.replace(/^https?:\/\//i, '');
                      cleanValue = cleanValue.split('/')[0];
                      setTempCompetitorDomain(cleanValue);
                    }}
                    onKeyPress={(e) => {
                      if (
                        e.key === "Enter" &&
                        tempCompetitorName.trim() &&
                        tempCompetitorDomain.trim() &&
                        !addingCompetitor
                      ) {
                        e.preventDefault();
                        addCompetitor(`${tempCompetitorName}||${tempCompetitorDomain}`);
                        setTempCompetitorName("");
                        setTempCompetitorDomain("");
                      }
                    }}
                    disabled={addingCompetitor}
                    className="h-10 text-sm flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (!tempCompetitorName.trim() || !tempCompetitorDomain.trim()) {
                        toast({
                          title: "Both fields required",
                          description: "Please enter both competitor name and domain.",
                          variant: "destructive",
                        });
                        return;
                      }
                      addCompetitor(`${tempCompetitorName}||${tempCompetitorDomain}`);
                      setTempCompetitorName("");
                      setTempCompetitorDomain("");
                    }}
                    disabled={!tempCompetitorName.trim() || !tempCompetitorDomain.trim() || addingCompetitor}
                    className="h-10 px-4 text-sm"
                  >
                    {addingCompetitor ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>

              {/* Your Competitors List */}
              {formData.competitors.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your competitors ({formData.competitors.length})</Label>
                  <div className="flex flex-wrap gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    {formData.competitors.map((competitor, index) => {
                      const hasDomain = competitor.includes("||");
                      const [compName, compDomain] = hasDomain ? competitor.split("||") : [competitor, ""];
                      const displayDomain = compDomain 
                        ? compDomain.replace(/^https?:\/\//i, '')
                        : '';
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-2 py-1.5 px-3 text-xs"
                        >
                          <div className="flex flex-col text-left">
                            <span className="leading-tight text-xs font-medium">{compName}</span>
                            {displayDomain && (
                              <span className="text-[10px] opacity-70 leading-tight">{displayDomain}</span>
                            )}
                          </div>
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 flex-shrink-0"
                            onClick={() => removeCompetitor(competitor)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Review your prompts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can always add more prompts and customize them later in your project.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
              {loadingPrompts ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Sparkles className="w-5 h-5 text-gray-400 animate-pulse" />
                  <div className="space-y-1.5 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Generating prompts...</p>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mx-auto">
                      <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.prompts.length > 0 && (
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your prompts ({formData.prompts.length})</Label>
                  )}
                  
                  {/* Display added prompts from suggestions or custom */}
                  {formData.prompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-lg">{getCountryFlag(formData.defaultLocation)}</span>
                      </div>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {prompt}
                      </span>
                      <button
                        onClick={() => removePrompt(prompt)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Show suggested prompts that haven't been added yet */}
                  {suggestedPromptsList.filter(p => !formData.prompts.includes(p)).length > 0 && (
                    <>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">Suggested prompts</Label>
                      {suggestedPromptsList.filter(p => !formData.prompts.includes(p)).map((prompt, index) => (
                        <div
                          key={`suggestion-${index}`}
                          className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => addPrompt(prompt)}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <span className="text-lg">{getCountryFlag(formData.defaultLocation)}</span>
                          </div>
                          <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {prompt}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Input for custom prompts */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Add custom prompt</Label>
                    <Textarea
                      placeholder="Enter your custom prompt"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && tempInput.trim()) {
                          e.preventDefault();
                          addPrompt(tempInput);
                          setTempInput("");
                        }
                      }}
                      rows={2}
                      className="resize-none text-xs"
                    />
                    
                    <div className="flex items-center justify-end gap-2">
                      {tempInput.trim() && (
                        <Button
                          onClick={() => {
                            addPrompt(tempInput);
                            setTempInput("");
                          }}
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          Add Prompt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const steps = ['Brand', 'Competitors', 'Prompts'];

  return (
    <>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Header with Progress - Single Line */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <img src="/AEO-Rank.jpeg" alt="AEO Rank" className="h-8 w-8 rounded object-cover flex-shrink-0" />
            
            {/* Steps Navigation */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      index + 1 === currentStep
                        ? 'bg-blue-600 text-white'
                        : index + 1 < currentStep
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-12 px-8">
            {renderStep()}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1 || isProcessingNext}
              className="flex items-center gap-2 h-11 px-6 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white h-11 px-10 rounded-lg font-medium text-sm"
              >
                Launch Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isProcessingNext}
                className="group bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white h-11 px-10 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-all"
              >
                {isProcessingNext ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Next step</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {isLaunching && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-6 max-w-md mx-4">
            <Loader2 className="w-14 h-14 animate-spin text-blue-600" />
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Analyzing your competitors and prompts...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                This may take up to 60 seconds. Please wait while we set up your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingWizard;
