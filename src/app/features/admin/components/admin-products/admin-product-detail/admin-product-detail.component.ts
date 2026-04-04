// admin-product-detail.component.ts
import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Product, MediaType } from "../../../../../core/models/product.model"
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminProductApiService } from "../../../services/admin-product-api.service";

@Component({
  selector: 'app-admin-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-product-detail.component.html',
  styleUrls: ['./admin-product-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  currentLang: string = 'en';
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  showVideo: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private adminProductApi: AdminProductApiService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.languageService.currentLang$.subscribe(lang => {
        this.currentLang = lang;
        this.cdr.detectChanges();
      })
    );
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const productId = params['id'];
        if (productId) {
          this.loadProduct(productId);
        } else {
          this.error = this.currentLang === 'en' 
            ? 'No product ID provided' 
            : 'لم يتم توفير معرف المنتج';
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProduct(productId: string): void {
    console.log('🔄 Loading product with ID:', productId);
    this.loading = true;
    this.cdr.markForCheck();
    
    this.adminProductApi.getProductById(productId).subscribe({
      next: (product) => {
        console.log('✅ Product loaded:', product);
        console.log('📸 Media items:', product.media);
        this.product = product;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('❌ Error loading product:', error);
        this.error = error.message || (this.currentLang === 'en' 
          ? 'Failed to load product details' 
          : 'فشل تحميل تفاصيل المنتج');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  getMainImage(): string {
    if (!this.product?.media) {
      console.log('No media found');
      return '/assets/images/placeholder.jpg';
    }
    const mainImage = this.product.media.find(m => m.isMain && m.mediaType === MediaType.Image);
    console.log('Main image:', mainImage);
    return mainImage?.url || this.getImages()[0] || '/assets/images/placeholder.jpg';
  }

  getImages(): string[] {
    if (!this.product?.media) return [];
    const images = this.product.media
      .filter(m => m.mediaType === MediaType.Image)
      .map(m => m.url);
    console.log('All images:', images);
    return images;
  }

  getVideo(): string | null {
    const video = this.product?.media?.find(m => m.mediaType === MediaType.Video);
    return video?.url || null;
  }

  getDisplayName(): string {
    if (!this.product) return '';
    return this.currentLang === 'en' ? this.product.nameEn : this.product.nameAr;
  }

  getDisplayDescription(): string {
    if (!this.product) return '';
    return this.currentLang === 'en' ? this.product.descriptionEn : this.product.descriptionAr;
  }

  getSpecValue(keyEn: string): string {
    const spec = this.product?.specifications?.find(s => s.keyEn === keyEn);
    if (!spec) return '-';
    return this.currentLang === 'en' ? spec.valueEn : spec.valueAr;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.currentLang === 'en' ? 'en-US' : 'ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  editProduct(): void {
    this.router.navigate(['/admin/products/edit', this.product?.id]);
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}