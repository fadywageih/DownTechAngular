import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, tap } from "rxjs";
import { ApiService } from "./api.service";
import { SoftwareProjectListDto, SoftwareProjectResponseDto, SoftwareProjectFilterDto } from "../models/software-project.model";

@Injectable({
  providedIn: 'root'
})
export class SoftwareProjectService {
  private readonly endpoint = 'softwareproject';
  private projectsSubject = new BehaviorSubject<SoftwareProjectListDto[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  getAllProjects(filter?: SoftwareProjectFilterDto): Observable<SoftwareProjectListDto[]> {
    this.loadingSubject.next(true);
    return this.apiService.get<SoftwareProjectListDto[]>(this.endpoint, filter).pipe(
      tap({
        next: (projects) => {
          this.projectsSubject.next(projects);
          this.loadingSubject.next(false);
        },
        error: () => this.loadingSubject.next(false)
      })
    );
  }

  getLatestProjects(count: number = 6): Observable<SoftwareProjectListDto[]> {
    return this.apiService.get<SoftwareProjectListDto[]>(`${this.endpoint}/latest`, { count });
  }

  getProjectById(id: string): Observable<SoftwareProjectResponseDto> {
    return this.apiService.get<SoftwareProjectResponseDto>(`${this.endpoint}/${id}`);
  }
}