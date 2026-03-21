import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../core/services/auth.service";
import { LanguageService } from "../../../../core/services/language.service";
import { AuthApiService } from "../../services/auth-api.service";
import { CustomValidators } from "../../validators/custom-validators";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  currentLang = 'en';
  private langSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', 
        [Validators.required, Validators.email],
        [CustomValidators.emailExistsValidator(this.authApiService)]
      ],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [Validators.required, CustomValidators.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  isPasswordMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    if (!this.isPasswordMatch()) {
      this.errorMessage = this.currentLang === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const userData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
      password: this.registerForm.get('password')?.value,
      confirmPassword: this.registerForm.get('confirmPassword')?.value
    };

    const registerSub = this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errorMessage = error.error.errors.join(', ');
        } else if (error.error?.errorMessage) {
          this.errorMessage = error.error.errorMessage;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = this.currentLang === 'en' 
            ? 'Registration failed. Please try again.' 
            : 'فشل التسجيل. يرجى المحاولة مرة أخرى.';
        }
        console.error('Registration error:', error);
      }
    });

    this.subscriptions.add(registerSub);
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

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