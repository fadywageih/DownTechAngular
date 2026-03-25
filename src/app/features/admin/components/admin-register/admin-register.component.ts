import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AdminService } from "../../../../core/services/admin.service";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-register.component.html',
})
export class AdminRegisterComponent implements OnInit, OnDestroy {
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
    private adminService: AdminService,
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
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
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
    this.isLoading = true;
    this.errorMessage = null;
    const adminData = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };
    const registerSub = this.adminService.register(adminData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/admin/admins']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.currentLang === 'en'
          ? error.error?.message || 'Registration failed'
          : 'فشل في التسجيل';
        console.error('Admin register error:', error);
      }
    });
    this.subscriptions.add(registerSub);
  }

  togglePasswordVisibility(type: 'password' | 'confirm'): void {
    if (type === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}

