import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product, ProductFilterDto, PagedResultDto, CalculatePriceDto, PriceCalculationResultDto } from "../../../core/models/product.model";
import { ApiService } from "../../../core/services/api.service";
import { CreateProductRequestDto } from "../../../core/models/product-request.model";

@Injectable({
    providedIn: 'root'
})
export class ProductApiService {
    private endpoint = 'product';

    constructor(private apiService: ApiService) {}

    getAllProducts(trackChanges: boolean = false): Observable<Product[]> {
        return this.apiService.get<Product[]>(this.endpoint, { trackChanges });
    }

    getActiveProducts(): Observable<Product[]> {
        return this.apiService.get<Product[]>(`${this.endpoint}/active`);
    }

    getProductsByType(productType: number): Observable<Product[]> {
        return this.apiService.get<Product[]>(`${this.endpoint}/type/${productType}`);
    }

    getProductsByCondition(condition: number): Observable<Product[]> {
        return this.apiService.get<Product[]>(`${this.endpoint}/condition/${condition}`);
    }

    getProductById(id: string): Observable<Product> {
        return this.apiService.get<Product>(`${this.endpoint}/${id}`);
    }

    filterProducts(filterDto: ProductFilterDto): Observable<PagedResultDto<Product>> {
        return this.apiService.post<PagedResultDto<Product>>(`${this.endpoint}/filter`, filterDto);
    }

    calculatePrice(calculateDto: CalculatePriceDto): Observable<PriceCalculationResultDto> {
        return this.apiService.post<PriceCalculationResultDto>(`${this.endpoint}/calculate-price`, calculateDto);
    }

    isProductExists(id: string): Observable<boolean> {
        return this.apiService.get<boolean>(`${this.endpoint}/exists/${id}`);
    }

    isProductNameExists(nameAr: string, nameEn: string): Observable<boolean> {
        return this.apiService.get<boolean>(`${this.endpoint}/check-name`, { nameAr, nameEn });
    }

    createProductRequest(dto: CreateProductRequestDto): Observable<any> {
        return this.apiService.post(`${this.endpoint}/request`, dto);
    }
}

