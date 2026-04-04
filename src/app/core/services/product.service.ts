import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap, map } from "rxjs";
import { ProductApiService } from "../../features/products/services/product-api.service";
import { Product, ProductType, ProductFilterDto, PagedResultDto, CalculatePriceDto, PriceCalculationResultDto } from "../models/product.model";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private productsSubject = new BehaviorSubject<Product[]>([]);
    public products$ = this.productsSubject.asObservable();
    private selectedProductSubject = new BehaviorSubject<Product | null>(null);
    public selectedProduct$ = this.selectedProductSubject.asObservable();
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    constructor(private productApi: ProductApiService) {}
    loadAllProducts(trackChanges: boolean = false): void {
        this.loadingSubject.next(true);
        this.productApi.getAllProducts(trackChanges).subscribe({
            next: (products) => {
                this.productsSubject.next(products);
                this.loadingSubject.next(false);
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.loadingSubject.next(false);
            }
        });
    }
    loadProductsByType(productType: ProductType): void {
        this.loadingSubject.next(true);
        this.productApi.getProductsByType(productType).subscribe({
            next: (products) => {
                this.productsSubject.next(products);
                this.loadingSubject.next(false);
            },
            error: (error) => {
                console.error('Error loading products by type:', error);
                this.loadingSubject.next(false);
            }
        });
    }
    loadActiveProducts(): void {
        this.loadingSubject.next(true);
        this.productApi.getActiveProducts().subscribe({
            next: (products) => {
                this.productsSubject.next(products);
                this.loadingSubject.next(false);
            },
            error: (error) => {
                console.error('Error loading active products:', error);
                this.loadingSubject.next(false);
            }
        });
    }
    getProductById(id: string): Observable<Product> {
        return this.productApi.getProductById(id).pipe(
            tap(product => this.selectedProductSubject.next(product))
        );
    }
    filterProducts(filterDto: ProductFilterDto): Observable<PagedResultDto<Product>> {
        this.loadingSubject.next(true);
        return this.productApi.filterProducts(filterDto).pipe(
            tap({
                next: () => this.loadingSubject.next(false),
                error: () => this.loadingSubject.next(false)
            })
        );
    }
    calculatePrice(calculateDto: CalculatePriceDto): Observable<PriceCalculationResultDto> {
        return this.productApi.calculatePrice(calculateDto);
    }
    getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
        const filter: ProductFilterDto = { minPrice, maxPrice, pageSize: 100 };
        return this.productApi.filterProducts(filter).pipe(
            map(result => result.items)
        );
    }
    searchProducts(searchTerm: string): Observable<Product[]> {
        const filter: ProductFilterDto = { searchTerm, pageSize: 100 };
        return this.productApi.filterProducts(filter).pipe(
            map(result => result.items)
        );
    }
    clearSelectedProduct(): void {
        this.selectedProductSubject.next(null);
    }
}