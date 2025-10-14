import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Competitor {
  id: number;
  name: string;
  domain?: string;
  visibility?: string;
  sentiment?: string;
  position?: string;
  mentions?: { platform: string; color: string }[];
  volume?: number;
  addedAt?: Date;
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
  name: 'competitors',
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
      state.competitors = state.competitors.filter(c => c.id !== action.payload);
    },
    setSuggestedCompetitors: (state, action: PayloadAction<Competitor[]>) => {
      state.suggestedCompetitors = action.payload;
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
} = competitorsSlice.actions;

export default competitorsSlice.reducer;