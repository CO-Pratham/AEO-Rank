import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationSettings {
  emailAlerts: boolean;
  weeklyReports: boolean;
  competitorAlerts: boolean;
  newMentions: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

interface IntegrationSettings {
  chatgpt: boolean;
  claude: boolean;
  gemini: boolean;
  perplexity: boolean;
}

interface ApiKey {
  name: string;
  maskedKey: string;
  createdAt: string;
}

interface LoginHistory {
  location: string;
  time: string;
  current: boolean;
}

interface UserSettings {
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

interface User {
  email: string;
  name?: string;
  company?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  apiKeys?: ApiKey[];
  loginHistory?: LoginHistory[];
  settings?: UserSettings;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user?: User }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user || null;
      state.loading = false;
      localStorage.setItem('accessToken', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      localStorage.removeItem('accessToken');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
      }
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      if (state.user && state.user.settings) {
        state.user.settings.notifications = {
          ...state.user.settings.notifications,
          ...action.payload
        };
      } else if (state.user) {
        state.user.settings = {
          notifications: action.payload as NotificationSettings,
          integrations: {
            chatgpt: true,
            claude: true,
            gemini: false,
            perplexity: false
          }
        };
      }
    },
    updateIntegrationSettings: (state, action: PayloadAction<Partial<IntegrationSettings>>) => {
      if (state.user && state.user.settings) {
        state.user.settings.integrations = {
          ...state.user.settings.integrations,
          ...action.payload
        };
      } else if (state.user) {
        state.user.settings = {
          notifications: {
            emailAlerts: true,
            weeklyReports: true,
            competitorAlerts: false,
            newMentions: true,
            systemUpdates: true,
            marketingEmails: false
          },
          integrations: action.payload as IntegrationSettings
        };
      }
    },
    addApiKey: (state, action: PayloadAction<ApiKey>) => {
      if (state.user) {
        if (!state.user.apiKeys) {
          state.user.apiKeys = [];
        }
        state.user.apiKeys.push(action.payload);
      }
    },
    revokeApiKey: (state, action: PayloadAction<string>) => {
      if (state.user && state.user.apiKeys) {
        state.user.apiKeys = state.user.apiKeys.filter(
          (key) => key.maskedKey !== action.payload
        );
      }
    },
    toggleTwoFactor: (state) => {
      if (state.user) {
        state.user.twoFactorEnabled = !state.user.twoFactorEnabled;
      }
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  logout,
  setUser,
  updateUserProfile,
  updateNotificationSettings,
  updateIntegrationSettings,
  addApiKey,
  revokeApiKey,
  toggleTwoFactor,
  updateAvatar
} = authSlice.actions;

export default authSlice.reducer;

// Note: Ensure this file only defines the auth slice and exports its reducer/actions.
// Do not import the store or other slices from here to avoid circular imports.

// If you previously pasted store setup code here (e.g., configureStore with
// `import authReducer from './slices/authSlice'`), that will create a
// self-referential import and break Vite's import analysis. The store setup
// belongs in `src/store/index.ts`.
