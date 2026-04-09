export enum FrontendType {
  Angular = 1,
  React = 2,
  Vue = 3,
  VanillaJS = 4,
  Other = 5
}

export enum FrontendLibrary {
  Tailwind = 1,
  Bootstrap = 2,
  MaterialUI = 3,
  AntDesign = 4,
  ChakraUI = 5,
  None = 6,
  Other = 7
}

export enum BackendType {
  DotNet = 1,
  NodeJS = 2,
  Python = 3,
  PHP = 4,
  Other = 5
}

export enum BackendFramework {
  AspNetCore = 1,
  ExpressJS = 2,
  Django = 3,
  Flask = 4,
  Laravel = 5,
  None = 6,
  Other = 7
}

export enum DatabaseType {
  SqlServer = 1,
  MySql = 2,
  PostgreSQL = 3,
  MongoDB = 4,
  None = 5,
  Other = 6
}
export interface SoftwareProjectListDto {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  frontendType: string;      
  frontendTypeValue: number;  
  backendType: string;        
  backendTypeValue: number; 
  backendFramework?: string;  
  backendFrameworkValue?: number;
  database?: string;          
  databaseValue?: number;
  
  githubUrl?: string;
  liveDemoUrl?: string;
  createdAt: string;
}

export interface SoftwareProjectResponseDto {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  
  frontendType: string;           
  frontendTypeValue: number;        
  frontendLibraries: string[];     
  backendType: string;             
  backendTypeValue: number;         
  backendFramework?: string;         
  backendFrameworkValue?: number;
  database?: string;               
  databaseValue?: number;
  
  githubUrl?: string;
  liveDemoUrl?: string;
  createdByAdminId?: string;
  updatedByAdminId?: string;
  createdAt: string;
  updatedAt?: string;
}
export interface SoftwareProjectCreateDto {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: File;
  frontendType: FrontendType;
  frontendLibraries?: FrontendLibrary[];
  backendType: BackendType;
  backendFramework?: BackendFramework;
  database?: DatabaseType;
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface SoftwareProjectUpdateDto {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image?: File;
  frontendType: FrontendType;
  frontendLibraries?: FrontendLibrary[];
  backendType: BackendType;
  backendFramework?: BackendFramework;
  database?: DatabaseType;
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface SoftwareProjectFilterDto {
  searchTerm?: string;
  frontendType?: FrontendType;
  backendType?: BackendType;
  pageNumber?: number;
  pageSize?: number;
}

export interface SoftwareProjectStatisticsDto {
  totalProjects: number;
  projectsByFrontendType: Record<string, number>;
  projectsByBackendType: Record<string, number>;
  totalAngularProjects: number;
  totalReactProjects: number;
  totalDotNetProjects: number;
  totalNodeProjects: number;
  totalPythonProjects: number;
  latestProjectDate: string;
}