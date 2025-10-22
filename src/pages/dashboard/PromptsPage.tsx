import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  MessageSquare,
  Sparkles,
  Plus,
  Tag,
  Power,
  Trash2,
  FileText,
  Globe2,
  Upload,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { incrementTagMentions } from "@/store/slices/tagsSlice";

interface Prompt {
  id: number;
  prompt: string;
  visibility: string;
  sentiment: string;
  position: string;
  mentions: { platform: string; color: string }[];
  volume: number;
  volumeValue: number;
  tags: string[];
  location: string;
  suggestedAt?: string;
  addedAt?: Date;
}

const PromptsPage = () => {
  const dispatch = useAppDispatch();
  const availableTags = useAppSelector((state) => state.tags.tags);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [modelFilter, setModelFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [addPromptTab, setAddPromptTab] = useState("single");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [selectedInactiveIds, setSelectedInactiveIds] = useState<number[]>([]);
  const [activePrompts, setActivePrompts] = useState<Prompt[]>([]);
  const [inactivePrompts, setInactivePrompts] = useState<Prompt[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestingLoading, setSuggestingLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // API Functions - Backend developer should replace these endpoints
  const fetchActivePrompts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "https://aeotest-production.up.railway.app/prompt/meta/get",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }

      const data = await response.json();
      console.log("Active Prompts API Response:", data);

      // Process the data to match the expected format
      const processedPrompts = Array.isArray(data)
        ? data.map((item) => {
            // Convert mentions object to array format for UI
            const mentionsArray =
              item.mentions && typeof item.mentions === "object"
                ? Object.entries(item.mentions)
                    .map(([platform, count]) => {
                      const platformColors: Record<string, string> = {
                        ChatGPT: "#10a37f",
                        Claude: "#cc785c",
                        Gemini: "#4285f4",
                        Perplexity: "#1fb6ff",
                        Freshworks: "#ff6b6b",
                        Salesforce: "#00a1e0",
                        Zoho: "#e42527",
                      };

                      return {
                        platform,
                        color: platformColors[platform] || "#6b7280",
                        count: Number(count) || 0,
                      };
                    })
                    .filter((m) => m.count > 0) // Only show platforms with mentions > 0
                : [];

            // Process tags - handle null, array, or string
            const tagsArray = item.tags
              ? Array.isArray(item.tags)
                ? item.tags
                : typeof item.tags === "string"
                ? item.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : []
              : [];

            // Store actual volume value for display
            const volumeValue = Number(item.volume) || 0;
            const volumeBars = Math.min(
              Math.max(Math.ceil(volumeValue / 100), 0),
              5
            );

            return {
              id: item.id,
              prompt: item.prompt || "No prompt text",
              // Backend should provide these fields - using defaults for now
              visibility:
                item.visibility !== undefined ? `${item.visibility}%` : "—",
              sentiment: item.sentiment || "—",
              position: item.position ? `#${item.position}` : "—",
              mentions: mentionsArray,
              volume: volumeBars,
              volumeValue: volumeValue,
              tags: tagsArray,
              addedAt: item.added ? new Date(item.added) : new Date(),
              location: item.location || "—",
            };
          })
        : [];

      console.log("Processed prompts:", processedPrompts);
      console.log("Sample processed prompt:", processedPrompts[0]); // Debug first item
      setActivePrompts(processedPrompts);
    } catch (error) {
      console.error("Error fetching active prompts:", error);
      setActivePrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (promptData: Omit<Prompt, "id">) => {
    try {
      const token = localStorage.getItem("accessToken");

      // Optimistically add to UI while we await the backend
      const optimistic: Prompt = {
        ...promptData,
        id: Date.now(),
      };
      setActivePrompts((prev) => [optimistic, ...prev]);

      // Map country code to full name if needed
      const countryCodeToName: Record<string, string> = {
        IN: "India",
        US: "United States",
        GB: "United Kingdom",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
      };
      const fullCountry =
        countryCodeToName[(promptData.location as string) || ""] ||
        (promptData.location as string) ||
        "";

      // Use the correct endpoint for adding prompts
      const response = await fetch(
        "https://aeotest-production.up.railway.app/prompt/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify({
            prompt: promptData.prompt,
            tags: promptData.tags,
            country: fullCountry,
            location: fullCountry,
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          "Backend add prompt failed, keeping optimistic item. Status:",
          response.status
        );
        // Keep the optimistic item in the UI
        return optimistic;
      }

      const data = await response.json();
      console.log("Prompt creation response:", data);

      // Map backend response to our Prompt shape safely
      const created: Prompt = {
        id: data.id ?? optimistic.id,
        prompt: data.prompt ?? promptData.prompt,
        visibility:
          data.visibility !== undefined
            ? `${data.visibility}%`
            : promptData.visibility,
        sentiment: data.sentiment ?? promptData.sentiment,
        position: data.position ? `#${data.position}` : promptData.position,
        mentions: Array.isArray(data.mentions) ? data.mentions : [],
        volume: data.volume !== undefined ? data.volume : promptData.volume,
        volumeValue:
          typeof data.volume === "number"
            ? data.volume
            : (promptData as any).volumeValue ?? 0,
        tags: Array.isArray(data.tags) ? data.tags : promptData.tags,
        addedAt: data.addedAt
          ? new Date(data.addedAt)
          : promptData.addedAt ?? new Date(),
        location: data.country ?? data.location ?? fullCountry,
      };

      // Replace optimistic with backend-confirmed version
      setActivePrompts((prev) => {
        const withoutOptimistic = prev.filter((p) => p.id !== optimistic.id);
        return [created, ...withoutOptimistic];
      });

      return created;
    } catch (error) {
      console.error("Error creating prompt:", error);
      // In case of error, keep the optimistic item
      throw error;
    }
  };

  // Fetch inactive prompts
  const fetchInactivePrompts = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "https://aeotest-production.up.railway.app/prompt/inactive",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch inactive prompts: ${response.status}`);
      }

      const data = await response.json();
      console.log("Inactive Prompts API Response:", data);

      // Process the data similar to active prompts
      const processedPrompts = Array.isArray(data)
        ? data.map((item) => {
            const mentionsArray =
              item.mentions && typeof item.mentions === "object"
                ? Object.entries(item.mentions)
                    .filter(([_, value]) => value === true)
                    .map(([platform]) => ({
                      platform:
                        platform.charAt(0).toUpperCase() + platform.slice(1),
                      color: getPlatformColor(platform),
                    }))
                : [];

            const tagsArray = item.tags
              ? Array.isArray(item.tags)
                ? item.tags
                : typeof item.tags === "string"
                ? item.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : []
              : [];

            const volumeValue = Number(item.volume) || 0;
            const volumeBars = Math.min(
              Math.max(Math.ceil(volumeValue / 100), 0),
              5
            );

            return {
              id: item.id,
              prompt: item.prompt || "No prompt text",
              visibility:
                item.visibility !== undefined ? `${item.visibility}%` : "—",
              sentiment: item.sentiment || "—",
              position: item.position ? `#${item.position}` : "—",
              mentions: mentionsArray,
              volume: volumeBars,
              volumeValue: volumeValue,
              tags: tagsArray,
              addedAt: item.added ? new Date(item.added) : new Date(),
              location: item.location || "—",
            };
          })
        : [];

      console.log("Processed inactive prompts:", processedPrompts);
      setInactivePrompts(processedPrompts);
    } catch (error) {
      console.error("Error fetching inactive prompts:", error);
      setInactivePrompts([]);
    }
  };

  // Helper function to get platform color
  const getPlatformColor = (platform: string) => {
    const colorMap: Record<string, string> = {
      chatgpt: "#10a37f",
      claude: "#d97757",
      gemini: "#4285f4",
      perplexity: "#7c3aed",
      copilot: "#0078d4",
    };
    return colorMap[platform.toLowerCase()] || "#6b7280";
  };

  // Load prompts on component mount and when prompts change
  useEffect(() => {
    fetchActivePrompts();
    fetchInactivePrompts();
  }, []);

  const renderVolumeIndicator = (volume: number) => {
    const maxBars = 5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(maxBars)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i < volume ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Prompt,Volume\n" +
      activePrompts.map((p) => `"${p.prompt}",${p.volume}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `prompts_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPrompt = async () => {
    if (!newPromptText.trim()) {
      alert("Please enter a prompt");
      return;
    }

    try {
      // Generate unique ID for the prompt
      const promptId = Date.now();

      // Create new prompt object
      const newPromptData = {
        prompt: newPromptText,
        visibility: "0%",
        sentiment: "—",
        position: "—",
        mentions: [],
        volume: 0,
        volumeValue: 0,
        tags: selectedTags,
        // Keep UI state code value, but createPrompt will map to full country name
        location: selectedCountry,
        addedAt: new Date(),
      };

      // Create prompt locally
      await createPrompt(newPromptData);

      // Increment mentions for each tag used in this prompt
      if (selectedTags.length > 0) {
        dispatch(
          incrementTagMentions({ tagNames: selectedTags, promptId: promptId })
        );
      }

      // Reset form
      setNewPromptText("");
      setSelectedTags([]);
      setSelectedCountry("IN");
      setAddDialogOpen(false);

      // Refresh the prompts list
      await fetchActivePrompts();

      // Show success message
      alert("Prompt added successfully!");
    } catch (error) {
      console.error("Error adding prompt:", error);
      alert("Failed to add prompt. Please try again.");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const filteredActivePrompts = activePrompts.filter((p) =>
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInactivePrompts = inactivePrompts.filter((p) =>
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuggestedPrompts = suggestedPrompts.filter((p) =>
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPromptIds(filteredActivePrompts.map((p) => p.id));
    } else {
      setSelectedPromptIds([]);
    }
  };

  const handleSelectPrompt = (promptId: number, checked: boolean) => {
    if (checked) {
      setSelectedPromptIds([...selectedPromptIds, promptId]);
    } else {
      setSelectedPromptIds(selectedPromptIds.filter((id) => id !== promptId));
    }
  };

  const handleAssignTags = () => {
    alert(`Assign tags to ${selectedPromptIds.length} selected prompt(s)`);
  };

  const handleDeactivate = async () => {
    if (
      !confirm(
        `Are you sure you want to deactivate ${selectedPromptIds.length} prompt(s)?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

   
      const response = await fetch(
        "https://aeotest-production.up.railway.app/prompt/state",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt_ids: selectedPromptIds,
            is_active: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to deactivate prompts: ${response.status}`);
      }

      console.log("Prompts deactivated successfully");

      // Refresh both active and inactive prompts from server
      await Promise.all([fetchActivePrompts(), fetchInactivePrompts()]);
      setSelectedPromptIds([]);
    } catch (error) {
      console.error("Error deactivating prompts:", error);
      alert("Failed to deactivate prompts. Please try again.");
    }
  };

  const handleSelectAllInactive = (checked: boolean) => {
    if (checked) {
      setSelectedInactiveIds(filteredInactivePrompts.map((p) => p.id));
    } else {
      setSelectedInactiveIds([]);
    }
  };

  const handleSelectInactive = (promptId: number, checked: boolean) => {
    if (checked) {
      setSelectedInactiveIds([...selectedInactiveIds, promptId]);
    } else {
      setSelectedInactiveIds(
        selectedInactiveIds.filter((id) => id !== promptId)
      );
    }
  };

  const handleAssignTagsInactive = () => {
    alert(`Assign tags to ${selectedInactiveIds.length} selected prompt(s)`);
  };

  const handleActivate = async () => {
    if (
      !confirm(
        `Are you sure you want to activate ${selectedInactiveIds.length} prompt(s)?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      // Call API to change prompt state to active
      const response = await fetch(
        "https://aeotest-production.up.railway.app/prompt/state",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt_ids: selectedInactiveIds,
            is_active: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to activate prompts: ${response.status}`);
      }

      console.log("Prompts activated successfully");

      // Refresh both active and inactive prompts from server
      await Promise.all([fetchActivePrompts(), fetchInactivePrompts()]);
      setSelectedInactiveIds([]);
    } catch (error) {
      console.error("Error activating prompts:", error);
      alert("Failed to activate prompts. Please try again.");
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to permanently delete ${selectedInactiveIds.length} prompt(s)?`
      )
    ) {
      setInactivePrompts(
        inactivePrompts.filter((p) => !selectedInactiveIds.includes(p.id))
      );
      setSelectedInactiveIds([]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const processBulkUpload = async () => {
    if (!uploadedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      const text = await uploadedFile.text();
      console.log("File content:", text);

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);

      if (lines.length === 0) {
        alert("The CSV file is empty.");
        return;
      }

      const prompts = [];

      for (const line of lines) {
        // Simple comma split - handle both quoted and unquoted
        const parts = line.split(",");

        if (parts.length >= 1) {
          const promptText = parts[0].replace(/^"|"$/g, "").trim();

          if (promptText && promptText.toLowerCase() !== "prompt") {
            const tagsText = parts[1]
              ? parts[1].replace(/^"|"$/g, "").trim()
              : "";
            const tags = tagsText
              ? tagsText
                  .split(";")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];

            prompts.push({
              prompt: promptText,
              visibility: "0%",
              sentiment: "—",
              position: "—",
              mentions: [],
              volume: 0,
              tags,
              addedAt: new Date(),
            });
          }
        }
      }

      console.log("Parsed prompts:", prompts);

      if (prompts.length === 0) {
        alert(
          "No valid prompts found. Make sure your CSV has prompts in the first column."
        );
        return;
      }

      for (const promptData of prompts) {
        await createPrompt(promptData);
        if (promptData.tags.length > 0) {
          incrementTagMentions(promptData.tags);
        }
      }

      alert(`Successfully added ${prompts.length} prompts`);
      setUploadedFile(null);
      setAddDialogOpen(false);
    } catch (error) {
      console.error("CSV processing error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <LoadingScreen text="Loading prompts data..." />;
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Prompts</h1>
          <span className="text-sm text-muted-foreground">
            · {activePrompts.length} / 25 Prompts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="chatgpt">ChatGPT</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-black hover:bg-black/90 text-white h-9"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Prompt
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <div className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-background"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="suggested"
              className="data-[state=active]:bg-background"
            >
              Suggested
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="data-[state=active]:bg-background"
            >
              Inactive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {activePrompts.length > 0 ? (
              <>
                <div className="flex items-center justify-end gap-3 mb-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Card className="border-border/40">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="font-medium text-xs w-[40px] sticky left-0 bg-background z-10">
                                <Checkbox
                                  checked={
                                    selectedPromptIds.length ===
                                      filteredActivePrompts.length &&
                                    filteredActivePrompts.length > 0
                                  }
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>
                              <TableHead className="font-medium text-xs min-w-[300px] sticky left-[40px] bg-background z-10">
                                Prompt
                              </TableHead>

                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                Mentions
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>Volume</span>
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 py-0"
                                  >
                                    Beta
                                  </Badge>
                                </div>
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                Tags
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                Location
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                Added
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                  <TableCell className="py-3">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </TableCell>

                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-5 h-5 bg-gray-200 rounded-md animate-pulse"
                                        ></div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-1 h-3 bg-gray-200 rounded-sm animate-pulse"
                                        ></div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-8"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : filteredActivePrompts.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={10}
                                  className="text-center py-12 text-muted-foreground"
                                >
                                  No prompts found. Add a prompt to get started.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredActivePrompts.map((prompt) => (
                                <TableRow
                                  key={prompt.id}
                                  className="hover:bg-muted/50"
                                >
                                  <TableCell className="py-3 sticky left-0 bg-background">
                                    <Checkbox
                                      checked={selectedPromptIds.includes(
                                        prompt.id
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleSelectPrompt(
                                          prompt.id,
                                          checked as boolean
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="py-3 sticky left-[40px] bg-background">
                                    <button
                                      onClick={() => {
                                        console.log(
                                          "Navigating to prompt:",
                                          prompt.id
                                        );
                                        navigate(
                                          `/dashboard/prompts/${prompt.id}`
                                        );
                                      }}
                                      className="text-sm text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                                    >
                                      {prompt.prompt}
                                    </button>
                                  </TableCell>

                                  <TableCell className="py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      {prompt.mentions.map((mention, idx) => (
                                        <Avatar
                                          key={idx}
                                          className="w-5 h-5 rounded-md"
                                        >
                                          <AvatarFallback
                                            className="rounded-md text-white text-[10px] font-semibold"
                                            style={{
                                              backgroundColor: mention.color,
                                            }}
                                          >
                                            {mention.platform[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm font-medium">
                                      {prompt.volumeValue
                                        ? prompt.volumeValue.toLocaleString()
                                        : "0"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    {prompt.tags.length > 0 ? (
                                      <div className="flex items-center justify-center gap-1 flex-wrap">
                                        {prompt.tags.map((tag, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground"
                                      >
                                        Add tags
                                      </Button>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm text-muted-foreground">
                                      {prompt.location !== "—"
                                        ? prompt.location
                                        : "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm text-muted-foreground">
                                      {prompt.addedAt
                                        ? getTimeAgo(prompt.addedAt)
                                        : "—"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      No prompts yet. You need to setup prompts to track first.
                    </p>
                    <Button
                      className="bg-black hover:bg-black/90 text-white h-9"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="mt-0">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  <strong>Suggested prompts.</strong> Expand your brand's
                  presence with suggested prompts.
                </span>
              </div>
              <Button variant="outline" size="sm" className="bg-white h-8">
                Suggest more
              </Button>
            </div>

            <Card className="border-border/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium text-xs w-[50%]">
                        Suggested Prompt
                      </TableHead>
                      <TableHead className="font-medium text-xs text-center w-[15%]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Volume</span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 py-0"
                          >
                            Beta
                          </Badge>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-xs text-center w-[15%]">
                        Suggested At
                      </TableHead>
                      <TableHead className="w-[20%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuggestedPrompts.map((prompt) => (
                      <TableRow key={prompt.id} className="hover:bg-muted/50">
                        <TableCell className="py-3">
                          <button
                            onClick={() => {
                              console.log(
                                "Navigating to prompt (suggested):",
                                prompt.id
                              );
                              navigate(`/dashboard/prompts/${prompt.id}`);
                            }}
                            className="text-sm text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                          >
                            {prompt.prompt}
                          </button>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <span className="text-sm font-medium">
                            {prompt.volumeValue
                              ? prompt.volumeValue.toLocaleString()
                              : "0"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <span className="text-sm text-muted-foreground">
                            {prompt.suggestedAt}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              Reject
                            </Button>
                            <Button className="bg-black hover:bg-black/90 text-white h-8 text-xs">
                              Track
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="mt-0">
            {inactivePrompts.length > 0 ? (
              <Card className="border-border/40">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-medium text-xs w-[40px] sticky left-0 bg-background z-10">
                              <Checkbox
                                checked={
                                  selectedInactiveIds.length ===
                                    filteredInactivePrompts.length &&
                                  filteredInactivePrompts.length > 0
                                }
                                onCheckedChange={handleSelectAllInactive}
                              />
                            </TableHead>
                            <TableHead className="font-medium text-xs min-w-[300px] sticky left-[40px] bg-background z-10">
                              Prompt
                            </TableHead>

                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              Mentions
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              <div className="flex items-center justify-center gap-1.5">
                                <span>Volume</span>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 py-0"
                                >
                                  Beta
                                </Badge>
                              </div>
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              Tags
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              Location
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              Added
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInactivePrompts.map((prompt) => (
                            <TableRow
                              key={prompt.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="py-3 sticky left-0 bg-background">
                                <Checkbox
                                  checked={selectedInactiveIds.includes(
                                    prompt.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleSelectInactive(
                                      prompt.id,
                                      checked as boolean
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="py-3 sticky left-[40px] bg-background">
                                <p className="text-sm">{prompt.prompt}</p>
                              </TableCell>

                              <TableCell className="py-3">
                                <div className="flex items-center justify-center gap-1">
                                  {prompt.mentions.map((mention, idx) => (
                                    <Avatar
                                      key={idx}
                                      className="w-5 h-5 rounded-md"
                                    >
                                      <AvatarFallback
                                        className="rounded-md text-white text-[10px] font-semibold"
                                        style={{
                                          backgroundColor: mention.color,
                                        }}
                                      >
                                        {mention.platform[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm font-medium">
                                  {prompt.volumeValue
                                    ? prompt.volumeValue.toLocaleString()
                                    : "0"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                {prompt.tags.length > 0 ? (
                                  <div className="flex items-center justify-center gap-1 flex-wrap">
                                    {prompt.tags.map((tag, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground"
                                  >
                                    Add tags
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm text-muted-foreground">
                                  {prompt.addedAt
                                    ? getTimeAgo(prompt.addedAt)
                                    : "—"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No inactive prompts
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Bottom Action Bar for Active Prompts */}
      {selectedPromptIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
          <div className="bg-white border border-border shadow-lg rounded-t-lg px-6 py-3 flex items-center gap-8">
            <span className="text-sm font-medium">
              {selectedPromptIds.length} Selected
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssignTags}
                className="h-9"
              >
                <Tag className="w-4 h-4 mr-2" />
                Assign tags
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeactivate}
                className="h-9 text-red-600 hover:text-red-700"
              >
                <Power className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar for Inactive Prompts */}
      {selectedInactiveIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
          <div className="bg-white border border-border shadow-lg rounded-t-lg px-6 py-3 flex items-center gap-8">
            <span className="text-sm font-medium">
              {selectedInactiveIds.length} Selected
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssignTagsInactive}
                className="h-9"
              >
                <Tag className="w-4 h-4 mr-2" />
                Assign tags
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleActivate}
                className="h-9 text-green-600 hover:text-green-700"
              >
                <Power className="w-4 h-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="h-9 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prompt Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-8 py-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            <DialogHeader className="relative space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Add New Prompt
                  </DialogTitle>
                  <p className="text-sm text-purple-100 mt-1">
                    Track prompts and monitor their performance
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                addPromptTab === "single"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              onClick={() => setAddPromptTab("single")}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Add Prompt
              </div>
              {addPromptTab === "single" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
              )}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                addPromptTab === "bulk"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              onClick={() => setAddPromptTab("bulk")}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </div>
              {addPromptTab === "bulk" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
              )}
            </button>
          </div>

          {addPromptTab === "single" ? (
            <div className="px-8 py-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
              <div className="space-y-6">
                {/* Prompt Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="prompt"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    Prompt Text
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="prompt"
                      placeholder="What is the best insurance? (Each line will be a separate prompt)"
                      value={newPromptText}
                      onChange={(e) => setNewPromptText(e.target.value)}
                      rows={4}
                      maxLength={200}
                      className="resize-none text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-1">
                      <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                      Create competitive prompts without mentioning your brand
                    </p>
                    <span className="text-xs font-medium text-gray-500">
                      {newPromptText.length}/200
                    </span>
                  </div>
                </div>

                {/* Country Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="country"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <Globe2 className="w-4 h-4 text-blue-600" />
                    IP Address Region
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger
                      id="country"
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                    >
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇳</span>
                          <span>India</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇳</span>
                          <span>India</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="US">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇺🇸</span>
                          <span>United States</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="GB">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇬🇧</span>
                          <span>United Kingdom</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    Select the region for prompt analysis
                  </p>
                </div>

                {/* Tags Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Tags
                    <span className="text-xs font-normal text-gray-500">
                      (Optional)
                    </span>
                  </Label>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      {selectedTags.map((tagName, idx) => {
                        const tagColor =
                          availableTags.find((t) => t.name === tagName)
                            ?.color || "#3b82f6";
                        return (
                          <Badge
                            key={idx}
                            className="text-xs px-3 py-1.5 font-medium shadow-sm"
                            style={{
                              backgroundColor: tagColor + "20",
                              color: tagColor,
                              border: `1px solid ${tagColor}40`,
                            }}
                          >
                            {tagName}
                            <button
                              onClick={() => handleRemoveTag(tagName)}
                              className="ml-2 hover:opacity-70 transition-opacity"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Available Tags - Quick Select */}
                  {availableTags.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        Click to add tags:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        {availableTags
                          .filter((tag) => !selectedTags.includes(tag.name))
                          .map((tag) => (
                            <Badge
                              key={tag.id}
                              className="cursor-pointer text-xs px-3 py-1.5 hover:shadow-md transition-all hover:scale-105"
                              style={{
                                backgroundColor: tag.color + "15",
                                color: tag.color,
                                border: `1px solid ${tag.color}30`,
                              }}
                              onClick={() => {
                                if (!selectedTags.includes(tag.name)) {
                                  setSelectedTags([...selectedTags, tag.name]);
                                }
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-700">
                      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                        💡 No tags available yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate("/dashboard/tags?createNew=true")
                        }
                        className="h-8 text-xs bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-400 dark:border-blue-600"
                      >
                        <Plus className="w-3 h-3 mr-1.5" />
                        Create Your First Tag
                      </Button>
                    </div>
                  )}

                  {/* Create New Tag Button */}
                  {availableTags.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/tags?createNew=true")}
                      className="w-full h-9 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-300 dark:border-blue-700 hover:border-blue-400"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create New Tag
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
                <DialogFooter className="gap-3 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    className="h-11 px-6 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPrompt}
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prompt
                  </Button>
                </DialogFooter>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4">
                  <svg
                    className="w-32 h-32 text-muted-foreground/20"
                    viewBox="0 0 200 200"
                    fill="none"
                  >
                    <rect
                      x="40"
                      y="40"
                      width="120"
                      height="80"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <rect
                      x="60"
                      y="60"
                      width="30"
                      height="40"
                      fill="currentColor"
                      opacity="0.1"
                    />
                    <rect
                      x="95"
                      y="60"
                      width="30"
                      height="40"
                      fill="currentColor"
                      opacity="0.15"
                    />
                    <rect
                      x="130"
                      y="60"
                      width="30"
                      height="40"
                      fill="currentColor"
                      opacity="0.1"
                    />
                    <path
                      d="M50 135 L90 135"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M100 135 L140 135"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  CSV format: prompt,tags (tags separated by semicolons)
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  Example: "What is the best insurance?","insurance;comparison"
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />

                <div
                  className={`w-full border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Download className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your CSV file here, or{" "}
                      <span className="text-blue-600 underline cursor-pointer">
                        click to browse
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported format: CSV files only
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    setUploadedFile(null);
                  }}
                >
                  Cancel
                </Button>
                {uploadedFile && (
                  <Button
                    onClick={processBulkUpload}
                    className="bg-black hover:bg-black/90 text-white"
                  >
                    Upload Prompts
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptsPage;
