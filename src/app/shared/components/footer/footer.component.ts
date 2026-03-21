import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../core/services/language.service";
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  currentLang = 'en';
  private langSubscription!: Subscription;

  constructor(private languageService: LanguageService) {}

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
  getFooterText(): string {
    return this.currentLang === 'en' 
      ? 'All rights reserved. Innovation meets reliability.' 
      : 'جميع الحقوق محفوظة. الابتكار يلتقي بالجودة.';
  }
}