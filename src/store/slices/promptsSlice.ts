import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  error: string | null;
}

const initialState: PromptsState = {
  activePrompts: [],
  inactivePrompts: [],
  suggestedPrompts: [],
  currentPromptDetail: null,
  loading: false,
  detailLoading: false,
  error: null,
};

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
} = promptsSlice.actions;

// Export types for use in components
export type { Prompt, PromptDetail };

export default promptsSlice.reducer;