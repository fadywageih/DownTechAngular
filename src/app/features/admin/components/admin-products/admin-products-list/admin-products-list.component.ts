import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueResponseDto, IssueStatisticsDto } from "../../../../../core/models/issue.model";
import { Product, ProductType, DeviceCondition, PagedResultDto, ProductFilterDto } from "../../../../../core/models/product.model";
import { IssueService } from "../../../../../core/services/issue.service";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminProductApiService } from "../../../services/admin-product-api.service";

@Component({
  selector: 'app-admin-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-products-list.component.html',
  styleUrls: ['./admin-products-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductsListComponent implements OnInit, OnDestroy {
  // Products
  products: Product[] = [];
  loading = false;
  searchQuery = '';
  selectedType: ProductType | null = null;
  selectedCondition: DeviceCondition | null = null;
  pagedResult: PagedResultDto<Product> | null = null;
  
  // Issues
  activeTab: 'products' | 'maintenance' = 'products';
  issuesList: IssueResponseDto[] = [];
  issuesLoading = false;
  issueSearchQuery = '';
  issueStatusFilter: number | null = null;
  issueProductTypeFilter: number | null = null;
  showIssueStats = false;
  statistics: IssueStatisticsDto | null = null;
  
  currentLang = 'en';
  private subscriptions: Subscription = new Subscription();
  productTypes = [
    { value: ProductType.Laptop, labelEn: 'Laptops', labelAr: 'لابتوبات' },
    { value: ProductType.PC, labelEn: 'PCs', labelAr: 'أجهزة كمبيوتر' },
    { value: ProductType.Accessory, labelEn: 'Accessories', labelAr: 'إكسسوارات' }
  ];
  conditions = [
    { value: DeviceCondition.New, labelEn: 'New', labelAr: 'جديد' },
    { value: DeviceCondition.Used, labelEn: 'Used', labelAr: 'مستعمل' }
  ];

  constructor(
    private adminProductApi: AdminProductApiService,
    private issueService: IssueService,
    private languageService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const langSub = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(langSub);
    this.loadProducts();
    this.loadIssues();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================== Products Methods ====================
  loadProducts(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const filter: ProductFilterDto = {
      searchTerm: this.searchQuery || undefined,
      productType: this.selectedType || undefined,
      condition: this.selectedCondition || undefined,
      pageNumber: this.pagedResult?.pageNumber || 1,
      pageSize: 10,
      isActive: true
    };
    
    const sub = this.adminProductApi.filterProducts(filter).subscribe({
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
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    if (this.pagedResult) {
      this.pagedResult.pageNumber = 1;
    }
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = null;
    this.selectedCondition = null;
    if (this.pagedResult) {
      this.pagedResult.pageNumber = 1;
    }
    this.loadProducts();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedType) count++;
    if (this.selectedCondition) count++;
    if (this.searchQuery) count++;
    return count;
  }

  createProduct(): void {
    this.router.navigate(['/admin/products/create']);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/admin/products', product.id]);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  softDeleteProduct(product: Product): void {
    if (confirm(this.currentLang === 'en' ? 'Move to trash?' : 'نقل إلى سلة المحذوفات؟')) {
      const sub = this.adminProductApi.softDeleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Error soft deleting product:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(this.currentLang === 'en' ? 'Permanently delete?' : 'حذف نهائي؟')) {
      const sub = this.adminProductApi.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Error deleting product:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  getProductImage(product: Product): string {
    const baseUrl = 'https://localhost:7058';
    if (product.media && product.media.length > 0) {
      const mainImage = product.media.find(m => m.isMain === true) || product.media[0];
      if (mainImage?.url) {
        return mainImage.url.startsWith('/uploads') ? `${baseUrl}${mainImage.url}` : mainImage.url;
      }
    }
    return 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
  }

  getProductTypeLabel(product: Product): string {
    const type = this.productTypes.find(t => t.value === product.productType);
    return type ? (this.currentLang === 'en' ? type.labelEn : type.labelAr) : '';
  }

  getConditionLabel(product: Product): string {
    const condition = this.conditions.find(c => c.value === product.condition);
    return condition ? (this.currentLang === 'en' ? condition.labelEn : condition.labelAr) : '';
  }

  getConditionClass(product: Product): string {
    return product.condition === DeviceCondition.New 
      ? 'bg-green-500/20 text-green-300' 
      : 'bg-orange-500/20 text-orange-300';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(price);
  }

  changePage(page: number): void {
    if (this.pagedResult && page !== this.pagedResult.pageNumber && page >= 1 && page <= this.pagedResult.totalPages) {
      this.pagedResult.pageNumber = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getDisplayRange(): string {
    if (!this.pagedResult) return '';
    const start = (this.pagedResult.pageNumber - 1) * this.pagedResult.pageSize + 1;
    const end = Math.min(this.pagedResult.pageNumber * this.pagedResult.pageSize, this.pagedResult.totalCount);
    return `${start} - ${end}`;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  // ==================== Issues Methods ====================
  loadIssues(): void {
    this.issuesLoading = true;
    this.cdr.markForCheck();
    const filter: any = {};
    if (this.issueSearchQuery) filter.searchTerm = this.issueSearchQuery;
    if (this.issueStatusFilter) filter.status = this.issueStatusFilter;
    if (this.issueProductTypeFilter) filter.productType = this.issueProductTypeFilter;
    
    console.log('Loading admin issues with filters:', filter);
    
    const sub = this.issueService.getAllIssues(filter).subscribe({
      next: (issues) => {
        console.log('Admin issues loaded in products list:', issues.length);
        this.issuesList = issues;
        this.issuesLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading admin issues:', error);
        this.issuesList = [];
        this.issuesLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  applyIssueFilters(): void {
    this.loadIssues();
  }

  resetIssueFilters(): void {
    this.issueSearchQuery = '';
    this.issueStatusFilter = null;
    this.issueProductTypeFilter = null;
    this.loadIssues();
  }

  refreshIssues(): void {
    this.loadIssues();
    this.loadStatistics();
  }

  loadStatistics(): void {
    const sub = this.issueService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  viewIssueDetail(id: string): void {
    this.router.navigate(['/admin/issues', id]);
  }
}