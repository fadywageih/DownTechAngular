import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: 'app-check-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './check-inbox.component.html',
})
export class CheckInboxComponent implements OnInit, OnDestroy {
  email: string | null = null;
  currentLang = 'en';
  private langSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
    
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendEmail(): void {
    if (this.email) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }
}