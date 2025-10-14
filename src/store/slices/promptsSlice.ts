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

interface PromptsState {
  activePrompts: Prompt[];
  inactivePrompts: Prompt[];
  suggestedPrompts: Prompt[];
  loading: boolean;
  error: string | null;
}

const initialState: PromptsState = {
  activePrompts: [],
  inactivePrompts: [],
  suggestedPrompts: [],
  loading: false,
  error: null,
};

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
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
  },
});

export const {
  setLoading,
  setError,
  setActivePrompts,
  addActivePrompt,
  removeActivePrompt,
  setInactivePrompts,
  moveToInactive,
  setSuggestedPrompts,
} = promptsSlice.actions;

export default promptsSlice.reducer;