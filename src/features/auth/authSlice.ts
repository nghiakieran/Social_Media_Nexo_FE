import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { User, LoginRequest, LoginResponse, UserProfileResponse, RegisterRequest, RegisterResponse } from './types';
import { performLogout } from '@/lib/axios';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { AUTH_LOGIN_ENDPOINT, AUTH_REGISTER_ENDPOINT, USER_PROFILE_ENDPOINT, ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, BEARER_TOKEN_PREFIX } from '@/utils/constants';
import { AxiosHeaders } from 'axios';

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

// Thunk: login with real API
export const loginAsync = createAsyncThunk('auth/loginAsync', async (credentials: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>(AUTH_LOGIN_ENDPOINT, {
      email: credentials.email,
      password: credentials.password,
    });

    const { access_token, refresh_token } = response.data.data;

    // Store tokens
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);

    // Update axios defaults
    if (api.defaults.headers) {
      if (api.defaults.headers instanceof AxiosHeaders) {
        api.defaults.headers.set('Authorization', `${BEARER_TOKEN_PREFIX} ${access_token}`);
      } else {
        const defaultsHeaders = api.defaults.headers as unknown as { common?: Record<string, string> };
        defaultsHeaders.common = defaultsHeaders.common || {};
        defaultsHeaders.common.Authorization = `${BEARER_TOKEN_PREFIX} ${access_token}`;
      }
    }

    // Fetch user profile after successful login
    try {
      const profileResponse = await api.get<UserProfileResponse>(USER_PROFILE_ENDPOINT);
      return profileResponse.data.data;
    } catch (profileError) {
      // If profile fetch fails, still return a basic user object
      console.warn('Failed to fetch user profile:', profileError);
      return {
        id: 1,
        username: 'user',
        fullName: 'User',
        email: credentials.email,
        avatar: undefined,
        bio: undefined,
        isPrivate: false,
        followers: 0,
        following: 0,
      } as User;
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(axiosError?.response?.data?.message || 'Đăng nhập thất bại');
  }
});

// Thunk: register with real API
export const registerAsync = createAsyncThunk('auth/registerAsync', async (userData: RegisterRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<RegisterResponse>(AUTH_REGISTER_ENDPOINT, {
      email: userData.email,
      username: userData.username,
      fullname: userData.fullname,
      password: userData.password,
    });

    return response.data.message;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
    const errorMessage = axiosError?.response?.data?.error || axiosError?.response?.data?.message || 'Đăng ký thất bại';
    return rejectWithValue(errorMessage);
  }
});

// Thunk: standardize logout flow (abort refresh, call API, clear tokens, reset state, navigate)
export const logoutAsync = createAsyncThunk('auth/logoutAsync', async (_, { dispatch }) => {
  // Fail-safe: clear client state first
  dispatch(logout());
  await performLogout({ redirect: true });
  toast.success('Bạn đã đăng xuất thành công');
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
