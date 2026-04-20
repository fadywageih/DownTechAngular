import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueResponseDto, IssueStatisticsDto } from "../../../../../core/models/issue.model";
import { Product, ProductType, DeviceCondition, PagedResultDto, ProductFilterDto } from "../../../../../core/models/product.model";
import { SoftwareProjectListDto, FrontendType, BackendType, DatabaseType } from "../../../../../core/models/software-project.model";
import { SoftwareProjectRequestDto } from "../../../../../core/models/software-project-request.model";
import { SoftwareProjectRequestService } from "../../../../../core/services/software-project-request.service";
import { IssueService } from "../../../../../core/services/issue.service";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminProductApiService } from "../../../services/admin-product-api.service";
import { AdminSoftwareProjectApiService } from "../../../services/admin-software-project-api.service";
import { AdminOrdersListComponent } from "../../admin-orders-list/admin-orders-list.component";

@Component({
  selector: 'app-admin-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,AdminOrdersListComponent],
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
  issuesList: IssueResponseDto[] = [];
  issuesLoading = false;
  issueSearchQuery = '';
  issueStatusFilter: number | null = null;
  issueProductTypeFilter: number | null = null;
  showIssueStats = false;
  statistics: IssueStatisticsDto | null = null;
  
  // Software Projects
  softwareProjects: SoftwareProjectListDto[] = [];
  filteredSoftwareProjects: SoftwareProjectListDto[] = [];
  softwareLoading = false;
  softwareSearchQuery = '';
  softwareFrontendFilter: FrontendType | null = null;
  softwareBackendFilter: BackendType | null = null;
  softwareDatabaseFilter: DatabaseType | null = null;
  activeTab: 'products' | 'maintenance' | 'software' | 'orders' | 'softwarerequests' = 'products';

  softwareRequests: SoftwareProjectRequestDto[] = [];
  softwareRequestsLoading = false;

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
  
  softwareFrontendTypes = [
    { value: FrontendType.Angular, labelEn: 'Angular', labelAr: 'Angular' },
    { value: FrontendType.React, labelEn: 'React', labelAr: 'React' },
    { value: FrontendType.Vue, labelEn: 'Vue.js', labelAr: 'Vue.js' },
    { value: FrontendType.VanillaJS, labelEn: 'Vanilla JS', labelAr: 'Vanilla JS' },
    { value: FrontendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  softwareBackendTypes = [
    { value: BackendType.DotNet, labelEn: '.NET', labelAr: '.NET' },
    { value: BackendType.NodeJS, labelEn: 'Node.js', labelAr: 'Node.js' },
    { value: BackendType.Python, labelEn: 'Python', labelAr: 'Python' },
    { value: BackendType.PHP, labelEn: 'PHP', labelAr: 'PHP' },
    { value: BackendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  softwareDatabaseTypes = [
    { value: DatabaseType.SqlServer, labelEn: 'SQL Server', labelAr: 'SQL Server' },
    { value: DatabaseType.MySql, labelEn: 'MySQL', labelAr: 'MySQL' },
    { value: DatabaseType.PostgreSQL, labelEn: 'PostgreSQL', labelAr: 'PostgreSQL' },
    { value: DatabaseType.MongoDB, labelEn: 'MongoDB', labelAr: 'MongoDB' },
    { value: DatabaseType.None, labelEn: 'None', labelAr: 'بدون' },
    { value: DatabaseType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  constructor(
    private adminProductApi: AdminProductApiService,
    private adminSoftwareApi: AdminSoftwareProjectApiService,
    private softwareRequestService: SoftwareProjectRequestService,
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
    this.loadSoftwareProjects();
    this.loadSoftwareRequests();
  }

  loadSoftwareRequests(): void {
    this.softwareRequestsLoading = true;
    const sub = this.softwareRequestService.getRequests().subscribe({
      next: (requests) => {
        this.softwareRequests = requests;
        this.softwareRequestsLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading software requests:', error);
        this.softwareRequestsLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
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
    
    const sub = this.issueService.getAllIssues(filter).subscribe({
      next: (issues) => {
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

  // ==================== Software Projects Methods ====================
  loadSoftwareProjects(): void {
    this.softwareLoading = true;
    const sub = this.adminSoftwareApi.getAllProjects().subscribe({
      next: (projects) => {
        this.softwareProjects = projects;
        this.filterSoftwareProjects();
        this.softwareLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading software projects:', error);
        this.softwareLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  filterSoftwareProjects(): void {
    let filtered = [...this.softwareProjects];
    
    // فلترة البحث
    if (this.softwareSearchQuery) {
      const query = this.softwareSearchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.nameEn.toLowerCase().includes(query) || 
        project.nameAr.includes(query) ||
        project.descriptionEn.toLowerCase().includes(query) ||
        project.descriptionAr.includes(query)
      );
    }
    
    // فلترة Frontend
    if (this.softwareFrontendFilter !== null) {
      filtered = filtered.filter(project => 
        project.frontendTypeValue === this.softwareFrontendFilter
      );
    }
    
    // فلترة Backend
    if (this.softwareBackendFilter !== null) {
      filtered = filtered.filter(project => 
        project.backendTypeValue === this.softwareBackendFilter
      );
    }
    
    // فلترة Database
    if (this.softwareDatabaseFilter !== null) {
      filtered = filtered.filter(project => 
        project.databaseValue === this.softwareDatabaseFilter
      );
    }
    
    this.filteredSoftwareProjects = filtered;
    this.cdr.markForCheck();
  }

  resetSoftwareFilters(): void {
    this.softwareSearchQuery = '';
    this.softwareFrontendFilter = null;
    this.softwareBackendFilter = null;
    this.softwareDatabaseFilter = null;
    this.filterSoftwareProjects();
  }

  getSoftwareActiveFiltersCount(): number {
    let count = 0;
    if (this.softwareSearchQuery) count++;
    if (this.softwareFrontendFilter !== null) count++;
    if (this.softwareBackendFilter !== null) count++;
    if (this.softwareDatabaseFilter !== null) count++;
    return count;
  }

  // دوال مساعدة لعرض أسماء الفلاتر النشطة
  getSoftwareFrontendFilterLabel(): string {
    if (this.softwareFrontendFilter === null) return '';
    const option = this.softwareFrontendTypes.find(t => t.value === this.softwareFrontendFilter);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }

  getSoftwareBackendFilterLabel(): string {
    if (this.softwareBackendFilter === null) return '';
    const option = this.softwareBackendTypes.find(t => t.value === this.softwareBackendFilter);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }

  getSoftwareDatabaseFilterLabel(): string {
    if (this.softwareDatabaseFilter === null) return '';
    const option = this.softwareDatabaseTypes.find(t => t.value === this.softwareDatabaseFilter);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }

  refreshSoftwareProjects(): void {
    this.loadSoftwareProjects();
  }

  createSoftwareProject(): void {
    this.router.navigate(['/admin/software-projects/create']);
  }

  viewSoftwareProject(id: string): void {
    this.router.navigate(['/admin/software-projects', id]);
  }

  editSoftwareProject(id: string): void {
    this.router.navigate(['/admin/software-projects/edit', id]);
  }

  softDeleteSoftwareProject(id: string): void {
    if (confirm(this.currentLang === 'en' ? 'Move to trash?' : 'نقل إلى سلة المحذوفات؟')) {
      const sub = this.adminSoftwareApi.softDeleteProject(id).subscribe({
        next: () => this.loadSoftwareProjects(),
        error: (err) => console.error('Error soft deleting project:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  deleteSoftwareProject(id: string): void {
    if (confirm(this.currentLang === 'en' ? 'Permanently delete?' : 'حذف نهائي؟')) {
      const sub = this.adminSoftwareApi.deleteProject(id).subscribe({
        next: () => this.loadSoftwareProjects(),
        error: (err) => console.error('Error deleting project:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  getSoftwareFrontendLabel(type: string): string {
    return type || '';
  }

  getSoftwareBackendLabel(type: string): string {
    return type || '';
  }

  getSoftwareDatabaseLabel(db: string | undefined): string {
    return db || 'None';
  }
}