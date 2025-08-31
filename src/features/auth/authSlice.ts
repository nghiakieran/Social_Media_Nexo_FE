import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired: boolean;
  twoFactorToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  twoFactorRequired: false,
  twoFactorToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.twoFactorRequired = false;
      state.twoFactorToken = null;
    },
    loginTwoFactor: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.twoFactorRequired = true;
      state.twoFactorToken = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.twoFactorRequired = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.twoFactorRequired = false;
      state.twoFactorToken = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginTwoFactor,
  loginFailure,
  logout,
  clearError,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

export default authSlice.reducer;