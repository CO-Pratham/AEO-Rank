import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import userReducer from './slices/userSlice';
import promptsReducer from './slices/promptsSlice';
import competitorsReducer from './slices/competitorsSlice';
import rankingReducer from './slices/rankingSlice';
import tagsReducer from './slices/tagsSlice';
import billingReducer from './slices/billingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    user: userReducer,
    prompts: promptsReducer,
    competitors: competitorsReducer,
    ranking: rankingReducer,
    tags: tagsReducer,
    billing: billingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;