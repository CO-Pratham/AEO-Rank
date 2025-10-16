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

    console.log('Loading persisted onboarding state:', parsed);

    return {
      data: parsed.data || {},
      currentStep: typeof parsed.currentStep === 'number' ? parsed.currentStep : 1,
    } as Partial<OnboardingState>;
  } catch (error) {
    console.error('Error loading persisted onboarding state:', error);
    return null;
  }
};

const persistState = (state: OnboardingState) => {
  try {
    const stateToSave = { data: state.data, currentStep: state.currentStep };
    console.log('Persisting onboarding state:', stateToSave);
    localStorage.setItem(
      'aeorank_onboarding_state',
      JSON.stringify(stateToSave)
    );
  } catch (error) {
    console.error('Error persisting onboarding state:', error);
  }
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
  ...(persisted?.data ? { data: { ...initialStateBase.data, ...persisted.data } } : {}),
  ...(typeof persisted?.currentStep === 'number' ? { currentStep: persisted.currentStep } : {}),
};

console.log('Initial onboarding state:', initialState);

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
      state.data = initialStateBase.data;
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