export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  success: boolean;
  token?: string;
  message: string;
}

export interface UpdatePasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  saveLogin?: boolean;
}

// UI Form models (shared across auth components)
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    id_token?: string | null;
    token_type: string;
    expires_in: number;
    refresh_expires_in: number;
  };
}

export interface RegisterRequest {
  email: string;
  username: string;
  fullname: string;
  password: string;
}

export interface RegisterResponse {
  status: number;
  message: string;
  data?: {
    userId: string;
  };
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isPrivate: boolean;
  followers: number;
  following: number;
}

export interface UserProfileResponse {
  status: number;
  message: string;
  data: User;
}

export interface TokenPayload {
  access_token?: string;
  refresh_token?: string;
  id_token?: string | null;
  token_type?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

export interface TokenResponse {
  status?: number;
  message?: string;
  data?: TokenPayload;

  access_token?: string;
  refresh_token?: string;
  id_token?: string | null;
  token_type?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}
