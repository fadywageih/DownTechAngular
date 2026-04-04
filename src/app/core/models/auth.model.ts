export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UserResultDto {
  displayName: string;
  email: string;
  token: string;
  refreshToken?: string | null;
}

export interface ForgetPasswordDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  password: string;
  confirmPassword: string; }