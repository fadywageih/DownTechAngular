import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../core/services/language.service";
declare const AOS: any;
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  currentLang = 'en';
  private langSubscription!: Subscription;
  constructor(private languageService: LanguageService) {}
  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}