// admin-product-api.service.ts
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreateProductDto, UpdateProductDto } from "../../../core/models/admin-product.model";
import { Product, ProductFilterDto, PagedResultDto } from "../../../core/models/product.model";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class AdminProductApiService {
  private readonly endpoints = {
    products: 'product',
    productById: 'product',
    productFilter: 'product/filter',
    productDelete: 'product',
    productSoftDelete: 'product'
  };

  constructor(private apiService: ApiService) {}

  getAllProducts(trackChanges: boolean = false): Observable<Product[]> {
    return this.apiService.get<Product[]>(this.endpoints.products, { trackChanges });
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`${this.endpoints.productById}/${id}`);
  }

  filterProducts(filterDto: ProductFilterDto): Observable<PagedResultDto<Product>> {
    return this.apiService.post<PagedResultDto<Product>>(this.endpoints.productFilter, filterDto);
  }

  createProduct(productDto: CreateProductDto): Observable<Product> {
    const formData = this.convertToFormData(productDto);
    return this.apiService.post<Product>(this.endpoints.products, formData);
  }

  updateProduct(productDto: UpdateProductDto): Observable<Product> {
    const formData = this.convertToFormData(productDto);
    return this.apiService.put<Product>(this.endpoints.products, formData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoints.productDelete}/${id}`);
  }

  softDeleteProduct(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoints.productSoftDelete}/${id}/soft`);
  }

  private convertToFormData(dto: CreateProductDto | UpdateProductDto): FormData {
    const formData = new FormData();
    
    // إضافة الخصائص الأساسية
    Object.keys(dto).forEach(key => {
      if (key === 'mediaFiles') return;
      if (key === 'media') return;  // ✅ منع إضافة media array كاملة
    
      const value = dto[key as keyof typeof dto];
      
      if (value !== undefined && value !== null) {
        if (key === 'specifications') {
          const specs = value as any[];
          specs.forEach((spec: any, index: number) => {
            formData.append(`specifications[${index}].keyAr`, spec.keyAr || '');
            formData.append(`specifications[${index}].keyEn`, spec.keyEn || '');
            formData.append(`specifications[${index}].valueAr`, spec.valueAr || '');
            formData.append(`specifications[${index}].valueEn`, spec.valueEn || '');
            formData.append(`specifications[${index}].isUpgradable`, spec.isUpgradable.toString());
          });
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // ✅ إضافة الـ media كـ JSON string (بدل ما نضيفها كـ fields منفصلة)
    if (dto.media && dto.media.length > 0) {
      // فلتر: بس الـ URLs اللي مش blob
      const validMedia = dto.media.filter(m => m.url && !m.url.startsWith('blob:'));
      if (validMedia.length > 0) {
        formData.append('media', JSON.stringify(validMedia));
      }
    }
    
    // إضافة الملفات الجديدة
    if (dto.mediaFiles && dto.mediaFiles.length > 0) {
      dto.mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }
    
    return formData;
  }
}