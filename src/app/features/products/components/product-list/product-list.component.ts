import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ProductType } from "../../../../core/models/issue.model";
import { Product, PagedResultDto, DeviceCondition, ProductFilterDto } from "../../../../core/models/product.model";
import { SoftwareProjectListDto, FrontendType } from "../../../../core/models/software-project.model";
import { LanguageService } from "../../../../core/services/language.service";
import { ProductService } from "../../../../core/services/product.service";
import { SoftwareProjectService } from "../../../../core/services/software-project.service";
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { ProductCardComponent } from "../product-card/product-card.component";

declare const AOS: any;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, FooterComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Products
  products: Product[] = [];
  pagedResult: PagedResultDto<Product> | null = null;
  currentLang: string = 'en';
  loading: boolean = true;
  searchQuery: string = '';
  selectedType: ProductType | null = null;
  selectedCondition: DeviceCondition | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'createdAt';
  sortDescending: boolean = true;
  pageNumber: number = 1;
  pageSize: number = 9;
  showFilters: boolean = false;
  activeTab: 'products' | 'software' = 'products';
  softwareProjects: SoftwareProjectListDto[] = [];
  filteredSoftwareProjects: SoftwareProjectListDto[] = [];
  softwareLoading = false;
  softwareSearchQuery = '';
  selectedSoftwareFrontendType: FrontendType | null = null;
  
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
  
  sortOptions = [
    { value: 'createdAt', labelEn: 'Latest', labelAr: 'الأحدث' },
    { value: 'basePrice', labelEn: 'Price', labelAr: 'السعر' },
    { value: 'nameEn', labelEn: 'Name', labelAr: 'الاسم' }
  ];

  private subscriptions: Subscription[] = [];
  private category: string | null = null;

  constructor(
    private productService: ProductService,
    private softwareProjectService: SoftwareProjectService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
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
    
    this.subscriptions.push(
      this.route.data.subscribe(data => {
        this.category = data['category'] || null;
        this.setCategoryFilter();
        this.loadProducts();
      })
    );
    
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['search']) {
          this.searchQuery = params['search'];
          this.loadProducts();
        }
      })
    );
    
    // Load software projects
    this.loadSoftwareProjects();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  setCategoryFilter(): void {
    switch(this.category) {
      case 'laptops':
        this.selectedType = ProductType.Laptop;
        break;
      case 'pcs':
        this.selectedType = ProductType.PC;
        break;
      case 'accessories':
        this.selectedType = ProductType.Accessory;
        break;
      default:
        this.selectedType = null;
    }
  }

  loadProducts(): void {
    this.loading = true;
    
    const filter: ProductFilterDto = {
      searchTerm: this.searchQuery || undefined,
      productType: this.selectedType || undefined,
      condition: this.selectedCondition || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      isActive: true
    };
    
    this.productService.filterProducts(filter).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.products = result.items;
        this.loading = false;
        this.cdr.markForCheck();
        
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
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
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'createdAt';
    this.sortDescending = true;
    this.pageNumber = 1;
    this.searchQuery = '';
    this.loadProducts();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= (this.pagedResult?.totalPages || 1)) {
      this.pageNumber = page;
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

  toggleSort(): void {
    this.sortDescending = !this.sortDescending;
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  handleProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedType) count++;
    if (this.selectedCondition) count++;
    if (this.minPrice) count++;
    if (this.maxPrice) count++;
    if (this.searchQuery) count++;
    return count;
  }

  getHeaderTitle(): string {
    if (this.searchQuery) {
      return this.currentLang === 'en' 
        ? `Search Results: "${this.searchQuery}"` 
        : `نتائج البحث: "${this.searchQuery}"`;
    }
    
    if (this.selectedType !== null) {
      const type = this.productTypes.find(t => t.value === this.selectedType);
      if (type) {
        return this.currentLang === 'en' ? type.labelEn : type.labelAr;
      }
    }
    
    return this.currentLang === 'en' ? 'All Products' : 'جميع المنتجات';
  }

  getHeaderDescription(): string {
    if (this.searchQuery) {
      return this.currentLang === 'en'
        ? `Found ${this.pagedResult?.totalCount || 0} products matching your search`
        : `تم العثور على ${this.pagedResult?.totalCount || 0} منتج مطابق لبحثك`;
    }
    
    return this.currentLang === 'en'
      ? 'Discover our premium collection of laptops, PCs, and accessories'
      : 'اكتشف مجموعتنا المتميزة من اللابتوبات وأجهزة الكمبيوتر والإكسسوارات';
  }

  // ==================== Software Projects Methods ====================
  loadSoftwareProjects(): void {
    this.softwareLoading = true;
    this.softwareProjectService.getAllProjects().subscribe({
      next: (projects) => {
        this.softwareProjects = projects;
        this.filterSoftwareProjects();
        this.softwareLoading = false;
        this.cdr.markForCheck();
        
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading software projects:', error);
        this.softwareLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterSoftwareProjects(): void {
    let filtered = [...this.softwareProjects];
    
    if (this.softwareSearchQuery) {
      const query = this.softwareSearchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.nameEn.toLowerCase().includes(query) || 
        project.nameAr.includes(query) ||
        project.descriptionEn.toLowerCase().includes(query) ||
        project.descriptionAr.includes(query)
      );
    }
    
    // ✅ نقارن بـ frontendTypeValue (الرقم) وليس frontendType (النص)
    if (this.selectedSoftwareFrontendType !== null) {
      filtered = filtered.filter(project => 
        project.frontendTypeValue === this.selectedSoftwareFrontendType
      );
    }
    
    this.filteredSoftwareProjects = filtered;
    this.cdr.markForCheck();
  }

  resetSoftwareFilters(): void {
    this.softwareSearchQuery = '';
    this.selectedSoftwareFrontendType = null;
    this.filterSoftwareProjects();
  }

  // ✅ النوع string مباشرة من الباك اند
  getSoftwareFrontendLabel(type: string): string {
    return type || '';
  }

  viewSoftwareProject(id: string): void {
    this.router.navigate(['/software-projects', id]);
  }
}