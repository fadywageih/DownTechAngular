import { CommonModule, Location } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Product, ProductUpgrade, UpgradeType, MediaType, CalculatePriceDto, PriceCalculationResultDto } from "../../../../core/models/product.model";
import { AuthService } from "../../../../core/services/auth.service";
import { LanguageService } from "../../../../core/services/language.service";
import { ProductService } from "../../../../core/services/product.service";

declare const AOS: any;

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  currentLang: string = 'en';
  loading: boolean = true;
  selectedImageIndex: number = 0;
  
  selectedRamUpgrade: ProductUpgrade | null = null;
  selectedStorageUpgrade: ProductUpgrade | null = null;
  selectedGpuUpgrade: ProductUpgrade | null = null;
  
  basePrice: number = 0;
  upgradesTotal: number = 0;
  finalPrice: number = 0;
  upgradeBreakdown: any[] = [];
  
  activeTab: 'details' | 'specs' = 'specs';
  quantity: number = 1;
  showVideo: boolean = false;
  
  private subscriptions: Subscription[] = [];
  private productId: string | null = null;

  constructor(
    private productService: ProductService,
    private languageService: LanguageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
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
      this.route.params.subscribe(params => {
        this.productId = params['id'];
        if (this.productId) {
          this.loadProduct();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  goBack(): void {
    this.location.back();
  }

  loadProduct(): void {
    this.loading = true;
    
    this.productService.getProductById(this.productId!).subscribe({
      next: (product) => {
        this.product = product;
        this.basePrice = product.basePrice;
        this.loading = false;
        this.calculatePrice();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getUpgradesByType(type: UpgradeType): ProductUpgrade[] {
    return this.product?.availableUpgrades?.filter(u => u.upgradeType === type) || [];
  }

  hasUpgrades(): boolean {
    if (!this.product) return false;
    return (this.getUpgradesByType(UpgradeType.RAM).length > 0 && this.product.allowRamUpgrade) ||
           (this.getUpgradesByType(UpgradeType.Storage).length > 0 && this.product.allowStorageUpgrade) ||
           (this.getUpgradesByType(UpgradeType.GPU).length > 0 && this.product.allowGpuUpgrade);
  }

  selectUpgrade(type: string, upgrade: ProductUpgrade): void {
    switch(type) {
      case 'ram':
        this.selectedRamUpgrade = upgrade;
        break;
      case 'storage':
        this.selectedStorageUpgrade = upgrade;
        break;
      case 'gpu':
        this.selectedGpuUpgrade = upgrade;
        break;
    }
    this.calculatePrice();
    this.cdr.detectChanges();
  }

  removeUpgrade(type: string): void {
    switch(type) {
      case 'ram':
        this.selectedRamUpgrade = null;
        break;
      case 'storage':
        this.selectedStorageUpgrade = null;
        break;
      case 'gpu':
        this.selectedGpuUpgrade = null;
        break;
    }
    this.calculatePrice();
    this.cdr.detectChanges();
  }

  getMainImage(): string {
    const baseUrl = 'https://localhost:7058';
    const mainImage = this.product?.media?.find(m => m.isMain && m.mediaType === MediaType.Image);
    if (mainImage?.url) {
      if (mainImage.url.startsWith('/uploads')) {
        return `${baseUrl}${mainImage.url}`;
      }
      return mainImage.url;
    }
    return 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
  }

  getImages(): string[] {
    const baseUrl = 'https://localhost:7058';
    return this.product?.media
      ?.filter(m => m.mediaType === MediaType.Image)
      .map(m => {
        if (m.url.startsWith('/uploads')) {
          return `${baseUrl}${m.url}`;
        }
        return m.url;
      }) || [];
  }

  getVideo(): string | null {
    const baseUrl = 'https://localhost:7058';
    const video = this.product?.media?.find(m => m.mediaType === MediaType.Video);
    if (video?.url) {
      if (video.url.startsWith('/uploads')) {
        return `${baseUrl}${video.url}`;
      }
      return video.url;
    }
    return null;
  }

  calculatePrice(): void {
    if (!this.product) return;
    
    const selectedUpgrades = [
      this.selectedRamUpgrade,
      this.selectedStorageUpgrade,
      this.selectedGpuUpgrade
    ].filter(u => u !== null);
    
    const calculateDto: CalculatePriceDto = {
      productId: this.product.id,
      selectedUpgrades: selectedUpgrades.map(u => ({
        upgradeOptionId: u!.upgradeOptionId,
        upgradeType: u!.upgradeType,
        toValue: u!.toValue
      }))
    };
    
    this.productService.calculatePrice(calculateDto).subscribe({
      next: (result: PriceCalculationResultDto) => {
        this.upgradesTotal = result.upgradesTotal;
        this.finalPrice = result.finalPrice;
        this.upgradeBreakdown = result.upgradeBreakdown;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error calculating price:', error);
      }
    });
  }

  getSpecValue(keyEn: string): string {
    const spec = this.product?.specifications?.find(s => s.keyEn === keyEn);
    if (!spec) return '-';
    return this.currentLang === 'en' ? spec.valueEn : spec.valueAr;
  }

  getDisplayName(): string {
    if (!this.product) return '';
    return this.currentLang === 'en' ? this.product.nameEn : this.product.nameAr;
  }

  getDisplayDescription(): string {
    if (!this.product) return '';
    return this.currentLang === 'en' ? this.product.descriptionEn : this.product.descriptionAr;
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      const message = this.currentLang === 'en' 
        ? 'Please login to purchase this product' 
        : 'يرجى تسجيل الدخول لشراء هذا المنتج';
      
      if (confirm(message)) {
        this.router.navigate(['/auth/login']);
      }
      return;
    }
    
    
    alert(this.currentLang === 'en' 
      ? 'Product added to cart successfully!' 
      : 'تم إضافة المنتج إلى السلة بنجاح!');
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.currentLang === 'en' ? 'en-US' : 'ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}