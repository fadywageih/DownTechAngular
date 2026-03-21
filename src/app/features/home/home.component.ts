import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { LanguageService } from "../../core/services/language.service";
import { FooterComponent } from "../../shared/components/footer/footer.component";

declare const AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSection = 'shop';
  currentLang = 'en';
  searchQuery = '';
  isMenuOpen = false;
  private langSubscription!: Subscription;
  
  productsData = [
    { id: 1, nameEn: "ZenBook Pro Duo", nameAr: "زين بوك برو ديو", price: "$1899", specs: "Intel i9, RTX 3070, 32GB RAM", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" },
    { id: 2, nameEn: "MacBook Air M3", nameAr: "ماك بوك إير M3", price: "$1299", specs: "16GB unified, 512GB SSD", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" },
    { id: 3, nameEn: "ROG Strix G16", nameAr: "روق ستركس G16", price: "$1599", specs: "i7-13700H, RTX 4060, 240Hz", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop" },
    { id: 4, nameEn: "ThinkPad X1 Carbon", nameAr: "ثينك باد X1 كاربون", price: "$1749", specs: "Ultra 7, 32GB, 1TB SSD", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop" },
    { id: 5, nameEn: "Gaming Desktop PC", nameAr: "كمبيوتر ألعاب مكتبي", price: "$2199", specs: "Ryzen 9, RTX 4080, 64GB", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=300&fit=crop" },
    { id: 6, nameEn: "Acer Swift Edge", nameAr: "أيسر سويفت إيدج", price: "$1099", specs: "OLED 4K, Ryzen 7, 16GB", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop" }
  ];

  servicesData = [
    { icon: "fa-microchip", titleEn: "Hardware Upgrade", titleAr: "ترقية العتاد", descEn: "SSD, RAM, battery, thermal paste replacement", descAr: "SSD، رام، بطارية، معجون حراري", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop" },
    { icon: "fa-shield-virus", titleEn: "Virus Removal", titleAr: "إزالة الفيروسات", descEn: "Deep scan & performance optimization", descAr: "فحص عميق وتحسين الأداء", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop" },
    { icon: "fa-keyboard", titleEn: "Screen & Keyboard", titleAr: "شاشة ولوحة مفاتيح", descEn: "Cracked screen, key replacement, trackpad fix", descAr: "شاشة مكسورة، استبدال أزرار، لمسة", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop" },
    { icon: "fa-chart-line", titleEn: "System Tune-up", titleAr: "تحسين النظام", descEn: "OS reinstall, driver updates, diagnostics", descAr: "إعادة تثبيت النظام، تحديثات", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop" }
  ];

  projectsData = [
    { id: 1, titleEn: "AI Resume Analyzer", titleAr: "محلل السير الذاتية بالذكاء الاصطناعي", tech: "Python, Flask, GPT API", descEn: "Automated CV scoring with AI feedback", descAr: "تقييم السيرة الذاتية آليًا مع تقرير ذكي", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 2, titleEn: "Smart Inventory Dashboard", titleAr: "لوحة تحكم المخزون الذكية", tech: "React, Node, MongoDB", descEn: "Real-time stock & sales analytics", descAr: "إدارة المخزون والتحليلات لحظيًا", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 3, titleEn: "EcoRoute Logistics", titleAr: "إيكوروت للوجستيات", tech: "Next.js, Mapbox, Tailwind", descEn: "Carbon-efficient delivery routing platform", descAr: "توجيه التوصيل بكفاءة كربونية", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop" }
  ];

  constructor(
    public authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // متابعة تغييرات اللغة
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: false,
        offset: 100,
        mirror: true
      });
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  switchSection(section: string) {
    this.currentSection = section;
    this.searchQuery = '';
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }

  toggleLanguage() {
    this.languageService.toggleLanguage();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
  }

  handleProductClick(product: any) {
    if (!this.authService.isAuthenticated()) {
      const message = this.currentLang === 'en' 
        ? 'Please login to purchase this product' 
        : 'يرجى تسجيل الدخول لشراء هذا المنتج';
      
      if (confirm(message)) {
        this.router.navigate(['/auth/login']);
      }
    } else {
      alert(this.currentLang === 'en' ? 'Product added to cart!' : 'تم إضافة المنتج للسلة!');
    }
  }

  get filteredProducts() {
    if (!this.searchQuery) return this.productsData;
    const query = this.searchQuery.toLowerCase();
    return this.productsData.filter(product => 
      product.nameEn.toLowerCase().includes(query) || 
      product.nameAr.includes(query) ||
      product.specs.toLowerCase().includes(query)
    );
  }

  get filteredServices() {
    if (!this.searchQuery) return this.servicesData;
    const query = this.searchQuery.toLowerCase();
    return this.servicesData.filter(service => 
      service.titleEn.toLowerCase().includes(query) || 
      service.titleAr.includes(query)
    );
  }

  get filteredProjects() {
    if (!this.searchQuery) return this.projectsData;
    const query = this.searchQuery.toLowerCase();
    return this.projectsData.filter(project => 
      project.titleEn.toLowerCase().includes(query) || 
      project.titleAr.includes(query) ||
      project.tech.toLowerCase().includes(query)
    );
  }

  getBrandText(): string {
    return this.currentLang === 'en' ? 'TechHub' : 'تيك هاب';
  }
}