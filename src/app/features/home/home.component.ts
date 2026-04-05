import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription, forkJoin } from "rxjs";
import { Product, PagedResultDto, ProductType, DeviceCondition, ProductFilterDto } from "../../core/models/product.model";
import { AuthService } from "../../core/services/auth.service";
import { LanguageService } from "../../core/services/language.service";
import { ProductService } from "../../core/services/product.service";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { ApiService } from "../../core/services/api.service";
import { AboutComponent } from "../ViewOnHome/about/about.component";


declare const AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, FormsModule, AboutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSection = 'shop';
  currentLang = 'en';
  searchQuery = '';
  isMenuOpen = false;
  loading = true;
  allProducts: Product[] = [];
  filteredProductsList: Product[] = [];
  selectedType: ProductType | null = null;
  selectedCondition: DeviceCondition | null = null;
  selectedAccessoryType: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showFilters: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 9;
  totalCount: number = 0;
  totalPages: number = 0;
  slides = [
    {
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop',
      titleEn: 'Premium Gaming Laptops',
      titleAr: 'لابتوبات جيمنج فاخرة',
      descEn: 'Experience ultimate gaming performance with latest RTX graphics',
      descAr: 'استمتع بأداء جيمنج فائق مع أحدث معالجات RTX',
      link: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop',
      titleEn: 'Professional Maintenance',
      titleAr: 'صيانة احترافية',
      descEn: 'Expert repair services with 6-month warranty',
      descAr: 'خدمات إصلاح احترافية مع ضمان 6 أشهر',
      link: '/maintenance'
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
      titleEn: 'Custom Software Solutions',
      titleAr: 'حلول برمجية مخصصة',
      descEn: 'Innovative web apps and AI solutions for your business',
      descAr: 'تطبيقات ويب مبتكرة وحلول ذكاء اصطناعي لعملك',
      link: '/projects'
    }
  ];
  
  currentSlide: number = 0;
  private slideInterval: any;
servicesData = [
  { id: 'hardware-upgrade', icon: "fa-microchip", titleEn: "Hardware Upgrade", titleAr: "ترقية العتاد", descEn: "SSD, RAM, battery, thermal paste replacement", descAr: "SSD، رام، بطارية، معجون حراري", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop" },
  { id: 'virus-removal', icon: "fa-shield-virus", titleEn: "Virus Removal", titleAr: "إزالة الفيروسات", descEn: "Deep scan & performance optimization", descAr: "فحص عميق وتحسين الأداء", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop" },
  { id: 'screen-keyboard', icon: "fa-keyboard", titleEn: "Screen & Laptop batteries ", titleAr: "شاشة ولوحة مفاتيح", descEn: "Cracked screen, key replacement, trackpad fix", descAr: "شاشة مكسورة، استبدال أزرار، لمسة", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop" },
  { id: 'system-tuneup', icon: "fa-chart-line", titleEn: "System Tune-up", titleAr: "تحسين النظام", descEn: "OS reinstall, driver updates, diagnostics", descAr: "إعادة تثبيت النظام، تحديثات", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop" }
];

  projectsData = [
    { id: 1, titleEn: "AI Resume Analyzer", titleAr: "محلل السير الذاتية بالذكاء الاصطناعي", tech: "Python, Flask, GPT API", descEn: "Automated CV scoring with AI feedback", descAr: "تقييم السيرة الذاتية آليًا مع تقرير ذكي", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 2, titleEn: "Smart Inventory Dashboard", titleAr: "لوحة تحكم المخزون الذكية", tech: "React, Node, MongoDB", descEn: "Real-time stock & sales analytics", descAr: "إدارة المخزون والتحليلات لحظيًا", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 3, titleEn: "EcoRoute Logistics", titleAr: "إيكوروت للوجستيات", tech: "Next.js, Mapbox, Tailwind", descEn: "Carbon-efficient delivery routing platform", descAr: "توجيه التوصيل بكفاءة كربونية", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop" }
  ];
  productTypes = [
    { value: ProductType.Laptop, labelEn: 'Laptops', labelAr: 'لابتوبات' },
    { value: ProductType.PC, labelEn: 'PCs', labelAr: 'أجهزة كمبيوتر' },
    { value: ProductType.Accessory, labelEn: 'Accessories', labelAr: 'إكسسوارات' }
  ];
  conditions = [
    { value: DeviceCondition.New, labelEn: 'New', labelAr: 'جديد' },
    { value: DeviceCondition.Used, labelEn: 'Used', labelAr: 'مستعمل' }
  ];
  accessoryTypes = [
    { value: 1, labelEn: 'Monitors', labelAr: 'شاشات' },
    { value: 2, labelEn: 'Keyboards', labelAr: 'كيبوردات' },
    { value: 3, labelEn: 'Mice', labelAr: 'فأرات' },
    { value: 4, labelEn: 'Printers', labelAr: 'طابعات' }
  ];
  private langSubscription!: Subscription;
  private productsSubscription!: Subscription;
  
  constructor(
    public authService: AuthService,
    private languageService: LanguageService,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public apiService: ApiService
  ) {}
  
  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.loadProducts();
    this.startSlideShow();
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          once: false,
          offset: 100,
          mirror: true
        });
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
  
  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); 
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.markForCheck();
  }
  
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.cdr.markForCheck();
  }
  
  goToSlide(index: number): void {
    this.currentSlide = index;
    this.cdr.markForCheck();
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlideShow();
    }
  }
  
  onSlideButtonClick(slide: any): void {
    if (slide.link === '/products') {
      this.switchSection('shop');
    } else if (slide.link === '/maintenance') {
      this.switchSection('maintenance');
    } else if (slide.link === '/projects') {
      this.switchSection('projects');
    }
    setTimeout(() => {
      const element = document.getElementById(slide.link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  loadProducts(): void {
    this.loading = true;
    
    const filter: ProductFilterDto = {
        searchTerm: this.searchQuery || undefined,
        productType: this.selectedType || undefined,
        condition: this.selectedCondition || undefined,
        minPrice: this.minPrice || undefined,
        maxPrice: this.maxPrice || undefined,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        isActive: true
    };
    
    this.productService.filterProducts(filter).subscribe({
        next: (result: PagedResultDto<Product>) => {
            this.filteredProductsList = result.items;
            this.totalCount = result.totalCount;
            this.totalPages = result.totalPages;
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
    this.selectedAccessoryType = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.searchQuery = '';
    this.pageNumber = 1;
    this.loadProducts();
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  goToService(serviceId: string): void {
  this.router.navigate(['/service', serviceId]);
}
  getPageNumbers(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      if (this.pageNumber <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (this.pageNumber >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) pages.push(i);
      } else {
        for (let i = this.pageNumber - 2; i <= this.pageNumber + 2; i++) pages.push(i);
      }
    }
    return pages;
  }
  
  onImageError(event: Event, product: Product): void {
    console.error('Image failed to load for product:', product.nameEn);
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
  }
  
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedType) count++;
    if (this.selectedCondition) count++;
    if (this.selectedAccessoryType) count++;
    if (this.minPrice) count++;
    if (this.maxPrice) count++;
    if (this.searchQuery) count++;
    return count;
  }
  
  getDisplayRange(): string {
    const start = (this.pageNumber - 1) * this.pageSize + 1;
    const end = Math.min(this.pageNumber * this.pageSize, this.totalCount);
    return `${start} ${this.currentLang === 'en' ? 'to' : 'إلى'} ${end} ${this.currentLang === 'en' ? 'of' : 'من'} ${this.totalCount}`;
  }
  
  switchSection(section: string): void {
    this.currentSection = section;
    this.searchQuery = '';
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }
  
  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  handleProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
  
  get filteredProducts(): Product[] {
    return this.filteredProductsList;
  }
  
  get filteredServices() {
    if (!this.searchQuery) return this.servicesData;
    const query = this.searchQuery.toLowerCase();
    return this.servicesData.filter(service => 
      service.titleEn.toLowerCase().includes(query) || 
      service.titleAr.includes(query) ||
      service.descEn.toLowerCase().includes(query) ||
      service.descAr.includes(query)
    );
  }
  
  get filteredProjects() {
    if (!this.searchQuery) return this.projectsData;
    const query = this.searchQuery.toLowerCase();
    return this.projectsData.filter(project => 
      project.titleEn.toLowerCase().includes(query) || 
      project.titleAr.includes(query) ||
      project.tech.toLowerCase().includes(query) ||
      project.descEn.toLowerCase().includes(query) ||
      project.descAr.includes(query)
    );
  }
  
  getBrandText(): string {
    return this.currentLang === 'en' ? 'DownTech' : 'داون تك';
  }

  private productMediaCache = new Map<string, any[]>();

  getProductImage(product: Product): string {
    const baseUrl = 'https://localhost:7058';
    if (product.media && product.media.length > 0) {
        const mainImage = product.media.find(m => m.isMain === true) || product.media[0];
        if (mainImage?.url) {
            if (mainImage.url.startsWith('/uploads')) {
                return `${baseUrl}${mainImage.url}`;
            }
            return mainImage.url;
        }
    }
    const cachedMedia = this.productMediaCache.get(product.id);
    if (cachedMedia && cachedMedia.length > 0) {
        product.media = cachedMedia;
        this.cdr.markForCheck();
        const mainImage = cachedMedia.find(m => m.isMain === true) || cachedMedia[0];
        if (mainImage?.url) {
            if (mainImage.url.startsWith('/uploads')) {
                return `${baseUrl}${mainImage.url}`;
            }
            return mainImage.url;
        }
    }
    if (!this.loading) {
        this.productService.getProductById(product.id).subscribe({
            next: (fullProduct) => {
                if (fullProduct.media && fullProduct.media.length > 0) {
                    this.productMediaCache.set(product.id, fullProduct.media);
                    product.media = fullProduct.media;
                    this.cdr.markForCheck();
                }
            },
            error: (err) => console.error('Failed to load product details:', err)
        });
    }
    return 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
  }
  
  getProductPrice(product: Product): string {
    return new Intl.NumberFormat(this.currentLang === 'en' ? 'en-US' : 'ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(product.basePrice);
  }
  
  getProductSpecs(product: Product): string {
    const cpuSpec = product.specifications?.find(s => s.keyEn === 'Processor' || s.keyAr === 'معالج');
    const ramSpec = product.specifications?.find(s => s.keyEn === 'RAM' || s.keyAr === 'رام');
    const gpuSpec = product.specifications?.find(s => s.keyEn === 'GPU' || s.keyAr === 'كارت شاشة');
    
    const parts = [];
    if (cpuSpec) parts.push(this.currentLang === 'en' ? cpuSpec.valueEn : cpuSpec.valueAr);
    if (ramSpec) parts.push(this.currentLang === 'en' ? ramSpec.valueEn : ramSpec.valueAr);
    if (gpuSpec) parts.push(this.currentLang === 'en' ? gpuSpec.valueEn : gpuSpec.valueAr);
    
    return parts.join(' | ') || (this.currentLang === 'en' ? 'Premium Device' : 'جهاز ممتاز');
  }
  
  getProductTypeLabel(product: Product): string {
    const type = this.productTypes.find(t => t.value === product.productType);
    return type ? (this.currentLang === 'en' ? type.labelEn : type.labelAr) : '';
  }
}