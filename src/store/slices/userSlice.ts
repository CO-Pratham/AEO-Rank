import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  profile: {
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  brand: {
    name: string;
    website: string;
    location: string;
  } | null;
  loading: boolean;
}

const initialState: UserState = {
  profile: null,
  brand: null,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    setBrand: (state, action: PayloadAction<any>) => {
      state.brand = action.payload;
    },
    clearUser: (state) => {
      state.profile = null;
      state.brand = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setUserProfile, setBrand, clearUser } = userSlice.actions;
export default userSlice.reducer;