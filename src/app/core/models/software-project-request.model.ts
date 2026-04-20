export interface CreateSoftwareProjectRequestDto {
  userName: string;
  userEmail: string;
phoneNumber: string;
  softwareProjectId: string;
  details: string;
}
export interface SoftwareProjectRequestDto {
  id: string;
  userName: string;
  userEmail: string;
phoneNumber: string; 
  softwareProjectId: string;
  softwareProjectNameEn: string;
  details: string;
  status: string;
  createdAt: string;
}
