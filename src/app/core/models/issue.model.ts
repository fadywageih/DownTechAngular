export enum ProductType {
  Laptop = 1,
  PC = 2,
  Accessory = 3
}

export enum IssueStatus {
  Pending = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4
}

export interface IssueCreateDto {
  productType: ProductType;
  model: string;
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  description: string;
  customerName: string;
  phoneNumber: string;
}

export interface IssueResponseDto {
  id: string;
  productType: ProductType;
  productTypeName: string;
  model: string;
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  description: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  statusValue: number;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  userEmail?: string;
  assignedAdminName?: string;
}

export interface IssueUpdateStatusDto {
  issueId: string;
  issueStatus: IssueStatus;
  adminNotes?: string;
}

export interface IssueFilterDto {
  productType?: ProductType;
  status?: IssueStatus;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IssueStatisticsDto {
  totalIssues: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  issuesByProductType: Record<string, number>;
  averageResolutionTimeHours: number;
}