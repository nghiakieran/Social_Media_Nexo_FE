import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./types";
import { AUTH_FORGOT_PASSWORD_ENDPOINT } from "@/utils/constants";
import { performLogout } from "@/lib/axios";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  AUTH_LOGIN_ENDPOINT,
  AUTH_REGISTER_ENDPOINT,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  BEARER_TOKEN_PREFIX,
} from "@/utils/constants";
import { AxiosHeaders } from "axios";
import { getCurrentUserProfile } from "@/features/profile/api/profileApi";
import {
  transformProfileData,
  type UserProfile,
} from "@/features/profile/types";

// Transform UserProfile to User for auth slice
const transformToUser = (userProfile: UserProfile): User => ({
  id: parseInt(userProfile.id),
  username: userProfile.username,
  fullName: userProfile.name,
  avatar: userProfile.avatar || undefined,
  bio: userProfile.bio || undefined,
  isPrivate: userProfile.isPrivate,
  followers: userProfile.followersCount,
  following: userProfile.followingCount,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired: boolean;
  twoFactorToken: string | null;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  twoFactorRequired: false,
  twoFactorToken: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
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
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
        state.twoFactorRequired = false;
        state.twoFactorToken = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as
          | { status?: number; message?: string }
          | string
          | undefined;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Đăng nhập thất bại";
      })
      .addCase(
        hydrateAuthAsync.fulfilled,
        (state, action: PayloadAction<User | null>) => {
          state.isHydrated = true;
          if (action.payload) {
            state.user = action.payload;
            state.isAuthenticated = true;
          } else {
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      )
      .addCase(hydrateAuthAsync.rejected, (state) => {
        state.isHydrated = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(hydrateAuthAsync.pending, (state) => {
        state.isHydrated = false;
      });
  },
});

// Thunk: login with real API
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async (credentials: LoginRequest, { rejectWithValue }) => {
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
          api.defaults.headers.set(
            "Authorization",
            `${BEARER_TOKEN_PREFIX} ${access_token}`
          );
        } else {
          const defaultsHeaders = api.defaults.headers as unknown as {
            common?: Record<string, string>;
          };
          defaultsHeaders.common = defaultsHeaders.common || {};
          defaultsHeaders.common.Authorization = `${BEARER_TOKEN_PREFIX} ${access_token}`;
        }
      }

      // Fetch user profile after successful login
      try {
        const profileData = await getCurrentUserProfile();
        const userProfile = transformProfileData(profileData);
        return transformToUser(userProfile);
      } catch (profileError) {
        // If profile fetch fails, still return a basic user object
        console.warn("Failed to fetch user profile:", profileError);
        return {
          id: 1,
          username: "user",
          fullName: "User",
          email: credentials.email,
          avatar: undefined,
          bio: undefined,
          isPrivate: false,
          followers: 0,
          following: 0,
        } as User;
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = axiosError?.response?.status;
      const message =
        axiosError?.response?.data?.message || "Đăng nhập thất bại";
      return rejectWithValue({ status, message });
    }
  }
);

// Thunk: register with real API
export const registerAsync = createAsyncThunk(
  "auth/registerAsync",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<RegisterResponse>(
        AUTH_REGISTER_ENDPOINT,
        {
          email: userData.email,
          username: userData.username,
          fullname: userData.fullname,
          password: userData.password,
        }
      );

      return {
        message: response.data.message,
        userId: response.data.data?.userId,
      };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const errorMessage =
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.message ||
        "Đăng ký thất bại";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk: hydrate auth from stored tokens/profile on app start
export const hydrateAuthAsync = createAsyncThunk(
  "auth/hydrateAuthAsync",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!accessToken && !refreshToken) {
        return null;
      }
      // If we have access token, try fetch profile
      try {
        const profileData = await getCurrentUserProfile();
        const userProfile = transformProfileData(profileData);
        return transformToUser(userProfile);
      } catch (e) {
        // If access token invalid but refresh exists, let interceptors attempt refresh on a lightweight call
        if (refreshToken) {
          try {
            const profileData = await getCurrentUserProfile();
            const userProfile = transformProfileData(profileData);
            return transformToUser(userProfile);
          } catch (e2) {
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      return rejectWithValue("Hydration failed");
    }
  }
);

// Thunk: forgot password (request reset link)
export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPasswordAsync",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(AUTH_FORGOT_PASSWORD_ENDPOINT, {
        EMAIL: payload.email,
      });
      return response.data?.message || "Đã gửi link khôi phục";
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      return rejectWithValue({
        status: err?.response?.status,
        message: err?.response?.data?.message || "Yêu cầu khôi phục thất bại",
      });
    }
  }
);

// Thunk: standardize logout flow (abort refresh, call API, clear tokens, reset state, navigate)
export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (_, { dispatch }) => {
    // Fail-safe: clear client state first
    dispatch(logout());
    await performLogout({ redirect: true });
    toast.success("Bạn đã đăng xuất thành công");
  }
);

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
