import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RankingItem {
  id: string | number;
  brand: string;
  logo?: string;
  domain?: string;
  visibility: string;
  visibilityValue: number; // For sorting
  sentiment: number | null;
  position: string | null;
  positionValue: number; // For sorting
  originalPosition?: number; // From backend
}

interface RankingState {
  rankingData: RankingItem[];
  promptRankingData: RankingItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  promptId: string | null;
}

const initialState: RankingState = {
  rankingData: [],
  promptRankingData: [],
  loading: false,
  error: null,
  lastUpdated: null,
  promptId: null,
};

const rankingSlice = createSlice({
  name: "ranking",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRankingData: (state, action: PayloadAction<RankingItem[]>) => {
      state.rankingData = action.payload;
      state.lastUpdated = Date.now();
    },
    setPromptRankingData: (state, action: PayloadAction<{ promptId: string; data: RankingItem[] }>) => {
      state.promptRankingData = action.payload.data;
      state.promptId = action.payload.promptId;
      state.lastUpdated = Date.now();
    },
    clearRankingData: (state) => {
      state.rankingData = [];
      state.promptRankingData = [];
      state.promptId = null;
      state.lastUpdated = null;
    },
    updateRankingItem: (state, action: PayloadAction<{ id: string | number; updates: Partial<RankingItem> }>) => {
      const { id, updates } = action.payload;
      const item = state.rankingData.find(item => item.id === id);
      if (item) {
        Object.assign(item, updates);
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setRankingData,
  setPromptRankingData,
  clearRankingData,
  updateRankingItem,
} = rankingSlice.actions;

export default rankingSlice.reducer;
