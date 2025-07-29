import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  avatar: string | null;
  token: string | null;
  user: any | null;
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
    loginSuccess: (state, action: PayloadAction<{ avatar?: string; token: string; user?: any }>) => {
      state.isAuthenticated = true;
      state.avatar = action.payload.avatar ?? "/img/user.png";
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
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;