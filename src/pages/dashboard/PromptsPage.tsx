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
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/hooks/use-toast";
import { incrementTagMentions } from "@/store/slices/tagsSlice";
import { 
  fetchActivePrompts,
  fetchInactivePrompts,
  fetchSuggestedPrompts,
  createPrompt,
  updatePromptTags,
  deactivatePrompts as deactivatePromptsThunk,
  activatePrompts as activatePromptsThunk,
  setSelectedPromptIds,
  setSelectedInactiveIds,
  deleteInactivePrompts,
  type Prompt 
} from "@/store/slices/promptsSlice";
import { getFaviconUrl } from "@/utils/logoUtils";
import {
  PLATFORM_DOMAINS,
  getDomainForBrand,
  getCountryFlag,
  getTimeAgo,
  sortPromptsByDate,
  parseCSVLine,
} from "@/utils/promptUtils";

const PromptsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redux state
  const availableTags = useAppSelector((state) => state.tags.tags);
  const activePrompts = useAppSelector((state) => state.prompts.activePrompts);
  const inactivePrompts = useAppSelector((state) => state.prompts.inactivePrompts);
  const suggestedPrompts = useAppSelector((state) => state.prompts.suggestedPrompts);
  const loading = useAppSelector((state) => state.prompts.loading);
  const isAddingPrompt = useAppSelector((state) => state.prompts.isAddingPrompt);
  const isGeneratingSuggestions = useAppSelector((state) => state.prompts.isGeneratingSuggestions);
  const selectedPromptIds = useAppSelector((state) => state.prompts.selectedPromptIds);
  const selectedInactiveIds = useAppSelector((state) => state.prompts.selectedInactiveIds);
  
  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [modelFilter, setModelFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [addPromptTab, setAddPromptTab] = useState("single");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestingLoading, setSuggestingLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [currentPromptForTag, setCurrentPromptForTag] = useState<Prompt | null>(null);
  const [tagsToAssign, setTagsToAssign] = useState<string[]>([]);
  const [activeSortOrder, setActiveSortOrder] = useState<"asc" | "desc" | null>(null);
  const [inactiveSortOrder, setInactiveSortOrder] = useState<"asc" | "desc" | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load prompts on component mount
  useEffect(() => {
    dispatch(fetchActivePrompts());
    dispatch(fetchInactivePrompts());
    // Only load suggested prompts if we don't have any yet
    if (suggestedPrompts.length === 0) {
      dispatch(fetchSuggestedPrompts());
    }
  }, [dispatch, suggestedPrompts.length]);


  const handleExport = () => {
    // Create CSV header
    const header = "Prompt,Volume,Country,Tags,Mentions\n";
    
    // Get the currently filtered and sorted prompts based on active tab
    const promptsToExport = activeTab === "inactive" ? filteredInactivePrompts : filteredActivePrompts;
    
    // Check if there are prompts to export
    if (promptsToExport.length === 0) {
      toast({
        title: "No prompts to export",
        description: "There are no prompts available to export.",
        variant: "destructive",
      });
      return;
    }
    
    // Map prompts to CSV rows
    const rows = promptsToExport.map((p) => {
      // Format prompt text (escape quotes and wrap in quotes)
      const promptText = `"${(p.prompt || '').replace(/"/g, '""')}"`;
      
      // Format volume
      const volume = p.volumeValue || 0;
      
      // Format country (remove quotes if present)
      const country = `"${(p.location || '—').replace(/"/g, '""')}"`;
      
      // Format tags (join multiple tags with semicolons)
      const tags = p.tags && p.tags.length > 0 
        ? `"${p.tags.join('; ')}"` 
        : '""';
      
      // Format mentions (list all platforms with mentions)
      const mentions = p.mentions && p.mentions.length > 0
        ? `"${p.mentions.map(m => m.platform).join('; ')}"` 
        : '""';
      
      return `${promptText},${volume},${country},${tags},${mentions}`;
    }).join("\n");

    // Combine header and rows
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;

    // Create download link
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
      toast({
        title: "Prompt required",
        description: "Please enter a prompt text.",
        variant: "destructive",
      });
      return;
    }

    try {
      const promptId = Date.now();

      // Create new prompt object
      const newPromptData: Omit<Prompt, "id"> = {
        prompt: newPromptText,
        visibility: "0%",
        sentiment: "—",
        position: "—",
        mentions: [],
        volume: 0,
        volumeValue: 0,
        tags: selectedTags,
        location: selectedCountry,
        addedAt: new Date().toISOString(),
      };

      // Create prompt using Redux thunk
      await dispatch(createPrompt(newPromptData)).unwrap();

      // Increment mentions for each tag used in this prompt
      if (selectedTags.length > 0) {
        dispatch(
          incrementTagMentions({ tagNames: selectedTags, promptId })
        );
      }

      // Reset form
      setNewPromptText("");
      setSelectedTags([]);
      setSelectedCountry("India");
      setAddDialogOpen(false);

      // Refresh the prompts list
      await dispatch(fetchActivePrompts()).unwrap();

      // Show success message
      toast({
        title: "Prompt added",
        description: "Your prompt has been added successfully!",
      });
    } catch (error) {
      console.error("Error adding prompt:", error);
      toast({
        title: "Failed to add prompt",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleOpenTagDialog = (prompt: Prompt) => {
    setCurrentPromptForTag(prompt);
    setTagsToAssign(prompt.tags || []);
    setTagDialogOpen(true);
  };

  const handleAssignTagsToPrompt = async () => {
    if (!currentPromptForTag) return;

    try {
      // Update prompt tags using Redux thunk
      await dispatch(
        updatePromptTags({ 
          promptId: currentPromptForTag.id, 
          tags: tagsToAssign 
        })
      ).unwrap();

      // Increment tag mentions
      if (tagsToAssign.length > 0) {
        dispatch(
          incrementTagMentions({
            tagNames: tagsToAssign,
            promptId: currentPromptForTag.id,
          })
        );
      }

      toast({
        title: "Tags updated",
        description: "Tags have been updated successfully!",
      });
      setTagDialogOpen(false);
      setCurrentPromptForTag(null);
      setTagsToAssign([]);
    } catch (error) {
      console.error("Error updating tags:", error);
      toast({
        title: "Failed to update tags",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTagFromAssignment = (tagToRemove: string) => {
    setTagsToAssign(tagsToAssign.filter((tag) => tag !== tagToRemove));
  };

  const handleActiveSortToggle = () => {
    if (activeSortOrder === null) {
      setActiveSortOrder("desc"); // First click: newest first
    } else if (activeSortOrder === "desc") {
      setActiveSortOrder("asc"); // Second click: oldest first
    } else {
      setActiveSortOrder(null); // Third click: reset to default
    }
  };

  const handleInactiveSortToggle = () => {
    if (inactiveSortOrder === null) {
      setInactiveSortOrder("desc"); // First click: newest first
    } else if (inactiveSortOrder === "desc") {
      setInactiveSortOrder("asc"); // Second click: oldest first
    } else {
      setInactiveSortOrder(null); // Third click: reset to default
    }
  };

  const handleSuggestMore = async () => {
    try {
      await dispatch(fetchSuggestedPrompts()).unwrap();
      toast({
        title: "More suggestions loaded",
        description: "New suggested prompts have been added!",
      });
    } catch (error) {
      console.error("Error fetching more suggestions:", error);
      toast({
        title: "Failed to load suggestions",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };


  const filteredActivePrompts = sortPromptsByDate(
    activePrompts.filter((p) =>
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    activeSortOrder
  );

  const filteredInactivePrompts = sortPromptsByDate(
    inactivePrompts.filter((p) =>
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    inactiveSortOrder
  );

  const filteredSuggestedPrompts = suggestedPrompts.filter((p) =>
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(setSelectedPromptIds(filteredActivePrompts.map((p) => p.id)));
    } else {
      dispatch(setSelectedPromptIds([]));
    }
  };

  const handleSelectPrompt = (promptId: number, checked: boolean) => {
    if (checked) {
      dispatch(setSelectedPromptIds([...selectedPromptIds, promptId]));
    } else {
      dispatch(setSelectedPromptIds(selectedPromptIds.filter((id) => id !== promptId)));
    }
  };

  const handleAssignTags = () => {
    toast({
      title: "Assign tags",
      description: `Assign tags to ${selectedPromptIds.length} selected prompt(s)`,
    });
  };

  const handleDeactivate = () => {
    setConfirmDialog({
      open: true,
      title: "Deactivate Prompts",
      description: `Are you sure you want to deactivate ${selectedPromptIds.length} prompt(s)?`,
      onConfirm: async () => {
        try {
          await dispatch(deactivatePromptsThunk(selectedPromptIds)).unwrap();
          
          // Refresh both active and inactive prompts from server
          await Promise.all([
            dispatch(fetchActivePrompts()).unwrap(),
            dispatch(fetchInactivePrompts()).unwrap()
          ]);

          toast({
            title: "Success",
            description: `Successfully deactivated ${selectedPromptIds.length} prompt(s).`,
          });
        } catch (error) {
          console.error("Error deactivating prompts:", error);
          toast({
            title: "Error",
            description: "Failed to deactivate prompts. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleSelectAllInactive = (checked: boolean) => {
    if (checked) {
      dispatch(setSelectedInactiveIds(filteredInactivePrompts.map((p) => p.id)));
    } else {
      dispatch(setSelectedInactiveIds([]));
    }
  };

  const handleSelectInactive = (promptId: number, checked: boolean) => {
    if (checked) {
      dispatch(setSelectedInactiveIds([...selectedInactiveIds, promptId]));
    } else {
      dispatch(setSelectedInactiveIds(selectedInactiveIds.filter((id) => id !== promptId)));
    }
  };

  const handleAssignTagsInactive = () => {
    toast({
      title: "Assign tags",
      description: `Assign tags to ${selectedInactiveIds.length} selected prompt(s)`,
    });
  };

  const handleActivate = () => {
    setConfirmDialog({
      open: true,
      title: "Activate Prompts",
      description: `Are you sure you want to activate ${selectedInactiveIds.length} prompt(s)?`,
      onConfirm: async () => {
        try {
          await dispatch(activatePromptsThunk(selectedInactiveIds)).unwrap();
          
          // Refresh both active and inactive prompts from server
          await Promise.all([
            dispatch(fetchActivePrompts()).unwrap(),
            dispatch(fetchInactivePrompts()).unwrap()
          ]);

          toast({
            title: "Success",
            description: `Successfully activated ${selectedInactiveIds.length} prompt(s).`,
          });
        } catch (error) {
          console.error("Error activating prompts:", error);
          toast({
            title: "Error",
            description: "Failed to activate prompts. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Prompts",
      description: `Are you sure you want to permanently delete ${selectedInactiveIds.length} prompt(s)? This action cannot be undone.`,
      onConfirm: () => {
        dispatch(deleteInactivePrompts(selectedInactiveIds));
        dispatch(setSelectedInactiveIds([]));
        toast({
          title: "Deleted",
          description: `Successfully deleted ${selectedInactiveIds.length} prompt(s).`,
        });
      },
    });
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
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

  // UI Helper function for rendering volume indicator
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

  const processBulkUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file first.",
        variant: "destructive",
      });
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
        toast({
          title: "Empty file",
          description: "The CSV file is empty.",
          variant: "destructive",
        });
        return;
      }

      const prompts = [];
      let isFirstLine = true;

      for (const line of lines) {
        // Skip header line
        if (isFirstLine) {
          isFirstLine = false;
          // Check if it's a header line
          if (line.toLowerCase().includes("prompt") && line.toLowerCase().includes("volume")) {
            continue;
          }
        }

        // Use the parseCSVLine utility function
        const parts = parseCSVLine(line);

        if (parts.length >= 1) {
          const promptText = parts[0].trim();

          if (promptText && promptText.toLowerCase() !== "prompt") {
            // Parse CSV format: Prompt, Volume, Country, Tags, Mentions
            const volume = parts[1] ? parseInt(parts[1]) || 0 : 0;
            const country = parts[2] ? parts[2].trim() : "India"; // Default to India if not provided
            
            const tagsText = parts[3] ? parts[3].trim() : "";
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
              volumeValue: volume,
              tags,
              location: country,
              addedAt: new Date().toISOString(),
            });
          }
        }
      }

      console.log("Parsed prompts:", prompts);

      if (prompts.length === 0) {
        toast({
          title: "No valid prompts",
          description: "Make sure your CSV has prompts in the first column.",
          variant: "destructive",
        });
        return;
      }

      for (const promptData of prompts) {
        await dispatch(createPrompt(promptData)).unwrap();
        if (promptData.tags.length > 0) {
          dispatch(incrementTagMentions({ tagNames: promptData.tags, promptId: Date.now() }));
        }
      }

      toast({
        title: "Prompts added",
        description: `Successfully added ${prompts.length} prompt(s) from CSV.`,
      });
      setUploadedFile(null);
      setAddDialogOpen(false);
    } catch (error) {
      console.error("CSV processing error:", error);
      toast({
        title: "CSV processing failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: "destructive",
      });
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
            · {activePrompts.length + inactivePrompts.length} / 25 Prompts
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                              <TableHead className="font-medium text-xs min-w-[350px] sticky left-[40px] bg-background z-10 whitespace-nowrap">
                                Prompt
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[100px]">
                                Visibility
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[100px]">
                                Sentiment
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[100px]">
                                Position
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
                                <button
                                  onClick={handleActiveSortToggle}
                                  className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors w-full"
                                  title="Click to sort by date"
                                >
                                  <span>Added</span>
                                  {activeSortOrder === null && (
                                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                                  )}
                                  {activeSortOrder === "desc" && (
                                    <ArrowDown className="w-3 h-3 text-blue-600" />
                                  )}
                                  {activeSortOrder === "asc" && (
                                    <ArrowUp className="w-3 h-3 text-blue-600" />
                                  )}
                                </button>
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
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
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
                                    <div className="h-6 w-6 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : filteredActivePrompts.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={13}
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
                                  <TableCell className="py-3 sticky left-[40px] bg-background whitespace-nowrap">
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
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm font-semibold">
                                      {prompt.visibility && prompt.visibility !== "—" 
                                        ? prompt.visibility
                                        : "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    {(() => {
                                      const value = Number(prompt.sentiment);
                                      return !isNaN(value) && prompt.sentiment !== undefined && prompt.sentiment !== null ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                                          <span className="text-sm font-medium text-green-600">
                                            {Math.round(value)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">
                                          —
                                        </span>
                                      );
                                    })()}
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm font-medium">
                                      {prompt.position && prompt.position !== "—" 
                                        ? prompt.position
                                        : "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    {prompt.mentions && prompt.mentions.length > 0 ? (
                                      <div className="flex items-center justify-center gap-1">
                                        {prompt.mentions.map((mention, idx) => {
                                        const domain = getDomainForBrand(mention.platform);
                                        const faviconUrl = getFaviconUrl(domain, 32);
                                        return (
                                          <Avatar
                                            key={idx}
                                            className="w-5 h-5 rounded-md border border-gray-200"
                                            title={mention.platform}
                                          >
                                            <AvatarImage
                                              src={faviconUrl}
                                              alt={mention.platform}
                                              className="rounded-md"
                                            />
                                            <AvatarFallback
                                              className="rounded-md text-white text-[10px] font-semibold"
                                              style={{
                                                backgroundColor: mention.color,
                                              }}
                                            >
                                              {mention.platform[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                        );
                                      })}
                                    </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        —
                                      </span>
                                    )}
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
                                      <div 
                                        className="flex items-center justify-center gap-1 flex-wrap cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleOpenTagDialog(prompt)}
                                        title="Click to edit tags"
                                      >
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
                                        className="h-7 text-xs text-muted-foreground hover:text-blue-600"
                                        onClick={() => handleOpenTagDialog(prompt)}
                                      >
                                        Add tags
                                      </Button>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    {prompt.location !== "—" && getCountryFlag(prompt.location) ? (
                                      <span 
                                        className="text-2xl" 
                                        title={prompt.location}
                                        role="img"
                                        aria-label={prompt.location}
                                      >
                                        {getCountryFlag(prompt.location)}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        —
                                      </span>
                                    )}
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
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white h-8"
                onClick={handleSuggestMore}
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Suggest more"
                )}
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
                    {isGeneratingSuggestions && filteredSuggestedPrompts.length === 0 ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredSuggestedPrompts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No suggested prompts available yet. Click "Suggest more" to generate some!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuggestedPrompts.map((prompt) => (
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
                              {prompt.suggestedAt ? getTimeAgo(prompt.suggestedAt) : "—"}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="mt-0">
            {inactivePrompts.length > 0 ? (
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
                                  selectedInactiveIds.length ===
                                    filteredInactivePrompts.length &&
                                  filteredInactivePrompts.length > 0
                                }
                                onCheckedChange={handleSelectAllInactive}
                              />
                            </TableHead>
                            <TableHead className="font-medium text-xs min-w-[350px] sticky left-[40px] bg-background z-10">
                              Prompt
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[100px]">
                              Visibility
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[100px]">
                              Sentiment
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[100px]">
                              Position
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
                              <button
                                onClick={handleInactiveSortToggle}
                                className="flex items-center justify-center gap-1 hover:text-blue-600 transition-colors w-full"
                                title="Click to sort by date"
                              >
                                <span>Added</span>
                                {inactiveSortOrder === null && (
                                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                                )}
                                {inactiveSortOrder === "desc" && (
                                  <ArrowDown className="w-3 h-3 text-blue-600" />
                                )}
                                {inactiveSortOrder === "asc" && (
                                  <ArrowUp className="w-3 h-3 text-blue-600" />
                                )}
                              </button>
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
                              <TableCell className="py-3 sticky left-[40px] bg-background whitespace-nowrap">
                                <p className="text-sm">{prompt.prompt}</p>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm font-semibold">
                                  {prompt.visibility && prompt.visibility !== "—" 
                                    ? prompt.visibility
                                    : "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                {(() => {
                                  const value = Number(prompt.sentiment);
                                  return !isNaN(value) && prompt.sentiment !== undefined && prompt.sentiment !== null ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                                      <span className="text-sm font-medium text-green-600">
                                        {Math.round(value)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm font-medium">
                                  {prompt.position && prompt.position !== "—" 
                                    ? prompt.position
                                    : "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                {prompt.mentions && prompt.mentions.length > 0 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    {prompt.mentions.map((mention, idx) => {
                                    const domain = getDomainForBrand(mention.platform);
                                    const faviconUrl = getFaviconUrl(domain, 32);
                                    return (
                                      <Avatar
                                        key={idx}
                                        className="w-5 h-5 rounded-md border border-gray-200"
                                        title={mention.platform}
                                      >
                                        <AvatarImage
                                          src={faviconUrl}
                                          alt={mention.platform}
                                          className="rounded-md"
                                        />
                                        <AvatarFallback
                                          className="rounded-md text-white text-[10px] font-semibold"
                                          style={{
                                            backgroundColor: mention.color,
                                          }}
                                        >
                                          {mention.platform[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    );
                                  })}
                                </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
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
                                  <div 
                                    className="flex items-center justify-center gap-1 flex-wrap cursor-pointer hover:opacity-70 transition-opacity"
                                    onClick={() => handleOpenTagDialog(prompt)}
                                    title="Click to edit tags"
                                  >
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
                                    className="h-7 text-xs text-muted-foreground hover:text-blue-600"
                                    onClick={() => handleOpenTagDialog(prompt)}
                                  >
                                    Add tags
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3">
                                {prompt.location !== "—" && getCountryFlag(prompt.location) ? (
                                  <span 
                                    className="text-2xl" 
                                    title={prompt.location}
                                    role="img"
                                    aria-label={prompt.location}
                                  >
                                    {getCountryFlag(prompt.location)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
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
              </>
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
        <DialogContent className="max-w-2xl p-0 gap-0 bg-white">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
            <DialogTitle className="text-xl font-semibold text-black">
              Add New Prompt
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track prompts and monitor their performance
            </p>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            <button
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                addPromptTab === "single"
                  ? "text-black bg-white"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setAddPromptTab("single")}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Add Prompt
              </div>
              {addPromptTab === "single" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
            <button
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                addPromptTab === "bulk"
                  ? "text-black bg-white"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setAddPromptTab("bulk")}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </div>
              {addPromptTab === "bulk" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
          </div>

          {addPromptTab === "single" ? (
            <div className="px-6 py-6 bg-white">
              <div className="space-y-6">
                {/* Prompt Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="prompt"
                    className="text-sm font-semibold text-black flex items-center gap-2"
                  >
                    Prompt Text
                    <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="What is the best insurance? (Each line will be a separate prompt)"
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    rows={4}
                    maxLength={200}
                    className="resize-none border-gray-300 focus:border-black focus:ring-black"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      Create competitive prompts without mentioning your brand
                    </p>
                    <span className="text-xs text-gray-500">
                      {newPromptText.length}/200
                    </span>
                  </div>
                </div>

                {/* Country Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-sm font-semibold text-black"
                  >
                    IP Address Region
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger id="country">
                      <SelectValue>
                        {selectedCountry && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCountryFlag(selectedCountry)}
                            </span>
                            <span>{selectedCountry}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="India">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇳</span>
                          <span>India</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="United States">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇺🇸</span>
                          <span>United States</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="United Kingdom">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇬🇧</span>
                          <span>United Kingdom</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Canada">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇨🇦</span>
                          <span>Canada</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Australia">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇦🇺</span>
                          <span>Australia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Germany">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇩🇪</span>
                          <span>Germany</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="France">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇫🇷</span>
                          <span>France</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Japan">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇯🇵</span>
                          <span>Japan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="China">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇨🇳</span>
                          <span>China</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Brazil">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇧🇷</span>
                          <span>Brazil</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Mexico">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇲🇽</span>
                          <span>Mexico</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Spain">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇪🇸</span>
                          <span>Spain</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Italy">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇹</span>
                          <span>Italy</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Netherlands">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇳🇱</span>
                          <span>Netherlands</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Sweden">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇸🇪</span>
                          <span>Sweden</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Switzerland">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇨🇭</span>
                          <span>Switzerland</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Singapore">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇸🇬</span>
                          <span>Singapore</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="South Korea">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇰🇷</span>
                          <span>South Korea</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Saudi Arabia">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇸🇦</span>
                          <span>Saudi Arabia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="United Arab Emirates">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇦🇪</span>
                          <span>United Arab Emirates</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Nigeria">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇳🇬</span>
                          <span>Nigeria</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="South Africa">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇿🇦</span>
                          <span>South Africa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pakistan">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇵🇰</span>
                          <span>Pakistan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Bangladesh">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇧🇩</span>
                          <span>Bangladesh</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Indonesia">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇩</span>
                          <span>Indonesia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Turkey">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇹🇷</span>
                          <span>Turkey</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Egypt">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇪🇬</span>
                          <span>Egypt</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Poland">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇵🇱</span>
                          <span>Poland</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Argentina">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇦🇷</span>
                          <span>Argentina</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Thailand">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇹🇭</span>
                          <span>Thailand</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Select the region for prompt analysis
                  </p>
                </div>

                {/* Tags Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-black">
                    Tags
                    <span className="text-xs font-normal text-gray-600 ml-1">
                      (Optional)
                    </span>
                  </Label>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {selectedTags.map((tagName, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-black text-white hover:bg-gray-800"
                        >
                          {tagName}
                          <button
                            onClick={() => handleRemoveTag(tagName)}
                            className="ml-1.5 hover:opacity-70"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Available Tags - Quick Select */}
                  {availableTags.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">
                        Click to add tags:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {availableTags
                          .filter((tag) => !selectedTags.includes(tag.name))
                          .map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="cursor-pointer text-xs px-2 py-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-black transition-colors"
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
                    <div className="text-center py-4 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-xs text-gray-600 mb-3">
                        No tags available yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate("/dashboard/tags?createNew=true")
                        }
                        className="h-8 text-xs border-gray-300 hover:bg-black hover:text-white transition-colors"
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
                      className="w-full h-9 text-xs border-gray-300 hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create New Tag
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    className="h-9 border-gray-300 hover:bg-gray-100"
                    disabled={isAddingPrompt}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPrompt}
                    disabled={isAddingPrompt}
                    className="h-9 bg-black hover:bg-black/90 text-white"
                  >
                    {isAddingPrompt ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prompt
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6 bg-white">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4">
                  <svg
                    className="w-32 h-32 text-gray-200"
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
                <p className="text-sm text-gray-700 font-semibold mb-1">
                  CSV format: Prompt, Volume, Country, Tags, Mentions
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Example: "What is the best insurance?",485,"India","insurance;comparison",""
                </p>
                <p className="text-xs text-black mb-6">
                  💡 Tip: You can export your prompts and use that CSV format for bulk upload
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
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-black"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Download className="w-6 h-6 text-gray-700" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Drag and drop your CSV file here, or{" "}
                      <span className="text-black font-semibold underline cursor-pointer">
                        click to browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Supported format: CSV files only
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
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
                        <p className="text-sm font-semibold text-black">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="text-gray-700 hover:text-black hover:bg-gray-100"
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
                  disabled={isAddingPrompt}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                {uploadedFile && (
                  <Button
                    onClick={processBulkUpload}
                    disabled={isAddingPrompt}
                    className="bg-black hover:bg-black/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingPrompt ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Prompts
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tag Assignment Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 bg-white">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
            <DialogTitle className="text-xl font-semibold text-black">
              Manage Tags
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Add or remove tags for this prompt
            </p>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-6 bg-white">
            <div className="space-y-6">
              {/* Prompt Preview */}
              {currentPromptForTag && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Prompt:
                  </Label>
                  <p className="text-sm text-black">
                    {currentPromptForTag.prompt}
                  </p>
                </div>
              )}

              {/* Selected Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-black">
                  Selected Tags
                </Label>
                
                {tagsToAssign.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {tagsToAssign.map((tagName, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-black text-white hover:bg-gray-800"
                      >
                        {tagName}
                        <button
                          onClick={() => handleRemoveTagFromAssignment(tagName)}
                          className="ml-1.5 hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-600">
                      No tags selected
                    </p>
                  </div>
                )}
              </div>

              {/* Available Tags - Quick Select */}
              {availableTags.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Click to add tags:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                    {availableTags
                      .filter((tag) => !tagsToAssign.includes(tag.name))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer text-xs px-2 py-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-black transition-colors"
                          onClick={() => {
                            if (!tagsToAssign.includes(tag.name)) {
                              setTagsToAssign([...tagsToAssign, tag.name]);
                            }
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-600 mb-3">
                    No tags available yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTagDialogOpen(false);
                      navigate("/dashboard/tags?createNew=true");
                    }}
                    className="h-8 text-xs border-gray-300 hover:bg-black hover:text-white transition-colors"
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
                  onClick={() => {
                    setTagDialogOpen(false);
                    navigate("/dashboard/tags?createNew=true");
                  }}
                  className="w-full h-9 text-xs border-gray-300 hover:bg-black hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create New Tag
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTagDialogOpen(false);
                  setCurrentPromptForTag(null);
                  setTagsToAssign([]);
                }}
                className="h-9 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTagsToPrompt}
                className="h-9 bg-black hover:bg-black/90 text-white"
              >
                <Tag className="w-4 h-4 mr-2" />
                Save Tags
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ ...confirmDialog, open: false });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] gap-0 p-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 bg-white">
            <DialogTitle className="text-lg font-semibold text-black">
              {confirmDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 bg-white">
            <p className="text-sm text-gray-600 leading-relaxed">
              {confirmDialog.description}
            </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              className="h-9 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
              className="h-9 bg-black hover:bg-black/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptsPage;
