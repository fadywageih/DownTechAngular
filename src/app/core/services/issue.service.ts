import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import {
  IssueCreateDto,
  IssueResponseDto,
  IssueUpdateStatusDto,
  IssueFilterDto,
  IssueStatisticsDto
} from "../models/issue.model";

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly endpoints = {
    create: 'issue/create',
    userIssues: 'issue/user',
    issueById: 'issue',
    adminAll: 'issue/admin/all',
    adminStatus: 'issue/admin/status',
    adminAssign: 'issue/admin/assign',
    adminStatistics: 'issue/admin/statistics'
  };

  constructor(private apiService: ApiService) {}

  // User endpoints
  createIssue(createDto: IssueCreateDto): Observable<IssueResponseDto> {
    return this.apiService.post<IssueResponseDto>(this.endpoints.create, createDto);
  }

  getUserIssues(userId: number): Observable<IssueResponseDto[]> {
    return this.apiService.get<IssueResponseDto[]>(`${this.endpoints.userIssues}/${userId}`);
  }

  getIssueById(id: string): Observable<IssueResponseDto> {
    return this.apiService.get<IssueResponseDto>(`${this.endpoints.issueById}/${id}`);
  }

  // Admin endpoints
  getAllIssues(filter?: IssueFilterDto): Observable<IssueResponseDto[]> {
    return this.apiService.get<IssueResponseDto[]>(this.endpoints.adminAll, filter);
  }

  updateIssueStatus(updateDto: IssueUpdateStatusDto): Observable<IssueResponseDto> {
    return this.apiService.put<IssueResponseDto>(this.endpoints.adminStatus, updateDto);
  }

  assignIssueToAdmin(issueId: string): Observable<IssueResponseDto> {
    return this.apiService.post<IssueResponseDto>(`${this.endpoints.adminAssign}/${issueId}`, {});
  }

  getStatistics(): Observable<IssueStatisticsDto> {
    return this.apiService.get<IssueStatisticsDto>(this.endpoints.adminStatistics);
  }
}