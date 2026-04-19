import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProductRequestDto } from "../../../core/models/product-request.model";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class AdminOrdersApiService {
  private endpoint = 'admin/product-requests';

  constructor(private apiService: ApiService) {}

  getProductRequests(): Observable<ProductRequestDto[]> {
    return this.apiService.get<ProductRequestDto[]>(this.endpoint);
  }
}

