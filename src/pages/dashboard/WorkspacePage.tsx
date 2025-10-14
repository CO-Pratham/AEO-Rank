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
import { Home, Save, FileText } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PricingSection from "@/components/PricingSection";

import chatgptIcon from "@/assets/logos/chatgpt-icon.svg";
import geminiIcon from "@/assets/logos/google-gemini-icon.svg";
import claudeIcon from "@/assets/logos/claude-ai-icon.svg";
import perplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import googleAiStudioIcon from "@/assets/logos/google-ai-studio-icon.svg";

const WorkspacePage = () => {
  const { currentWorkspace, addWorkspace, updateWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isNewWorkspace = searchParams.get('new') === 'true';
  const isLocked = searchParams.get('locked') === '1';
  const [showPricing, setShowPricing] = useState(isLocked);
  
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [models, setModels] = useState({
    chatgpt: true,
    gpt4oSearch: false,
    perplexity: true,
    aiOverview: true,
    aiMode: false,
    gemini: false,
    claudeSonnet4: false,
  });

  useEffect(() => {
    if (currentWorkspace && !isNewWorkspace) {
      setName(currentWorkspace.name);
      setDomain(currentWorkspace.domain);
      setIpAddress(currentWorkspace.ipAddress);
      setModels(currentWorkspace.models);
      setIsEditing(true);
    } else {
      setName("");
      setDomain("");
      setIpAddress("");
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
    }
  }, [currentWorkspace, isNewWorkspace]);

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

  const handleSave = () => {
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
    } else {
      addWorkspace(workspaceData);
      toast({
        title: "Workspace Created",
        description: `${name} has been created successfully.`,
      });
      setIsEditing(true);
    }
  };

  const handleGenerateExport = () => {
    console.log("Generating chat history export...");
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2.5">
        <Home className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Workspace</h1>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            {isEditing && !isNewWorkspace ? "Edit Workspace" : "Create New Workspace"}
          </CardTitle>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-address" className="text-sm font-medium">
              IP Address
            </Label>
            <Select value={ipAddress} onValueChange={setIpAddress}>
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
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSave}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
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
    </div>
  );
};

export default WorkspacePage;
