import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTags } from "@/context/TagsContext";

interface Prompt {
  id: number;
  prompt: string;
  visibility: string;
  sentiment: string;
  position: string;
  mentions: { platform: string; color: string }[];
  volume: number;
  tags: string[];
  suggestedAt?: string;
  addedAt?: Date;
}

const PromptsPage = () => {
  const { incrementTagMentions } = useTags();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [modelFilter, setModelFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [addPromptTab, setAddPromptTab] = useState("single");
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [selectedInactiveIds, setSelectedInactiveIds] = useState<number[]>([]);
  const [activePrompts, setActivePrompts] = useState<Prompt[]>([]);
  const [inactivePrompts, setInactivePrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const suggestedPrompts: Prompt[] = [];

  // API Functions - Backend developer should replace these endpoints
  const fetchActivePrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts/active'); // Replace with actual endpoint
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setActivePrompts(data);
    } catch (error) {
      console.error('Error fetching active prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (promptData: Omit<Prompt, 'id'>) => {
    try {
      const response = await fetch('/api/prompts', { // Replace with actual endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
      if (!response.ok) throw new Error('Failed to create prompt');
      const newPrompt = await response.json();
      setActivePrompts(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  };

  // Load prompts on component mount
  useEffect(() => {
    fetchActivePrompts();
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
      "Prompt,Visibility,Sentiment,Position,Volume\n" +
      activePrompts
        .map(
          (p) =>
            `"${p.prompt}",${p.visibility},${p.sentiment},${p.position},${p.volume}`
        )
        .join("\n");

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
      // Create new prompt object
      const newPromptData = {
        prompt: newPromptText,
        visibility: "0%",
        sentiment: "—",
        position: "—",
        mentions: [],
        volume: 0,
        tags: selectedTags,
        addedAt: new Date(),
      };

      // Send to backend
      await createPrompt(newPromptData);

      // Increment mentions for each tag used in this prompt
      if (selectedTags.length > 0) {
        incrementTagMentions(selectedTags);
      }

      // Reset form
      setNewPromptText("");
      setSelectedTags([]);
      setTagInput("");
      setAddDialogOpen(false);

      // Show success message
      alert("Prompt added successfully!");
    } catch (error) {
      alert("Failed to add prompt. Please try again.");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput("");
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

  const handleDeactivate = () => {
    if (
      confirm(
        `Are you sure you want to deactivate ${selectedPromptIds.length} prompt(s)?`
      )
    ) {
      const promptsToDeactivate = activePrompts.filter((p) =>
        selectedPromptIds.includes(p.id)
      );
      setInactivePrompts([...inactivePrompts, ...promptsToDeactivate]);
      setActivePrompts(
        activePrompts.filter((p) => !selectedPromptIds.includes(p.id))
      );
      setSelectedPromptIds([]);
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

  const handleActivate = () => {
    if (
      confirm(
        `Are you sure you want to activate ${selectedInactiveIds.length} prompt(s)?`
      )
    ) {
      const promptsToActivate = inactivePrompts.filter((p) =>
        selectedInactiveIds.includes(p.id)
      );
      setActivePrompts([...activePrompts, ...promptsToActivate]);
      setInactivePrompts(
        inactivePrompts.filter((p) => !selectedInactiveIds.includes(p.id))
      );
      setSelectedInactiveIds([]);
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
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
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
      alert('Please select a file first');
      return;
    }

    try {
      const text = await uploadedFile.text();
      console.log('File content:', text);
      
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) {
        alert('The CSV file is empty.');
        return;
      }

      const prompts = [];
      
      for (const line of lines) {
        // Simple comma split - handle both quoted and unquoted
        const parts = line.split(',');
        
        if (parts.length >= 1) {
          const promptText = parts[0].replace(/^"|"$/g, '').trim();
          
          if (promptText && promptText.toLowerCase() !== 'prompt') {
            const tagsText = parts[1] ? parts[1].replace(/^"|"$/g, '').trim() : '';
            const tags = tagsText ? tagsText.split(';').map(t => t.trim()).filter(Boolean) : [];
            
            prompts.push({
              prompt: promptText,
              visibility: '0%',
              sentiment: '—',
              position: '—',
              mentions: [],
              volume: 0,
              tags,
              addedAt: new Date(),
            });
          }
        }
      }

      console.log('Parsed prompts:', prompts);

      if (prompts.length === 0) {
        alert('No valid prompts found. Make sure your CSV has prompts in the first column.');
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
      console.error('CSV processing error:', error);
      alert(`Error: ${error.message}`);
    }
  };

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
                                Visibility
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
                                Sentiment
                              </TableHead>
                              <TableHead className="font-medium text-xs text-center min-w-[120px]">
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
                                Added
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredActivePrompts.length === 0 ? (
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
                                    <p className="text-sm">{prompt.prompt}</p>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm font-medium">
                                      {prompt.visibility}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm">
                                      {prompt.sentiment}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center py-3">
                                    <span className="text-sm">
                                      {prompt.position}
                                    </span>
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
                                    <div className="flex justify-center">
                                      {renderVolumeIndicator(prompt.volume)}
                                    </div>
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
                          <p className="text-sm">{prompt.prompt}</p>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex justify-center">
                            {renderVolumeIndicator(prompt.volume)}
                          </div>
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
                              Visibility
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
                              Sentiment
                            </TableHead>
                            <TableHead className="font-medium text-xs text-center min-w-[120px]">
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
                              <TableCell className="text-center py-3">
                                <span className="text-sm font-medium">
                                  {prompt.visibility}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm">
                                  {prompt.sentiment}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <span className="text-sm">
                                  {prompt.position}
                                </span>
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
                                <div className="flex justify-center">
                                  {renderVolumeIndicator(prompt.volume)}
                                </div>
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
        <DialogContent className="max-w-lg">
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                addPromptTab === "single"
                  ? "border-b-2 border-blue-600 text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setAddPromptTab("single")}
            >
              Add Prompt
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                addPromptTab === "bulk"
                  ? "border-b-2 border-blue-600 text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setAddPromptTab("bulk")}
            >
              Bulk Upload
            </button>
          </div>

          {addPromptTab === "single" ? (
            <div className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Add Prompt</h3>
                <p className="text-sm text-muted-foreground">
                  Create a competitive prompt without mentioning your own brand.
                  Every line will be a separate prompt.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="What is the best insurance?"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="resize-none text-sm"
                />
                <div className="text-right text-xs text-muted-foreground">
                  {newPromptText.length}/200
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  IP Address
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger id="country">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {selectedTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="tags"
                    placeholder="Enter tag name"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={handleAddTag}
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPrompt}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
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
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-upload')?.click()}
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
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
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
