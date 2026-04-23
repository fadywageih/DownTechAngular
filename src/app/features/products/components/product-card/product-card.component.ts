import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Product, MediaType } from "../../../../core/models/product.model";
import { LanguageService } from "../../../../core/services/language.service";
import { ProductService } from "../../../../core/services/product.service";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Output() viewDetails = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  currentLang: string = 'en';
  mainImageUrl: string = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
  private productMediaCache = new Map<string, any[]>();

  constructor(
    private languageService: LanguageService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.loadMainImage();
  }

  loadMainImage(): void {
const baseUrl = environment.apiUrl.replace('/api', '');
    if (this.product.media && this.product.media.length > 0) {
      const mainImage = this.product.media.find(m => m.isMain === true) || this.product.media[0];
      if (mainImage?.url) {
        if (mainImage.url.startsWith('/uploads')) {
          this.mainImageUrl = `${baseUrl}${mainImage.url}`;
        } else if (mainImage.url.startsWith('http')) {
          this.mainImageUrl = mainImage.url;
        } else {
          this.mainImageUrl = `${baseUrl}/${mainImage.url}`;
        }
        return;
      }
    }
    this.productService.getProductById(this.product.id).subscribe({
      next: (fullProduct) => {
        if (fullProduct.media && fullProduct.media.length > 0) {
          this.product.media = fullProduct.media;
          const mainImage = fullProduct.media.find(m => m.isMain === true) || fullProduct.media[0];
          if (mainImage?.url) {
            if (mainImage.url.startsWith('/uploads')) {
              this.mainImageUrl = `${baseUrl}${mainImage.url}`;
            } else if (mainImage.url.startsWith('http')) {
              this.mainImageUrl = mainImage.url;
            } else {
              this.mainImageUrl = `${baseUrl}/${mainImage.url}`;
            }
            this.cdr.markForCheck();
          }
        }
      },
      error: (err) => console.error('Failed to load product image:', err)
    });
  }

  get displayName(): string {
    return this.currentLang === 'en' ? this.product.nameEn : this.product.nameAr;
  }

  get conditionText(): string {
    if (this.currentLang === 'en') {
      return this.product.condition === 1 ? 'New' : 'Used';
    }
    return this.product.condition === 1 ? 'جديد' : 'مستعمل';
  }

  get conditionClass(): string {
    return this.product.condition === 1 ? 'bg-green-500' : 'bg-orange-500';
  }

  get price(): string {
    return new Intl.NumberFormat(this.currentLang === 'en' ? 'en-US' : 'ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(this.product.basePrice);
  }

  getSpecsSummary(): string {
    const cpuSpec = this.product.specifications?.find(s => s.keyEn === 'Processor');
    const ramSpec = this.product.specifications?.find(s => s.keyEn === 'RAM');
    
    const parts = [];
    if (cpuSpec) parts.push(this.currentLang === 'en' ? cpuSpec.valueEn : cpuSpec.valueAr);
    if (ramSpec) parts.push(this.currentLang === 'en' ? ramSpec.valueEn : ramSpec.valueAr);
    
    return parts.join(' | ') || (this.currentLang === 'en' ? 'Premium Device' : 'جهاز ممتاز');
  }

onViewDetails(): void {
  this.viewDetails.emit(this.product);
}

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }
}