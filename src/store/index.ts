import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import onboardingSlice from './slices/onboardingSlice';
import userSlice from './slices/userSlice';
import promptsSlice from './slices/promptsSlice';
import competitorsSlice from './slices/competitorsSlice';
import rankingSlice from './slices/rankingSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    onboarding: onboardingSlice,
    user: userSlice,
    prompts: promptsSlice,
    competitors: competitorsSlice,
    ranking: rankingSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;