import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit2, 
  Trash2,
  X,
  Tag as TagIcon,
  Sparkles,
  FileText,
  MessageSquare
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addTag, updateTag, deleteTag, type Tag } from "@/store/slices/tagsSlice";
import { useToast } from "@/hooks/use-toast";

const TAG_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Gray", value: "#6b7280" },
];

const TagsPage = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tags = useAppSelector((state) => state.tags.tags);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    description: ""
  });

  // Fetch prompts when component mounts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('https://aeotest-production.up.railway.app/prompt/meta/get', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailablePrompts(data || []);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };
    
    fetchPrompts();
    
    // Check if opened with createNew parameter
    if (searchParams.get('createNew') === 'true') {
      setIsCreateDialogOpen(true);
      setSearchParams({}); // Clear the parameter
    }
  }, [searchParams, setSearchParams]);

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    const newTagId = Date.now();
    
    dispatch(addTag({
      name: formData.name,
      color: formData.color,
      description: formData.description,
    }));
    
    // Update selected prompts with the new tag
    if (selectedPromptIds.length > 0) {
      try {
        const token = localStorage.getItem('accessToken');
        
        for (const promptId of selectedPromptIds) {
          const prompt = availablePrompts.find(p => p.id === promptId);
          if (prompt) {
            const updatedTags = [...(prompt.tags || []), formData.name];
            
            // Update prompt with new tag via API
            await fetch(`https://aeotest-production.up.railway.app/prompt/${promptId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...prompt,
                tags: updatedTags
              })
            });
          }
        }
        
        toast({
          title: "Tag Created & Applied",
          description: `"${formData.name}" has been created and added to ${selectedPromptIds.length} prompt(s).`,
        });
      } catch (error) {
        console.error('Error updating prompts:', error);
        toast({
          title: "Tag Created",
          description: `"${formData.name}" has been created, but some prompts may not have been updated.`,
        });
      }
    } else {
      toast({
        title: "Tag Created",
        description: `"${formData.name}" has been created successfully.`,
      });
    }
    
    setIsCreateDialogOpen(false);
    setFormData({ name: "", color: "#3b82f6", description: "" });
    setSelectedPromptIds([]);
  };

  const handleEditTag = () => {
    if (editingTag) {
      dispatch(updateTag({ 
        id: editingTag.id, 
        updates: formData 
      }));
      
      toast({
        title: "Tag Updated",
        description: `"${formData.name}" has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
      setEditingTag(null);
      setFormData({ name: "", color: "#3b82f6", description: "" });
    }
  };

  const handleDeleteTag = (tagId: number, tagName: string) => {
    dispatch(deleteTag(tagId));
    
    toast({
      title: "Tag Deleted",
      description: `"${tagName}" has been deleted.`,
    });
    
    if (selectedTag === tagId) {
      setSelectedTag(null);
    }
  };

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const filteredItems = selectedTag 
    ? tags.filter(tag => tag.id === selectedTag)
    : tags;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <TagIcon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Tags</h1>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-9 px-4 bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Selected Tag Filter */}
      {selectedTag && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtering by:</span>
                <Badge className="text-sm">
                  {tags.find(t => t.id === selectedTag)?.name}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List of Tags */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTag ? "Filtered Tags" : "All Tags"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click a tag to filter items
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((tag) => (
              <Card 
                key={tag.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTag === tag.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <h3 className="font-semibold">{tag.name}</h3>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    {tag.description && (
                      <p className="text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    )}
                    
                    <div className="flex justify-end items-center text-sm">
                      <Badge variant="secondary">{tag.mentions} mentions</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
        <DialogTitle className="text-xl font-semibold text-black">
          Create New Tag
        </DialogTitle>
        <p className="text-sm text-gray-600 mt-1">
          Add a new tag to organize your content and prompts
        </p>
      </DialogHeader>
      
      {/* Form Content */}
      <div className="px-6 py-6 space-y-5 bg-white">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-black">
            Tag Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Marketing, Development, Important"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-9 border-gray-300 focus:border-black focus:ring-black"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-semibold text-black">
            Color
          </Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="color" className="h-9">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: formData.color }}
                      />
                      <span>{TAG_COLORS.find(c => c.value === formData.color)?.name || "Custom"}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TAG_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-black">
                Associate with Prompts
                <span className="text-xs font-normal text-gray-600 ml-1">(Optional)</span>
              </Label>
              <div className="border border-gray-200 rounded-lg max-h-[250px] overflow-y-auto">
                {availablePrompts.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {availablePrompts.map((prompt) => (
                      <div 
                        key={prompt.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedPromptIds(prev => 
                            prev.includes(prompt.id) 
                              ? prev.filter(id => id !== prompt.id)
                              : [...prev, prompt.id]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedPromptIds.includes(prompt.id)}
                          onCheckedChange={(checked) => {
                            setSelectedPromptIds(prev => 
                              checked 
                                ? [...prev, prompt.id]
                                : prev.filter(id => id !== prompt.id)
                            );
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black line-clamp-2">
                            {prompt.prompt || prompt.query || 'Unnamed prompt'}
                          </p>
                          {prompt.tags && prompt.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {prompt.tags.slice(0, 3).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-600">
                    No prompts available. Create prompts first to associate them with tags.
                  </div>
                )}
              </div>
              {selectedPromptIds.length > 0 && (
                <p className="text-xs text-gray-600">
                  {selectedPromptIds.length} prompt(s) selected
                </p>
              )}
            </div>
            
            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 font-semibold mb-2">Preview:</p>
              <Badge 
                className="text-sm px-3 py-1"
                style={{ 
                  backgroundColor: formData.color + '20',
                  color: formData.color,
                  border: `1px solid ${formData.color}40`
                }}
              >
                {formData.name || "Tag Name"}
              </Badge>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ name: "", color: "#3b82f6", description: "" });
                  setSelectedPromptIds([]);
                }}
                className="h-9 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTag} 
                disabled={!formData.name}
                className="h-9 bg-black hover:bg-black/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Edit Tag
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                Update the tag name, color, and description
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Form Content */}
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-3">
              <Label htmlFor="edit-name" className="text-sm font-semibold flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-blue-600" />
                Tag Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter tag name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 border-2 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="edit-color" className="text-sm font-semibold flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                Color
              </Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="edit-color" className="h-11 border-2">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md" 
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="font-medium">{TAG_COLORS.find(c => c.value === formData.color)?.name || "Custom"}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TAG_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value} className="cursor-pointer">
                      <div className="flex items-center gap-3 py-1">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm" 
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="font-medium">{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="edit-description" className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Description
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Add a description for this tag..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] border-2 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            
            {/* Preview */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">Preview:</p>
              <Badge 
                className="text-sm px-4 py-2 font-medium shadow-sm"
                style={{ 
                  backgroundColor: formData.color + '20',
                  color: formData.color,
                  border: `2px solid ${formData.color}40`
                }}
              >
                {formData.name || "Tag Name"}
              </Badge>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (editingTag) {
                  handleDeleteTag(editingTag.id, editingTag.name);
                  setIsEditDialogOpen(false);
                  setEditingTag(null);
                }
              }}
              className="h-10 px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingTag(null);
                  setFormData({ name: "", color: "#3b82f6", description: "" });
                }}
                className="h-10 px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditTag} 
                disabled={!formData.name}
                className="h-10 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsPage;
