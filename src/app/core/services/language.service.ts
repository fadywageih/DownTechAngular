import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      this.setLanguage(savedLang);
    }
  }
  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }
  setLanguage(lang: string): void {
    this.currentLangSubject.next(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', lang === 'ar');
  }
  toggleLanguage(): void {
    const newLang = this.currentLangSubject.value === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}