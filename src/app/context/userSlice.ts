import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  avatar: string | null;
  token: string | null;
  user: {
    id: number;
    email?: string;
    onboarded?: boolean;
    [key: string]: any;
  } | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  avatar: null,
  token: null,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ avatar?: string; token: string; user?: any }>
    ) => {
      state.isAuthenticated = true;
      state.avatar = action.payload.avatar ?? '/img/user.png';
      state.token = action.payload.token;
      state.user = action.payload.user || null;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.avatar = null;
      state.token = null;
      state.user = null;
      localStorage.clear();
    },

    updateUser: (state, action: PayloadAction<Partial<UserState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    restoreOnboardedStatus: (state, action: PayloadAction<{ email: string; onboarded: boolean }>) => {
      if (state.user && state.user.email === action.payload.email) {
        state.user.onboarded = action.payload.onboarded;
      }
    },
  },
});

export const { loginSuccess, logout, updateUser, restoreOnboardedStatus } = userSlice.actions;
export default userSlice.reducer;
