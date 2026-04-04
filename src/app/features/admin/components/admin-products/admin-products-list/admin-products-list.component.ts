  import { CommonModule } from "@angular/common";
  import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
  import { FormsModule } from "@angular/forms";
  import { RouterModule, Router, NavigationEnd } from "@angular/router";
  import { Subscription } from "rxjs";
  import { Product, PagedResultDto, ProductType, DeviceCondition, ProductFilterDto } from "../../../../../core/models/product.model";
  import { LanguageService } from "../../../../../core/services/language.service";
  import { AdminProductApiService } from "../../../services/admin-product-api.service";

  declare const AOS: any;

  @Component({
    selector: 'app-admin-products-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './admin-products-list.component.html',
    styleUrls: ['./admin-products-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class AdminProductsListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    pagedResult: PagedResultDto<Product> | null = null;
    currentLang: string = 'en';
    loading: boolean = true;
    searchQuery: string = '';
    
    // Filter properties
    selectedType: ProductType | null = null;
    selectedCondition: DeviceCondition | null = null;
    pageNumber: number = 1;
    pageSize: number = 10;
    
    showFilters: boolean = false;
    
    productTypes = [
      { value: ProductType.Laptop, labelEn: 'Laptops', labelAr: 'لابتوبات' },
      { value: ProductType.PC, labelEn: 'PCs', labelAr: 'أجهزة كمبيوتر' },
      { value: ProductType.Accessory, labelEn: 'Accessories', labelAr: 'إكسسوارات' }
    ];
    
    conditions = [
      { value: DeviceCondition.New, labelEn: 'New', labelAr: 'جديد' },
      { value: DeviceCondition.Used, labelEn: 'Used', labelAr: 'مستعمل' }
    ];
    
    private subscriptions: Subscription[] = [];

    constructor(
      private adminProductApi: AdminProductApiService,
      private languageService: LanguageService,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
      this.subscriptions.push(
        this.languageService.currentLang$.subscribe(lang => {
          this.currentLang = lang;
          this.cdr.markForCheck();
        })
      );
      
      // Refresh list when returning from edit/create
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && 
            event.urlAfterRedirects.includes('/admin/products') && 
            !event.urlAfterRedirects.includes('/edit') && 
            !event.urlAfterRedirects.includes('/create')) {
          this.loadProducts();
        }
      });
      
      this.loadProducts();
    }

    ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    loadProducts(): void {
      this.loading = true;
      
      const filter: ProductFilterDto = {
        searchTerm: this.searchQuery || undefined,
        productType: this.selectedType || undefined,
        condition: this.selectedCondition || undefined,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        isActive: true
      };
      
      this.adminProductApi.filterProducts(filter).subscribe({
        next: (result) => {
          this.pagedResult = result;
          this.products = result.items;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }

    applyFilters(): void {
      this.pageNumber = 1;
      this.loadProducts();
    }

    resetFilters(): void {
      this.selectedType = null;
      this.selectedCondition = null;
      this.pageNumber = 1;
      this.searchQuery = '';
      this.loadProducts();
    }

    changePage(page: number): void {
      if (page >= 1 && page <= (this.pagedResult?.totalPages || 1)) {
        this.pageNumber = page;
        this.loadProducts();
      }
    }

    getPageNumbers(): number[] {
      if (!this.pagedResult) return [];
      const totalPages = this.pagedResult.totalPages;
      const currentPage = this.pagedResult.pageNumber;
      const pages: number[] = [];
      
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= totalPages - 2) {
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
          for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
      }
      return pages;
    }

    toggleFilters(): void {
      this.showFilters = !this.showFilters;
    }

    editProduct(product: Product): void {
      this.router.navigate(['/admin/products/edit', product.id]);
    }
    viewProduct(product: Product): void {
      console.log('🔍 Navigating to product details:', product.id, product.nameEn);
      this.router.navigate(['/admin/products', product.id]);
    }

    deleteProduct(product: Product): void {
      const confirmMessage = this.currentLang === 'en' 
        ? `Are you sure you want to delete "${product.nameEn}"?` 
        : `هل أنت متأكد من حذف "${product.nameAr}"؟`;
      
      if (confirm(confirmMessage)) {
        this.adminProductApi.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            alert(this.currentLang === 'en' ? 'Product deleted successfully' : 'تم حذف المنتج بنجاح');
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert(this.currentLang === 'en' ? 'Error deleting product' : 'خطأ في حذف المنتج');
          }
        });
      }
    }

    getDisplayRange(): string {
      if (!this.pagedResult) return '';
      const start = (this.pagedResult.pageNumber - 1) * this.pagedResult.pageSize + 1;
      const end = Math.min(this.pagedResult.pageNumber * this.pagedResult.pageSize, this.pagedResult.totalCount);
      return `${start} ${this.currentLang === 'en' ? 'to' : 'إلى'} ${end} ${this.currentLang === 'en' ? 'of' : 'من'} ${this.pagedResult.totalCount}`;
    }

    softDeleteProduct(product: Product): void {
      const confirmMessage = this.currentLang === 'en' 
        ? `Are you sure you want to soft delete "${product.nameEn}"?` 
        : `هل أنت متأكد من الحذف المؤقت لـ "${product.nameAr}"؟`;
      
      if (confirm(confirmMessage)) {
        this.adminProductApi.softDeleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            alert(this.currentLang === 'en' ? 'Product soft deleted successfully' : 'تم الحذف المؤقت للمنتج بنجاح');
          },
          error: (error) => {
            console.error('Error soft deleting product:', error);
            alert(this.currentLang === 'en' ? 'Error soft deleting product' : 'خطأ في الحذف المؤقت للمنتج');
          }
        });
      }
    }

    createProduct(): void {
      this.router.navigate(['/admin/products/create']);
    }

    getProductTypeLabel(product: Product): string {
      const type = this.productTypes.find(t => t.value === product.productType);
      if (!type) return '';
      return this.currentLang === 'en' ? type.labelEn : type.labelAr;
    }

    getConditionLabel(product: Product): string {
      const condition = this.conditions.find(c => c.value === product.condition);
      if (!condition) return '';
      return this.currentLang === 'en' ? condition.labelEn : condition.labelAr;
    }

    getConditionClass(product: Product): string {
      return product.condition === 1 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
    }

getProductImage(product: Product): string {
    if (product.media && product.media.length > 0) {
        const mainImage = product.media.find(m => m.isMain === true) || product.media[0];
        if (mainImage && mainImage.url && !mainImage.url.startsWith('blob:')) {
            return mainImage.url;
        }
    }
    return 'https://placehold.co/48x48/e2e8f0/64748b?text=No+Image';
}
    formatPrice(price: number): string {
      return new Intl.NumberFormat(this.currentLang === 'en' ? 'en-US' : 'ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0
      }).format(price);
    }

    getActiveFiltersCount(): number {
      let count = 0;
      if (this.selectedType) count++;
      if (this.selectedCondition) count++;
      if (this.searchQuery) count++;
      return count;
    }

    trackByProductId(index: number, product: Product): string {
      return product.id;
    }
  }