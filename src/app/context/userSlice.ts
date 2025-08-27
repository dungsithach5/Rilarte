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
      // Giữ lại user data để tránh phải nhập lại
      const userData = state.user;
      
      state.isAuthenticated = false;
      state.avatar = null;
      state.token = null;
      // KHÔNG reset user data để giữ onboarded status
      // state.user = null;
      
      // Clear localStorage nhưng giữ user info
      localStorage.clear();
      
      // Lưu toàn bộ user data vào localStorage để dùng sau
      if (userData && userData.email) {
        localStorage.setItem('user_data', JSON.stringify({
          email: userData.email,
          onboarded: userData.onboarded,
          id: userData.id,
          name: userData.name,
          image: userData.image,
          username: userData.username
        }));
      }
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

    restoreUserData: (state, action: PayloadAction<{ 
      email: string; 
      onboarded: boolean; 
      id: number; 
      name: string; 
      image: string; 
      username: string; 
    }>) => {
      // Restore toàn bộ user data
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        onboarded: action.payload.onboarded,
        name: action.payload.name,
        image: action.payload.image,
        username: action.payload.username
      };
      state.isAuthenticated = true;
      state.avatar = action.payload.image;
      state.token = `nextauth_jwt_${action.payload.id}`;
    },
  },
});

export const { loginSuccess, logout, updateUser, restoreOnboardedStatus, restoreUserData } = userSlice.actions;
export default userSlice.reducer;
