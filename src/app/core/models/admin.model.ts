export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminCreateDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AdminAuthResultDto {
  id: string;
  email: string;
  fullName: string;
  token: string;
  refreshToken: string;
  role: string;
  lastLogin?: string;
}

export interface AdminResultDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

