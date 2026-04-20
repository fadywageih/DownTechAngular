import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateSoftwareProjectRequestDto, SoftwareProjectRequestDto } from '../models/software-project-request.model';
import { TokenService } from './token.service';   

@Injectable({
  providedIn: 'root'
})
export class SoftwareProjectRequestService {
  private readonly apiUrl = `https://localhost:7058/api/SoftwareProject`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService 
  ) { }

  private getAdminHeaders(): HttpHeaders {
    const adminToken = this.tokenService.getAdminToken();
    
    if (adminToken) {
      console.log('✅ SoftwareProjectRequestService: Admin token found');
      return new HttpHeaders({
        'Authorization': `Bearer ${adminToken}`
      });
    } else {
      console.warn('⚠️ SoftwareProjectRequestService: No admin token found');
      return new HttpHeaders();
    }
  }

  createRequest(request: CreateSoftwareProjectRequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, request);
  }
  getRequests(): Observable<SoftwareProjectRequestDto[]> {
    const headers = this.getAdminHeaders();
    console.log('📡 Fetching software requests with headers:', headers.has('Authorization'));
    
    return this.http.get<SoftwareProjectRequestDto[]>(`${this.apiUrl}/admin/requests`, { headers });
  }
}