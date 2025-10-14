import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
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
    string[]
  >([]);
  const [suggestedPromptsList, setSuggestedPromptsList] = useState<string[]>(
    []
  );
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
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



  // Fetch suggested competitors using brand name and domain
  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      if (currentStep !== 2 || suggestedCompetitorsList.length > 0) return;
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
          const competitorNames = data
            .map((comp: { name?: string; brand?: string; competitor?: string }) =>
              comp?.name || comp?.brand || comp?.competitor || ""
            )
            .filter(Boolean);
          setSuggestedCompetitorsList(competitorNames);
        } else if (data && data.competitors && Array.isArray(data.competitors)) {
          const competitorNames = data.competitors
            .map((comp: { name?: string; brand?: string; competitor?: string }) =>
              comp?.name || comp?.brand || comp?.competitor || ""
            )
            .filter(Boolean);
          setSuggestedCompetitorsList(competitorNames);
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

    if (isOpen && currentStep === 2) {
      fetchSuggestedCompetitors();
    }
  }, [isOpen, currentStep, suggestedCompetitorsList.length, toast, formData.brandName, formData.brandWebsite]);

  // Fetch suggested prompts
  useEffect(() => {
    const fetchSuggestedPrompts = async () => {
      if (currentStep !== 3 || !formData.brandWebsite) return;

      setLoadingPrompts(true);
      try {
        console.log('=== PROMPTS API CALL ===');
        console.log('Domain:', formData.brandWebsite);
        
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

    if (isOpen && currentStep === 3 && formData.brandWebsite) {
      fetchSuggestedPrompts();
    }
  }, [isOpen, currentStep, formData.brandWebsite, toast]);

  const handleNext = async () => {
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
        return; // Don't proceed if save fails
      }
    }

    // Persist competitors when leaving step 2
    if (currentStep === 2) {
      // Build JSON array payload: [{ brand_name, domain, country }, ...]
      const competitorsArray = (formData.competitors || []).map((entry) => {
        const raw = (entry || "").trim();
        // Split formats like "Name — domain" or "Name - domain"
        const parts = raw.split(/\s+—\s+|\s+-\s+/);
        let brandName = (parts[0] || raw).trim();
        let domainCandidate = parts.length > 1 ? parts.slice(1).join("-").trim() : "";

        // If domain not explicitly provided, try to infer one
        if (!domainCandidate) {
          const match = raw.match(/([a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\S*)/);
          if (match) {
            domainCandidate = match[1];
          }
        }

        // Normalize domain to full URL with protocol and without paths
        let domain = domainCandidate;
        if (domain) {
          domain = domain.replace(/^https?:\/\//i, "");
          domain = domain.replace(/^www\./i, "");
          domain = domain.split("/")[0];
          domain = `https://${domain}`;
        }

        return {
          brand_name: brandName,
          ...(domain ? { domain } : {}),
          country: (formData.defaultLocation || "").trim(),
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
        return; // Don't proceed if save fails
      }
    }

    if (currentStep < totalSteps) {
      dispatch(setCurrentStep(currentStep + 1));
    }
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
          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border-2 border-blue-200 dark:border-blue-700 shadow-xl">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-t-lg px-10 py-8">
              <CardTitle className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tell us about your brand
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 mt-4">
                Let's start by setting up your brand profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-10 py-8">
              <div className="space-y-4">
                <Label htmlFor="brandName" className="font-semibold text-slate-700 dark:text-slate-300">
                  Brand Name *
                </Label>
                <Input
                  id="brandName"
                  placeholder="Enter your brand name"
                  value={formData.brandName}
                  onChange={(e) =>
                    dispatch(updateOnboardingData({ brandName: e.target.value }))
                  }
                  className="h-12 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-400 transition-all duration-300 rounded-lg bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="brandWebsite" className="font-semibold text-slate-700 dark:text-slate-300">
                  Brand Website *
                </Label>
                <Input
                  id="brandWebsite"
                  placeholder="https://example.com"
                  value={formData.brandWebsite}
                  onChange={(e) =>
                    dispatch(updateOnboardingData({ brandWebsite: e.target.value }))
                  }
                  className="h-12 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-400 transition-all duration-300 rounded-lg bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="defaultLocation" className="font-semibold text-slate-700 dark:text-slate-300">
                  Default Location *
                </Label>
                <Select
                  value={formData.defaultLocation}
                  onValueChange={(value) =>
                    dispatch(updateOnboardingData({ defaultLocation: value }))
                  }
                >
                  <SelectTrigger className="h-12 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-400 transition-all duration-300 rounded-lg bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-2 rounded-lg shadow-xl">
                    {defaultLocations.map((location) => (
                      <SelectItem key={location} value={location} className="py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Add your competitors
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Who are your main competitors? We'll help you track their
                performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Suggested competitors</Label>
                {loadingCompetitors ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading suggestions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {suggestedCompetitorsList.length > 0 ? (
                      suggestedCompetitorsList.map((competitor, index) => {
                        const isAdded =
                          formData.competitors.includes(competitor);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded-lg"
                          >
                            <span
                              className={`flex-1 text-sm ${
                                isAdded
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {competitor}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                              disabled={isAdded || addingCompetitor}
                              onClick={() => addCompetitor(competitor)}
                            >
                              {addingCompetitor ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "+"
                              )}
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        No suggestions available
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor-name">Add custom competitors</Label>
                <div className="flex gap-2">
                  <Input
                    id="competitor-name"
                    placeholder="Enter competitor brand name"
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
                  />
                  <Input
                    id="competitor-domain"
                    placeholder="branddomain.com"
                    value={tempCompetitorDomain}
                    onChange={(e) => setTempCompetitorDomain(e.target.value)}
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
                  />
                  <Button
                    onClick={() => {
                      if (!tempCompetitorName.trim() || !tempCompetitorDomain.trim()) return;
                      addCompetitor(`${tempCompetitorName}||${tempCompetitorDomain}`);
                      setTempCompetitorName("");
                      setTempCompetitorDomain("");
                    }}
                    disabled={!tempCompetitorName.trim() || !tempCompetitorDomain.trim() || addingCompetitor}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {addingCompetitor ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your competitors ({formData.competitors.length})</Label>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border rounded-md max-h-[120px] overflow-y-auto">
                  {formData.competitors.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No competitors added yet
                    </p>
                  ) : (
                    formData.competitors.map((competitor, index) => {
                      const hasDomain = competitor.includes("||");
                      const [compName, compDomain] = hasDomain ? competitor.split("||") : [competitor, ""];
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                          >
                            <div className="flex flex-col text-left">
                              <span className="leading-tight">{compName}</span>
                              {compDomain ? (
                                <span className="text-xs text-emerald-700 leading-tight">{compDomain}</span>
                              ) : null}
                            </div>
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeCompetitor(competitor)}
                            />
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-rose-950/50 border-2 border-purple-200 dark:border-purple-700 shadow-xl">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-rose-500/15 rounded-t-lg px-10 py-8">
              <CardTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
                Add your prompts
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                What prompts or queries are relevant to your business? These will be monitored across AI platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-10 py-8">
              <div className="space-y-5">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                  Suggested prompts
                </Label>
                {loadingPrompts ? (
                  <div className="flex items-center justify-center p-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:bg-gradient-to-r dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-3 text-purple-600 dark:text-purple-400 font-medium">
                      Loading suggestions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[160px] overflow-y-auto bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-900/30 p-5 rounded-xl border-2 border-purple-100 dark:border-purple-800">
                    {suggestedPromptsList.length > 0 ? (
                      suggestedPromptsList.map((prompt, index) => {
                        const isAdded = formData.prompts.includes(prompt);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 border-2 rounded-xl bg-gradient-to-r from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                          >
                            <span
                              className={`flex-1 ${
                                isAdded
                                  ? "text-muted-foreground line-through"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {prompt}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 p-0 text-green-600 hover:bg-green-50 border-2 hover:border-green-400 hover:shadow-md transition-all duration-300 rounded-lg"
                              disabled={isAdded || addingPrompt}
                              onClick={() => addPrompt(prompt)}
                            >
                              {addingPrompt ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "+"
                              )}
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground p-6 text-center bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        No suggestions available
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-5">
                <Label htmlFor="prompt" className="font-semibold text-slate-700 dark:text-slate-300">
                  Add custom prompts
                </Label>
                <div className="flex gap-4">
                  <Textarea
                    id="prompt"
                    placeholder="Enter your custom prompt (e.g., 'Best project management tools for small teams')"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    rows={3}
                    disabled={addingPrompt}
                    className="border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-400 transition-all duration-300 resize-none rounded-xl bg-white/80 dark:bg-gray-800/80"
                  />
                  <Button
                    onClick={() => {
                      addPrompt(tempInput);
                      setTempInput("");
                    }}
                    disabled={!tempInput.trim() || addingPrompt}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 font-semibold rounded-xl"
                  >
                    {addingPrompt ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-5">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                  Your prompts ({formData.prompts.length})
                </Label>
                <div className="space-y-3 max-h-[160px] overflow-y-auto bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-900/30 p-5 rounded-xl border-2 border-purple-100 dark:border-purple-800">
                  {formData.prompts.length === 0 ? (
                    <p className="text-muted-foreground p-8 text-center bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                      No prompts added yet
                    </p>
                  ) : (
                    formData.prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-5 border-2 rounded-xl bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-rose-900/40 border-purple-200 dark:border-purple-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                      >
                        <span className="flex-1 text-slate-700 dark:text-slate-300">
                          {prompt}
                        </span>
                        <X
                          className="w-5 h-5 cursor-pointer hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1 flex-shrink-0 mt-0.5 transition-all duration-300"
                          onClick={() => removePrompt(prompt)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl [&>button]:hidden overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>
            
            <div className="text-center mb-6">
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                Welcome to AEORank
              </DialogTitle>
              <p className="text-blue-100 opacity-90">Setup your AI presence in just {totalSteps} simple steps</p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-blue-100 mb-3">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="max-w-2xl mx-auto">
              {renderStep()}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-3 px-6 py-3 font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index + 1 <= currentStep 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500" 
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-6 py-3 font-semibold rounded-lg"
                >
                  <Check className="w-4 h-4" />
                  Launch Dashboard
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 px-6 py-3 font-semibold rounded-lg group"
                >
                  Next
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
      
      {isLaunching && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md mx-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Setting up your dashboard...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take up to 60 seconds. Please wait while we analyze your prompts.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingWizard;
