import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  avatar: string | null;
  token: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  avatar: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ avatar: string; token: string }>) => {
      state.isAuthenticated = true;
      state.avatar = action.payload.avatar;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.avatar = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;