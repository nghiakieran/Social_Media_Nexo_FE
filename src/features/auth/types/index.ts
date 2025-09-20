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

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
}
