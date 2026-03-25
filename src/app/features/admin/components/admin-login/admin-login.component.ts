import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AdminService } from "../../../../core/services/admin.service";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const credentials = this.loginForm.value;
    const loginSub = this.adminService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/admin/admins']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.currentLang === 'en' 
          ? error.error?.message || 'Invalid email or password'
          : 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        console.error('Admin login error:', error);
      }
    });
    this.subscriptions.add(loginSub);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}

