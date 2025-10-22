import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Home, Save, FileText, Edit2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useBrand } from "@/context/BrandContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PricingSection from "@/components/PricingSection";
import { apiCall } from "@/utils/api";

import chatgptIcon from "@/assets/logos/chatgpt-icon.svg";
import geminiIcon from "@/assets/logos/google-gemini-icon.svg";
import claudeIcon from "@/assets/logos/claude-ai-icon.svg";
import perplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import googleAiStudioIcon from "@/assets/logos/google-ai-studio-icon.svg";

const WorkspacePage = () => {
  const { currentWorkspace, addWorkspace, updateWorkspace } = useWorkspace();
  const { brand, loading: brandLoading, refetch: refetchBrand } = useBrand();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isNewWorkspace = searchParams.get('new') === 'true';
  const isLocked = searchParams.get('locked') === '1';
  const [showPricing, setShowPricing] = useState(isLocked);
  
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [isUpdatingBrand, setIsUpdatingBrand] = useState(false);

  const [models, setModels] = useState({
    chatgpt: true,
    gpt4oSearch: false,
    perplexity: true,
    aiOverview: true,
    aiMode: false,
    gemini: false,
    claudeSonnet4: false,
  });

  // Helper function to map location to IP address dropdown value
  const mapLocationToIpAddress = (location: string) => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('india') || locationLower.includes('in')) return 'india';
    if (locationLower.includes('united states') || locationLower.includes('usa') || locationLower.includes('us')) return 'usa';
    if (locationLower.includes('united kingdom') || locationLower.includes('uk') || locationLower.includes('britain')) return 'uk';
    if (locationLower.includes('canada') || locationLower.includes('ca')) return 'canada';
    if (locationLower.includes('australia') || locationLower.includes('au')) return 'australia';
    return '';
  };

  useEffect(() => {
    if (currentWorkspace && !isNewWorkspace) {
      // Editing existing workspace
      setName(currentWorkspace.name);
      setDomain(currentWorkspace.domain);
      setIpAddress(currentWorkspace.ipAddress);
      setModels(currentWorkspace.models);
      setIsEditing(true);
      setIsEditMode(false);
    } else if (isNewWorkspace) {
      // Creating new workspace - prefill with brand data if available and enable edit mode
      if (brand && !brandLoading) {
        setName(brand.name || "");
        setDomain(brand.website || brand.domain || "");
        setIpAddress(mapLocationToIpAddress(brand.location || brand.country || ""));
      } else {
        setName("");
        setDomain("");
        setIpAddress("");
      }
      setModels({
        chatgpt: true,
        gpt4oSearch: false,
        perplexity: true,
        aiOverview: true,
        aiMode: false,
        gemini: false,
        claudeSonnet4: false,
      });
      setIsEditing(false);
      setIsEditMode(true); // Enable edit mode for new workspace
    } else {
      // Just showing brand data (not creating new, no existing workspace) - show as read-only
      if (brand && !brandLoading) {
        setName(brand.name || "");
        setDomain(brand.website || brand.domain || "");
        setIpAddress(mapLocationToIpAddress(brand.location || brand.country || ""));
      }
      setModels({
        chatgpt: true,
        gpt4oSearch: false,
        perplexity: true,
        aiOverview: true,
        aiMode: false,
        gemini: false,
        claudeSonnet4: false,
      });
      setIsEditing(false);
      setIsEditMode(false); // Disable edit mode initially, user must click Edit button
    }
  }, [currentWorkspace, isNewWorkspace, brand, brandLoading]);

  useEffect(() => {
    if (isLocked) {
      setShowPricing(true);
    }
  }, [isLocked]);

  const handleModelToggle = (modelKey: string) => {
    setModels((prev) => ({
      ...prev,
      [modelKey]: !prev[modelKey as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Workspace name is required.",
        variant: "destructive",
      });
      return;
    }

    const workspaceData = {
      name,
      domain,
      ipAddress,
      models,
    };

    if (isEditing && currentWorkspace && !isNewWorkspace) {
      updateWorkspace(currentWorkspace.id, workspaceData);
      toast({
        title: "Workspace Updated",
        description: `${name} has been updated successfully.`,
      });
      setIsEditMode(false); // Exit edit mode after saving
    } else {
      // When creating/updating workspace, also update the brand
      setIsUpdatingBrand(true);
      try {
        const brandUpdateData = {
          brand_name: name,
          domain: domain,
          country: ipAddress,
        };

        const response = await apiCall("/user/brand", {
          method: "POST",
          body: JSON.stringify(brandUpdateData),
        });

        if (!response.ok) {
          throw new Error("Failed to update brand");
        }

        addWorkspace(workspaceData);
        
        toast({
          title: "Workspace Created",
          description: `${name} has been created and brand updated successfully.`,
        });

        // Refetch brand data to update the UI (including WorkspaceDropdown)
        setTimeout(() => {
          refetchBrand();
        }, 500);

        setIsEditing(true);
        setIsEditMode(false); // Exit edit mode after creating
      } catch (error) {
        console.error("Error updating brand:", error);
        toast({
          title: "Error",
          description: "Failed to update brand. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingBrand(false);
      }
    }
  };

  const handleGenerateExport = () => {
    console.log("Generating chat history export...");
  };

  const handleConfirmEdit = async () => {
    setShowEditWarning(false);
    
    // Clear all dashboard data first
    setIsUpdatingBrand(true);
    try {
      // Clear prompts
      await apiCall("/prompts", { method: "DELETE" }).catch(() => {});
      
      // Clear competitors
      await apiCall("/competitors", { method: "DELETE" }).catch(() => {});
      
      // Clear sources
      await apiCall("/sources", { method: "DELETE" }).catch(() => {});
      
      // Clear tags
      await apiCall("/tags", { method: "DELETE" }).catch(() => {});

      console.log("✅ All dashboard data cleared");
      
      toast({
        title: "Dashboard Cleared",
        description: "All dashboard data has been cleared. You can now edit the workspace.",
      });
    } catch (error) {
      console.error("Error clearing dashboard data:", error);
    } finally {
      setIsUpdatingBrand(false);
    }

    // Enable edit mode so user can make changes
    setIsEditMode(true);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2.5">
        <Home className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Workspace</h1>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                {isEditing && !isNewWorkspace ? "Workspace Details" : "Create New Workspace"}
              </CardTitle>
            </div>
            {/* Show edit button when not creating a new workspace and has data (workspace or brand) */}
            {!isNewWorkspace && (brand || currentWorkspace) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditMode) {
                    // Cancel - revert changes
                    if (currentWorkspace) {
                      setName(currentWorkspace.name);
                      setDomain(currentWorkspace.domain);
                      setIpAddress(currentWorkspace.ipAddress);
                      setModels(currentWorkspace.models);
                    } else if (brand) {
                      // Revert to brand data
                      setName(brand.name || "");
                      setDomain(brand.website || brand.domain || "");
                      setIpAddress(mapLocationToIpAddress(brand.location || brand.country || ""));
                    }
                    setIsEditMode(false);
                  } else {
                    // Show warning dialog before enabling edit mode
                    setShowEditWarning(true);
                  }
                }}
                className="gap-2"
                disabled={isUpdatingBrand}
              >
                <Edit2 className="w-4 h-4" />
                {isEditMode ? "Cancel" : isUpdatingBrand ? "Updating..." : "Edit"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-2xl"
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-medium">
              Domain
            </Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="max-w-2xl"
              disabled={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-address" className="text-sm font-medium">
              IP Address
            </Label>
            <Select 
              value={ipAddress} 
              onValueChange={setIpAddress}
              disabled={!isEditMode}
            >
              <SelectTrigger id="ip-address" className="max-w-2xl">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="india">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇮🇳</span>
                    <span>India</span>
                  </div>
                </SelectItem>
                <SelectItem value="usa">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇺🇸</span>
                    <span>United States</span>
                  </div>
                </SelectItem>
                <SelectItem value="uk">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇬🇧</span>
                    <span>United Kingdom</span>
                  </div>
                </SelectItem>
                <SelectItem value="canada">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇨🇦</span>
                    <span>Canada</span>
                  </div>
                </SelectItem>
                <SelectItem value="australia">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇦🇺</span>
                    <span>Australia</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Models</Label>
            <div className="space-y-3">
              {/* ChatGPT */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={chatgptIcon} alt="ChatGPT" className="w-5 h-5" />
                  <span className="text-sm font-medium">ChatGPT</span>
                </div>
                <Switch
                  checked={models.chatgpt}
                  onCheckedChange={() => handleModelToggle("chatgpt")}
                  disabled={!isEditMode}
                />
              </div>

              {/* GPT 4o Search */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={chatgptIcon} alt="GPT 4o Search" className="w-5 h-5" />
                  <span className="text-sm font-medium">GPT 4o Search</span>
                </div>
                <Switch
                  checked={models.gpt4oSearch}
                  onCheckedChange={() => handleModelToggle("gpt4oSearch")}
                  disabled={!isEditMode}
                />
              </div>

              {/* Perplexity */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={perplexityIcon} alt="Perplexity" className="w-5 h-5" />
                  <span className="text-sm font-medium">Perplexity</span>
                </div>
                <Switch
                  checked={models.perplexity}
                  onCheckedChange={() => handleModelToggle("perplexity")}
                  disabled={!isEditMode}
                />
              </div>

              {/* AI Overview */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={googleAiStudioIcon} alt="AI Overview" className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Overview</span>
                </div>
                <Switch
                  checked={models.aiOverview}
                  onCheckedChange={() => handleModelToggle("aiOverview")}
                  disabled={!isEditMode}
                />
              </div>

              {/* AI Mode */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={googleAiStudioIcon} alt="AI Mode" className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Mode</span>
                </div>
                <Switch
                  checked={models.aiMode}
                  onCheckedChange={() => handleModelToggle("aiMode")}
                  disabled={!isEditMode}
                />
              </div>

              {/* Gemini */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={geminiIcon} alt="Gemini" className="w-5 h-5" />
                  <span className="text-sm font-medium">Gemini</span>
                </div>
                <Switch
                  checked={models.gemini}
                  onCheckedChange={() => handleModelToggle("gemini")}
                  disabled={!isEditMode}
                />
              </div>

              {/* Claude Sonnet 4 */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img src={claudeIcon} alt="Claude Sonnet 4" className="w-5 h-5" />
                  <span className="text-sm font-medium">Claude Sonnet 4</span>
                </div>
                <Switch
                  checked={models.claudeSonnet4}
                  onCheckedChange={() => handleModelToggle("claudeSonnet4")}
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </div>

          {/* Show Save button only when editing or creating new workspace */}
          {(isEditMode || !isEditing) && (
            <div className="pt-2">
              <Button
                onClick={handleSave}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Export Chat History</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and download a complete archive of all chat messages as a CSV file.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-8 border-2 border-dashed border-border rounded-lg px-6">
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No export generated yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the button to generate your first export
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateExport}
              variant="outline"
              className="ml-4"
            >
              Generate export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Popup (Pro upgrade) */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Unlock Multiple Workspaces</DialogTitle>
              <DialogDescription className="text-white/80">
                This feature is available on Pro plans. Choose a plan below to continue.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-5">
            <div className="rounded-xl border border-border/50 bg-background">
              <div className="p-4 sm:p-6 max-h-[60vh] overflow-auto">
                <PricingSection />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-border/50 px-4 sm:px-6 py-4">
                <Button variant="outline" onClick={() => setShowPricing(false)}>Maybe later</Button>
                <Button onClick={() => window.location.assign('/dashboard/subscription')}>Go to Billing</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Warning Dialog */}
      <AlertDialog open={showEditWarning} onOpenChange={setShowEditWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">Warning: Data Will Be Cleared</AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="font-medium text-foreground">
                Editing the workspace will permanently delete all data from your dashboard, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                <li>All prompts and their rankings</li>
                <li>Competitor data and analysis</li>
                <li>Sources and references</li>
                <li>Tags and categories</li>
                <li>All other dashboard data</li>
              </ul>
              <p className="text-destructive font-medium pt-2">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditWarning(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Clear All Data & Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkspacePage;
