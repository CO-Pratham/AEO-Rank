import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Competitor {
  id: number;
  name: string;
  logo?: string;
  domain?: string;
  visibility?: string;
  sentiment?: string | number;
  position?: string;
  mentions?: { platform: string; color: string }[];
  volume?: number;
  addedAt?: string;
}

interface CompetitorsState {
  competitors: Competitor[];
  suggestedCompetitors: Competitor[];
  loading: boolean;
  error: string | null;
}

const initialState: CompetitorsState = {
  competitors: [],
  suggestedCompetitors: [],
  loading: false,
  error: null,
};

const competitorsSlice = createSlice({
  name: "competitors",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCompetitors: (state, action: PayloadAction<Competitor[]>) => {
      state.competitors = action.payload;
    },
    addCompetitor: (state, action: PayloadAction<Competitor>) => {
      state.competitors.push(action.payload);
    },
    removeCompetitor: (state, action: PayloadAction<number>) => {
      state.competitors = state.competitors.filter(
        (c) => c.id !== action.payload
      );
    },
    setSuggestedCompetitors: (state, action: PayloadAction<Competitor[]>) => {
      state.suggestedCompetitors = action.payload;
    },
    removeSuggestedCompetitor: (state, action: PayloadAction<number>) => {
      state.suggestedCompetitors = state.suggestedCompetitors.filter(
        (c) => c.id !== action.payload
      );
    },
    addCompetitorFromSuggested: (state, action: PayloadAction<Competitor>) => {
      state.competitors.push(action.payload);
      state.suggestedCompetitors = state.suggestedCompetitors.filter(
        (c) => c.id !== action.payload.id
      );
    },
  },
});

export const {
  setLoading,
  setError,
  setCompetitors,
  addCompetitor,
  removeCompetitor,
  setSuggestedCompetitors,
  removeSuggestedCompetitor,
  addCompetitorFromSuggested,
} = competitorsSlice.actions;

export default competitorsSlice.reducer;
