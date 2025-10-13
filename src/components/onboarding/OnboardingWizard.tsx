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
import { apiCall, getToken } from "@/utils/api";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    brandName: "",
    brandWebsite: "",
    defaultLocation: "",
    competitors: [],
    prompts: [],
  });
  const [tempInput, setTempInput] = useState("");
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
  const { toast } = useToast();

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const defaultLocations = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "India",
  ];



  // Fetch suggested competitors
  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      if (currentStep !== 2 || suggestedCompetitorsList.length > 0) return;

      setLoadingCompetitors(true);
      try {
        const response = await apiCall("/competitor/generate", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch competitors: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const competitorNames = data.map(
            (comp: { name: string }) => comp.name
          );
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
  }, [isOpen, currentStep, suggestedCompetitorsList.length, toast]);

  // Fetch suggested prompts
  useEffect(() => {
    const fetchSuggestedPrompts = async () => {
      if (currentStep !== 2 || !formData.brandWebsite) return;

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

    if (isOpen && currentStep === 2 && formData.brandWebsite) {
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

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  const addPrompt = (promptText: string) => {
    if (!promptText.trim() || formData.prompts.includes(promptText.trim())) {
      return;
    }

    setFormData({
      ...formData,
      prompts: [...formData.prompts, promptText.trim()],
    });
  };

  const removePrompt = (prompt: string) => {
    setFormData({
      ...formData,
      prompts: formData.prompts.filter((p) => p !== prompt),
    });
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
      
      // Don't redirect on error - let user retry
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
        return formData.prompts.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tell us about your brand
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Let's start by setting up your brand profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  placeholder="Enter your brand name"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandWebsite">Brand Website *</Label>
                <Input
                  id="brandWebsite"
                  placeholder="https://example.com"
                  value={formData.brandWebsite}
                  onChange={(e) =>
                    setFormData({ ...formData, brandWebsite: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLocation">Default Location *</Label>
                <Select
                  value={formData.defaultLocation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultLocation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {defaultLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      /*case 2:
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
                <Label htmlFor="competitor">Add custom competitors</Label>
                <div className="flex gap-2">
                  <Input
                    id="competitor"
                    placeholder="Enter competitor name"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (
                        e.key === "Enter" &&
                        tempInput.trim() &&
                        !addingCompetitor
                      ) {
                        e.preventDefault();
                        addCompetitor(tempInput);
                        setTempInput("");
                      }
                    }}
                    disabled={addingCompetitor}
                  />
                  <Button
                    onClick={() => {
                      addCompetitor(tempInput);
                      setTempInput("");
                    }}
                    disabled={!tempInput.trim() || addingCompetitor}
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
                    formData.competitors.map((competitor, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      >
                        {competitor}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeCompetitor(competitor)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );*/

      case 2:
        return (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Add your prompts
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                What prompts or queries are relevant to your business? These
                will be monitored across AI platforms.
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Suggested prompts</Label>
                {loadingPrompts ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading suggestions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {suggestedPromptsList.length > 0 ? (
                      suggestedPromptsList.map((prompt, index) => {
                        const isAdded = formData.prompts.includes(prompt);
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
                              {prompt}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                              disabled={isAdded || addingPrompt}
                              onClick={() => addPrompt(prompt)}
                            >
                              {addingPrompt ? (
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
                <Label htmlFor="prompt">Add custom prompts</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="prompt"
                    placeholder="Enter your custom prompt"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    rows={2}
                    disabled={addingPrompt}
                  />
                  <Button
                    onClick={() => {
                      addPrompt(tempInput);
                      setTempInput("");
                    }}
                    disabled={!tempInput.trim() || addingPrompt}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {addingPrompt ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your prompts ({formData.prompts.length})</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {formData.prompts.length === 0 ? (
                    <p className="text-muted-foreground text-sm p-3 border rounded-md">
                      No prompts added yet
                    </p>
                  ) : (
                    formData.prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700"
                      >
                        <span className="flex-1 text-sm">{prompt}</span>
                        <X
                          className="w-4 h-4 cursor-pointer hover:text-destructive flex-shrink-0 mt-0.5"
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 -m-6 p-6 mb-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to AEORank
            </DialogTitle>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="font-medium">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 bg-gray-200 dark:bg-gray-700"
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>
        </DialogHeader>

        <div className="py-4 px-2">{renderStep()}</div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              size="lg"
            >
              <Check className="w-4 h-4" />
              Launch Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              size="lg"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
