import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription, finalize } from "rxjs";
import { AuthApiService } from "../../services/auth-api.service";
import { LanguageService } from "../../../../core/services/language.service";
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  currentLang = 'en';
  private langSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private languageService: LanguageService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }
  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.subscriptions.unsubscribe();
  }
  private initForm(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const forgotSub = this.authApiService.forgotPassword(this.forgotForm.value.email)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.router.navigate(['/auth/check-inbox'], { 
            queryParams: { email: this.forgotForm.value.email }
          });
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = this.currentLang === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ. يرجى المحاولة مرة أخرى.';
          }
        }
      });
    this.subscriptions.add(forgotSub);
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  get email() { return this.forgotForm.get('email'); }
}