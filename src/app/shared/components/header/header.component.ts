import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
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
  constructor(
    public authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
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
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMobileMenuOpen = false;
    }
  }
}