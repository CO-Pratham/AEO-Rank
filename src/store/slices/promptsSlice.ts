import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Prompt {
  id: number;
  prompt: string;
  visibility: string;
  sentiment: string;
  position: string;
  mentions: { platform: string; color: string; count?: number }[];
  volume: number;
  volumeValue: number;
  tags: string[];
  location: string;
  suggestedAt?: string;
  addedAt?: string; // ISO string for Redux serialization
}

interface PromptDetail extends Prompt {
  competitors?: Array<{
    name: string;
    domain: string;
    visibility: string;
    position: string;
  }>;
  analytics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
    totalMentions: number;
    avgSentiment: number;
  };
  visibilityTrend?: Array<{
    date: string;
    visibility: number;
    position: number;
  }>;
  platformData?: Array<{
    platform: string;
    mentions: number;
    color: string;
  }>;
}

interface PromptsState {
  activePrompts: Prompt[];
  inactivePrompts: Prompt[];
  suggestedPrompts: Prompt[];
  currentPromptDetail: PromptDetail | null;
  loading: boolean;
  detailLoading: boolean;
  isAddingPrompt: boolean;
  error: string | null;
  selectedPromptIds: number[];
  selectedInactiveIds: number[];
}

const initialState: PromptsState = {
  activePrompts: [],
  inactivePrompts: [],
  suggestedPrompts: [],
  currentPromptDetail: null,
  loading: false,
  detailLoading: false,
  isAddingPrompt: false,
  error: null,
  selectedPromptIds: [],
  selectedInactiveIds: [],
};

// Platform color mapping
const PLATFORM_COLORS: Record<string, string> = {
  // AI Platforms
  ChatGPT: "#10a37f",
  Claude: "#cc785c",
  Gemini: "#4285f4",
  Perplexity: "#1fb6ff",
  Copilot: "#0078d4",
  Grok: "#000000",
  "Meta AI": "#0668E1",
  
  // Business Software
  Freshworks: "#ff6b6b",
  Salesforce: "#00a1e0",
  Zoho: "#e42527",
  
  // Car Brands
  BMW: "#1c69d4",
  Bmw: "#1c69d4",
  Mercedes: "#00adef",
  Audi: "#bb0a30",
  Tesla: "#cc0000",
  Toyota: "#eb0a1e",
  Honda: "#e40521",
  Ford: "#003478",
  Volkswagen: "#001e50",
  Porsche: "#d5001c",
  Ferrari: "#dc0300",
  Lamborghini: "#ffd500",
  
  // Tech Companies
  Google: "#4285f4",
  Apple: "#000000",
  Microsoft: "#00a4ef",
  Amazon: "#ff9900",
  Meta: "#0668E1",
  Facebook: "#1877f2",
};

// Helper function to extract brand/platform name from URL or string
const extractBrandName = (urlOrName: string): string => {
  if (!urlOrName) return urlOrName;
  
  // If it's a URL like "http://BMW" or "https://bmw.com"
  try {
    const url = new URL(urlOrName);
    // Extract hostname without www and TLD
    const hostname = url.hostname.replace(/^www\./, '').split('.')[0];
    // Capitalize first letter
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    // Not a valid URL, check if it starts with http:// or https://
    if (urlOrName.startsWith('http://') || urlOrName.startsWith('https://')) {
      // Extract the part after protocol
      const parts = urlOrName.replace(/^https?:\/\//, '').split('/')[0].split('.');
      const name = parts[0].replace(/^www\./, '');
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    // Return as is if it's already a brand name
    return urlOrName;
  }
};

// Helper function to process prompt data
const processPromptData = (item: any): Prompt => {
  let mentionsArray: { platform: string; color: string; count: number }[] = [];
  
  // Handle different mention formats from API
  if (item.mentions) {
    if (typeof item.mentions === "object") {
      // Format 1: Object with platform names as keys
      if (Object.keys(item.mentions).length > 0 && typeof Object.values(item.mentions)[0] === 'number') {
        mentionsArray = Object.entries(item.mentions)
          .map(([platform, count]) => ({
            platform: extractBrandName(platform),
            color: PLATFORM_COLORS[platform] || PLATFORM_COLORS[extractBrandName(platform)] || "#6b7280",
            count: Number(count) || 0,
          }))
          .filter((m) => m.count > 0);
      }
      // Format 2: Array of mention objects with url/platform/client fields
      else if (Array.isArray(item.mentions)) {
        mentionsArray = item.mentions
          .map((mention: any) => {
            const platformName = extractBrandName(
              mention.url || mention.platform || mention.client || mention.name || 'Unknown'
            );
            return {
              platform: platformName,
              color: PLATFORM_COLORS[platformName] || "#6b7280",
              count: mention.count || 1,
            };
          })
          .filter((m: any) => m.platform && m.platform !== 'Unknown');
      }
    }
  }

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
  const volumeBars = Math.min(Math.max(Math.ceil(volumeValue / 100), 0), 5);

  return {
    id: item.id,
    prompt: item.prompt || "No prompt text",
    visibility: item.visibility !== undefined ? `${item.visibility}%` : "—",
    sentiment: item.sentiment || "—",
    position: item.position ? `#${item.position}` : "—",
    mentions: mentionsArray,
    volume: volumeBars,
    volumeValue: volumeValue,
    tags: tagsArray,
    addedAt: item.added ? new Date(item.added).toISOString() : new Date().toISOString(),
    location: item.location || "—",
  };
};

// Async Thunks
export const fetchActivePrompts = createAsyncThunk(
  'prompts/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
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
      const processedPrompts = Array.isArray(data)
        ? data.map(processPromptData)
        : [];

      return processedPrompts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInactivePrompts = createAsyncThunk(
  'prompts/fetchInactive',
  async (_, { rejectWithValue }) => {
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
      const processedPrompts = Array.isArray(data)
        ? data.map(processPromptData)
        : [];

      return processedPrompts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPrompt = createAsyncThunk(
  'prompts/create',
  async (promptData: Omit<Prompt, "id">, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");

      const countryCodeToName: Record<string, string> = {
        IN: "India",
        US: "United States",
        GB: "United Kingdom",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
      };
      const fullCountry =
        countryCodeToName[promptData.location as string] ||
        promptData.location ||
        "";

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
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create prompt: ${response.status}`);
      }

      const data = await response.json();
      return processPromptData(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePromptTags = createAsyncThunk(
  'prompts/updateTags',
  async ({ promptId, tags }: { promptId: number; tags: string[] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://aeotest-production.up.railway.app/prompt/${promptId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update tags: ${response.status}`);
      }

      return { promptId, tags };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deactivatePrompts = createAsyncThunk(
  'prompts/deactivate',
  async (promptIds: number[], { rejectWithValue }) => {
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
            prompt_ids: promptIds,
            is_active: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to deactivate prompts: ${response.status}`);
      }

      return promptIds;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const activatePrompts = createAsyncThunk(
  'prompts/activate',
  async (promptIds: number[], { rejectWithValue }) => {
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
            prompt_ids: promptIds,
            is_active: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to activate prompts: ${response.status}`);
      }

      return promptIds;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.detailLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActivePrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.activePrompts = action.payload;
    },
    addActivePrompt: (state, action: PayloadAction<Prompt>) => {
      state.activePrompts.unshift(action.payload);
    },
    removeActivePrompt: (state, action: PayloadAction<number>) => {
      state.activePrompts = state.activePrompts.filter(p => p.id !== action.payload);
    },
    setInactivePrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.inactivePrompts = action.payload;
    },
    moveToInactive: (state, action: PayloadAction<number[]>) => {
      const promptsToMove = state.activePrompts.filter(p => action.payload.includes(p.id));
      state.inactivePrompts.push(...promptsToMove);
      state.activePrompts = state.activePrompts.filter(p => !action.payload.includes(p.id));
    },
    setSuggestedPrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.suggestedPrompts = action.payload;
    },
    setCurrentPromptDetail: (state, action: PayloadAction<PromptDetail | null>) => {
      state.currentPromptDetail = action.payload;
    },
    clearCurrentPromptDetail: (state) => {
      state.currentPromptDetail = null;
    },
    setSelectedPromptIds: (state, action: PayloadAction<number[]>) => {
      state.selectedPromptIds = action.payload;
    },
    setSelectedInactiveIds: (state, action: PayloadAction<number[]>) => {
      state.selectedInactiveIds = action.payload;
    },
    deleteInactivePrompts: (state, action: PayloadAction<number[]>) => {
      state.inactivePrompts = state.inactivePrompts.filter(
        p => !action.payload.includes(p.id)
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch Active Prompts
    builder
      .addCase(fetchActivePrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.activePrompts = action.payload;
      })
      .addCase(fetchActivePrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Inactive Prompts
    builder
      .addCase(fetchInactivePrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInactivePrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.inactivePrompts = action.payload;
      })
      .addCase(fetchInactivePrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Prompt
    builder
      .addCase(createPrompt.pending, (state) => {
        state.isAddingPrompt = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.isAddingPrompt = false;
        state.activePrompts.unshift(action.payload);
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.isAddingPrompt = false;
        state.error = action.payload as string;
      });

    // Update Prompt Tags
    builder
      .addCase(updatePromptTags.fulfilled, (state, action) => {
        const { promptId, tags } = action.payload;
        
        // Update in active prompts
        const activeIndex = state.activePrompts.findIndex(p => p.id === promptId);
        if (activeIndex !== -1) {
          state.activePrompts[activeIndex].tags = tags;
        }
        
        // Update in inactive prompts
        const inactiveIndex = state.inactivePrompts.findIndex(p => p.id === promptId);
        if (inactiveIndex !== -1) {
          state.inactivePrompts[inactiveIndex].tags = tags;
        }
      });

    // Deactivate Prompts
    builder
      .addCase(deactivatePrompts.fulfilled, (state, action) => {
        const promptIds = action.payload;
        const promptsToMove = state.activePrompts.filter(p => promptIds.includes(p.id));
        state.inactivePrompts.push(...promptsToMove);
        state.activePrompts = state.activePrompts.filter(p => !promptIds.includes(p.id));
        state.selectedPromptIds = [];
      });

    // Activate Prompts
    builder
      .addCase(activatePrompts.fulfilled, (state, action) => {
        const promptIds = action.payload;
        const promptsToMove = state.inactivePrompts.filter(p => promptIds.includes(p.id));
        state.activePrompts.push(...promptsToMove);
        state.inactivePrompts = state.inactivePrompts.filter(p => !promptIds.includes(p.id));
        state.selectedInactiveIds = [];
      });
  },
});

export const {
  setLoading,
  setDetailLoading,
  setError,
  setActivePrompts,
  addActivePrompt,
  removeActivePrompt,
  setInactivePrompts,
  moveToInactive,
  setSuggestedPrompts,
  setCurrentPromptDetail,
  clearCurrentPromptDetail,
  setSelectedPromptIds,
  setSelectedInactiveIds,
  deleteInactivePrompts,
} = promptsSlice.actions;

// Export types for use in components
export type { Prompt, PromptDetail };

export default promptsSlice.reducer;