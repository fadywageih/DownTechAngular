import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SoftwareProjectFilterDto, SoftwareProjectListDto, SoftwareProjectResponseDto, SoftwareProjectStatisticsDto } from "../../../core/models/software-project.model";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class AdminSoftwareProjectApiService {
  private readonly endpoints = {
    projects: 'softwareproject',
    statistics: 'softwareproject/statistics',
    softDelete: 'softwareproject'
  };

  constructor(private apiService: ApiService) {}

  getAllProjects(filter?: SoftwareProjectFilterDto): Observable<SoftwareProjectListDto[]> {
    return this.apiService.get<SoftwareProjectListDto[]>(this.endpoints.projects, filter);
  }

  getProjectById(id: string): Observable<SoftwareProjectResponseDto> {
    return this.apiService.get<SoftwareProjectResponseDto>(`${this.endpoints.projects}/${id}`);
  }

  createProject(formData: FormData): Observable<SoftwareProjectResponseDto> {
    return this.apiService.post<SoftwareProjectResponseDto>(this.endpoints.projects, formData);
  }

  updateProject(formData: FormData): Observable<SoftwareProjectResponseDto> {
    return this.apiService.put<SoftwareProjectResponseDto>(this.endpoints.projects, formData);
  }

  deleteProject(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoints.projects}/${id}`);
  }

  softDeleteProject(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoints.softDelete}/${id}/soft`);
  }

  getStatistics(): Observable<SoftwareProjectStatisticsDto> {
    return this.apiService.get<SoftwareProjectStatisticsDto>(this.endpoints.statistics);
  }
}