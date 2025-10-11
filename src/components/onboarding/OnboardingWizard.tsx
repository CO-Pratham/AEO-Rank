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
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  MessageSquare,
  Globe,
  Rocket,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  brandName: string;
  brandWebsite: string;
  defaultLocation: string;
  industry: string;
  competitors: string[];
  prompts: string[];
  country: string;
  goals: string[];
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
    industry: "",
    competitors: [],
    prompts: [],
    country: "",
    goals: [],
  });
  const [tempInput, setTempInput] = useState("");
  const [suggestedCompetitorsList, setSuggestedCompetitorsList] = useState<
    string[]
  >([]);
  const [suggestedPromptsList, setSuggestedPromptsList] = useState<string[]>(
    []
  );
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      try {
        const response = await fetch("/api/competitors/suggested");

        if (!response.ok) {
          throw new Error("Failed to fetch suggested competitors");
        }

        const data = await response.json();
        const competitorNames = data.map((comp: { name: string }) => comp.name);
        setSuggestedCompetitorsList(competitorNames);
      } catch (error) {
        console.error("Error fetching suggested competitors:", error);
        setSuggestedCompetitorsList(suggestedCompetitors);
      }
    };

    const fetchSuggestedPrompts = async () => {
      try {
        const response = await fetch("/api/prompts/suggested");

        if (!response.ok) {
          throw new Error("Failed to fetch suggested prompts");
        }

        const data = await response.json();
        const promptTexts = data.map((prompt: { text: string }) => prompt.text);
        setSuggestedPromptsList(promptTexts);
      } catch (error) {
        console.error("Error fetching suggested prompts:", error);
        setSuggestedPromptsList(suggestedPrompts);
      }
    };

    if (isOpen && currentStep === 3) {
      fetchSuggestedCompetitors();
    }

    if (isOpen && currentStep === 2) {
      fetchSuggestedPrompts();
    }
  }, [isOpen, currentStep]);

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "E-commerce",
    "Education",
    "Real Estate",
    "Travel",
    "Food & Beverage",
    "Fashion",
    "Automotive",
    "Other",
  ];

  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "ES", name: "Spain" },
    { code: "IT", name: "Italy" },
    { code: "JP", name: "Japan" },
    { code: "IN", name: "India" },
  ];

  const defaultLocations = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "India",
  ];

  const suggestedPrompts = [
    "Best project management software for teams",
    "Top CRM solutions for small business",
    "AI-powered marketing automation tools",
    "Cloud storage solutions for enterprises",
    "Customer support software comparison",
  ];

  const suggestedCompetitors = [
    "Microsoft",
    "Google",
    "Amazon",
    "Salesforce",
    "HubSpot",
  ];

  const goalOptions = [
    "Increase brand visibility in AI search",
    "Monitor competitor performance",
    "Optimize content for AI platforms",
    "Track sentiment analysis",
    "Improve search rankings",
    "Generate more leads",
  ];

  const handleNext = async () => {
    // Save brand details when moving
    if (currentStep === 1) {
      try {
        const response = await fetch("/api/onboarding/brand-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            brandName: formData.brandName,
            brandWebsite: formData.brandWebsite,
            defaultLocation: formData.defaultLocation,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save brand details");
        }

        toast({
          title: "Brand details saved",
          description: "Your brand information has been saved successfully.",
        });
      } catch (error) {
        toast({
          title: "Error saving brand details",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
        return;
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

  const addCompetitor = () => {
    if (tempInput.trim() && !formData.competitors.includes(tempInput.trim())) {
      setFormData({
        ...formData,
        competitors: [...formData.competitors, tempInput.trim()],
      });
      setTempInput("");
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((c) => c !== competitor),
    });
  };

  const handleAddPrompt = async (promptText: string) => {
    if (promptText.trim() && !formData.prompts.includes(promptText.trim())) {
      try {
        const response = await fetch("/api/prompts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: promptText.trim(),
            status: "active",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add prompt");
        }

        setFormData({
          ...formData,
          prompts: [...formData.prompts, promptText.trim()],
        });

        toast({
          title: "Prompt added",
          description: `Prompt has been added successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error adding prompt",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const addPrompt = async () => {
    await handleAddPrompt(tempInput);
    setTempInput("");
  };

  const removePrompt = (prompt: string) => {
    setFormData({
      ...formData,
      prompts: formData.prompts.filter((p) => p !== prompt),
    });
  };

  const toggleGoal = (goal: string) => {
    const goals = formData.goals.includes(goal)
      ? formData.goals.filter((g) => g !== goal)
      : [...formData.goals, goal];
    setFormData({ ...formData, goals });
  };

  const handleComplete = () => {
    // Store onboarding completion in localStorage
    localStorage.setItem("aeorank_onboarding_completed", "true");
    localStorage.setItem("aeorank_onboarding_data", JSON.stringify(formData));

    toast({
      title: "Welcome to AEORank!",
      description:
        "Your account has been set up successfully. Let's start optimizing your AI search presence!",
    });

    onComplete(formData);
    onClose();
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
      case 3:
        return formData.competitors.length > 0;
      // COMMENTED OUT - Country and goals validation
      // case 4:
      //   return formData.country;
      // case 5:
      //   return formData.goals.length > 0;
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
                  <SelectContent>
                    {defaultLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* COMMENTED OUT - Industry field */}
              {/*
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              */}
            </CardContent>
          </Card>
        );

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
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {(suggestedPromptsList.length > 0
                    ? suggestedPromptsList
                    : suggestedPrompts
                  ).map((prompt, index) => {
                    const isAdded = formData.prompts.includes(prompt);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <span
                          className={`flex-1 text-sm ${
                            isAdded ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {prompt}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                          disabled={isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              handleAddPrompt(prompt);
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                    );
                  })}
                </div>
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
                  />
                  <Button
                    onClick={addPrompt}
                    disabled={!tempInput.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Add
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
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {(suggestedCompetitorsList.length > 0
                    ? suggestedCompetitorsList
                    : suggestedCompetitors
                  ).map((competitor, index) => {
                    const isAdded = formData.competitors.includes(competitor);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <span
                          className={`flex-1 text-sm ${
                            isAdded ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {competitor}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                          disabled={isAdded}
                          onClick={async () => {
                            if (!isAdded) {
                              try {
                                const response = await fetch(
                                  "/api/competitors",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      brand: competitor,
                                      logo: "",
                                      visibility: "N/A",
                                      sentiment: "N/A",
                                      position: "N/A",
                                    }),
                                  }
                                );

                                if (!response.ok) {
                                  throw new Error("Failed to add competitor");
                                }

                                setFormData({
                                  ...formData,
                                  competitors: [
                                    ...formData.competitors,
                                    competitor,
                                  ],
                                });

                                toast({
                                  title: "Competitor added",
                                  description: `${competitor} has been added to your competitors list.`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Error adding competitor",
                                  description:
                                    error instanceof Error
                                      ? error.message
                                      : "Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor">Add custom competitors</Label>
                <div className="flex gap-2">
                  <Input
                    id="competitor"
                    placeholder="Enter competitor name"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCompetitor()}
                  />
                  <Button
                    onClick={addCompetitor}
                    disabled={!tempInput.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Add
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
        );

      case 3:
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
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {(suggestedPromptsList.length > 0
                    ? suggestedPromptsList
                    : suggestedPrompts
                  ).map((prompt, index) => {
                    const isAdded = formData.prompts.includes(prompt);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <span
                          className={`flex-1 text-sm ${
                            isAdded ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {prompt}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                          disabled={isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              handleAddPrompt(prompt);
                            }
                          }}
                        >
                          +
                        </Button>
                      </div>
                    );
                  })}
                </div>
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
                  />
                  <Button
                    onClick={addPrompt}
                    disabled={!tempInput.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Add
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

      // COMMENTED OUT - Choose your target country section
      /*
      case 4:
        return (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Choose your target country
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Which country should we focus our analysis on?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country">Target Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your target country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                            className="w-4 h-3"
                          />
                          {country.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      */

      // COMMENTED OUT - What are your goals section
      /*
      case 5:
        return (
          <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-rose-200 dark:border-rose-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                What are your goals?
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Select your primary objectives with AEORank
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {goalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-3">
                    <Checkbox
                      id={goal}
                      checked={formData.goals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <Label
                      htmlFor={goal}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      */

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
