import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingData {
  brandName: string;
  brandWebsite: string;
  defaultLocation: string;
  competitors: string[];
  prompts: string[];
}

interface OnboardingState {
  data: OnboardingData;
  currentStep: number;
  isCompleted: boolean;
  loading: boolean;
}

const loadPersistedState = (): Partial<OnboardingState> | null => {
  try {
    const raw = localStorage.getItem('aeorank_onboarding_state');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      data: parsed.data,
      currentStep: parsed.currentStep,
    } as Partial<OnboardingState>;
  } catch {
    return null;
  }
};

const persistState = (state: OnboardingState) => {
  try {
    localStorage.setItem(
      'aeorank_onboarding_state',
      JSON.stringify({ data: state.data, currentStep: state.currentStep })
    );
  } catch {}
};

const initialStateBase: OnboardingState = {
  data: {
    brandName: '',
    brandWebsite: '',
    defaultLocation: '',
    competitors: [],
    prompts: [],
  },
  currentStep: 1,
  isCompleted: !!localStorage.getItem('aeorank_onboarding_completed'),
  loading: false,
};

const persisted = loadPersistedState();
const initialState: OnboardingState = {
  ...initialStateBase,
  ...(persisted?.data ? { data: persisted.data as OnboardingData } : {}),
  ...(typeof persisted?.currentStep === 'number' ? { currentStep: persisted.currentStep as number } : {}),
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateOnboardingData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.data = { ...state.data, ...action.payload };
      persistState(state);
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      persistState(state);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    completeOnboarding: (state) => {
      state.isCompleted = true;
      localStorage.setItem('aeorank_onboarding_completed', 'true');
      localStorage.removeItem('aeorank_onboarding_state');
    },
    resetOnboarding: (state) => {
      state.data = initialState.data;
      state.currentStep = 1;
      state.isCompleted = false;
      localStorage.removeItem('aeorank_onboarding_completed');
      localStorage.removeItem('aeorank_onboarding_state');
    },
  },
});

export const {
  updateOnboardingData,
  setCurrentStep,
  setLoading,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;