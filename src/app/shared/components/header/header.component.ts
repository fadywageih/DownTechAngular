import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { AdminService } from "../../../core/services/admin.service";
import { LanguageService } from "../../../core/services/language.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentLang = 'en';
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  private langSubscription!: Subscription;
  private adminSubscription!: Subscription;
  
  constructor(
    public authService: AuthService,
    public adminService: AdminService,
    private languageService: LanguageService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    this.adminSubscription = this.adminService.currentAdmin$.subscribe(admin => {
      // تحديث الواجهة عند تغيير حالة الأدمن
    });
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.adminSubscription) {
      this.adminSubscription.unsubscribe();
    }
  }
  
  toggleLanguage() {
    this.languageService.toggleLanguage();
  }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  onImageError(event: any): void {
    console.error('Logo image failed to load');
    event.target.src = 'https://placehold.co/200x60/4f46e5/white?text=DownTech';
  }
  
  getBrandText(): string {
    return this.currentLang === 'en' ? 'Down Tech' : 'داون تك';
  }
  
  navigateToLogin() {
    this.router.navigate(['/auth/login']);
    this.isMobileMenuOpen = false;
  }
  
  navigateToSignUp() {
    this.router.navigate(['/auth/register']);
    this.isMobileMenuOpen = false;
  }
  
  logout() {
    if (this.adminService.getCurrentAdmin()) {
      this.adminService.logout();
    } else {
      this.authService.logout();
    }
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
  }
  
  isAdminAuthenticated(): boolean {
    return this.adminService.isAuthenticated();
  }
  
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
  getCurrentUserName(): string {
    const admin = this.adminService.getCurrentAdmin();
    if (admin) {
      return admin.fullName || 'Admin';
    }
    const user = this.authService.getCurrentUser();
    return user?.displayName || 'User';
  }
  
  getCurrentUserEmail(): string {
    const admin = this.adminService.getCurrentAdmin();
    if (admin) {
      return admin.email || '';
    }
    const user = this.authService.getCurrentUser();
    return user?.email || '';
  }
  
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMobileMenuOpen = false;
    }
  }
  goToReportIssue(): void {
    if (this.isUserAuthenticated()) {
      this.router.navigate(['/issue/report-issue']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/report-issue' }
      });
    }
    this.isMobileMenuOpen = false;
  }
  
  goToMyIssues(): void {
    if (this.isUserAuthenticated()) {
      this.router.navigate(['/issue/my-issues']);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/issue/my-issues' }
      });
    }
    this.isMobileMenuOpen = false;
  }
  
  goToAdminIssues(): void {
    this.router.navigate(['/admin/issues']);
    this.isMobileMenuOpen = false;
  }
  
  goToAdminDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
    this.isMobileMenuOpen = false;
  }
  
  goToAdminProducts(): void {
    this.router.navigate(['/admin/products']);
    this.isMobileMenuOpen = false;
  }
  
  goToAdminAdmins(): void {
    if (this.adminService.hasSuperAdminRole()) {
      this.router.navigate(['/admin/admins']);
    }
    this.isMobileMenuOpen = false;
  }
}