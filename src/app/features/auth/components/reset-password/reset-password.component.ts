import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription, finalize } from "rxjs";
import { AuthApiService } from "../../services/auth-api.service";
import { LanguageService } from "../../../../core/services/language.service";
import { CustomValidators } from "../../validators/custom-validators";

const passwordMatchValidator = (controlName: string, matchingControlName: string) => {
  return (formGroup: FormGroup) => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  isLoading = false;
  isSuccess = false;
  errorMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  currentLang = 'en';
  private token: string | null = null;
  private email: string | null = null;
  private langSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] ? decodeURIComponent(params['token']) : null;
      this.email = params['email'] ? decodeURIComponent(params['email']) : null;
      
      if (!this.token || !this.email) {
        this.errorMessage = this.currentLang === 'en' 
          ? 'Invalid reset link. Please request a new password reset.' 
          : 'رابط إعادة التعيين غير صالح. يرجى طلب إعادة تعيين كلمة مرور جديدة.';
      }
    });
    
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
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, CustomValidators.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });
  }

  isPasswordMatch(): boolean {
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.isPasswordMatch()) {
      this.errorMessage = this.currentLang === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة';
      return;
    }

    if (!this.token || !this.email) {
      this.errorMessage = this.currentLang === 'en' 
        ? 'Invalid reset link. Please request a new password reset.' 
        : 'رابط إعادة التعيين غير صالح. يرجى طلب إعادة تعيين كلمة مرور جديدة.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const resetData = {
      email: this.email,
      token: this.token,
      password: this.resetForm.get('password')?.value,
      confirmPassword: this.resetForm.get('confirmPassword')?.value
    };

    const resetSub = this.authApiService.resetPassword(resetData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.isSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Reset password error:', error);
          
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.errorMessage = error.error.errors.join(', ');
          } else if (error.error?.errorMessage) {
            this.errorMessage = error.error.errorMessage;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = this.currentLang === 'en' 
              ? 'Invalid or expired reset token. Please request a new password reset.' 
              : 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب إعادة تعيين كلمة مرور جديدة.';
          }
        }
      });

    this.subscriptions.add(resetSub);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  get password() { return this.resetForm.get('password'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  getPasswordStrengthErrors(): any {
    const passwordValue = this.password?.value;
    if (!passwordValue) return null;

    return {
      hasUpperCase: /[A-Z]/.test(passwordValue),
      hasLowerCase: /[a-z]/.test(passwordValue),
      hasNumber: /[0-9]/.test(passwordValue),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
      isValidLength: passwordValue.length >= 8
    };
  }

  getPasswordStrength(): number {
    const errors = this.getPasswordStrengthErrors();
    if (!errors) return 0;
    
    let strength = 0;
    if (errors.isValidLength) strength += 25;
    if (errors.hasUpperCase && errors.hasLowerCase) strength += 25;
    if (errors.hasNumber) strength += 25;
    if (errors.hasSpecialChar) strength += 25;
    
    return strength;
  }
}