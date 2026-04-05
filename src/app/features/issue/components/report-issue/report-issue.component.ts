import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueService } from "../../../../core/services/issue.service";
import { LanguageService } from "../../../../core/services/language.service";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent implements OnInit {
  reportForm!: FormGroup;
  currentLang = 'en';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  isAuthenticated = false;
  private langSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private languageService: LanguageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    this.isAuthenticated = this.authService.isAuthenticated();
    this.reportForm = this.fb.group({
      productType: [null, [Validators.required]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      processor: [''],
      ram: [''],
      storage: [''],
      gpu: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]]
    });
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      Object.keys(this.reportForm.controls).forEach(key => {
        this.reportForm.get(key)?.markAsTouched();
      });
      return;
    }
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = this.currentLang === 'en' 
        ? 'You must be logged in to submit a report' 
        : 'يجب عليك تسجيل الدخول لإرسال تقرير';
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/report-issue' }
      });
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.issueService.createIssue(this.reportForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = this.currentLang === 'en' 
          ? 'Your report has been submitted successfully! We will contact you soon.' 
          : 'تم إرسال تقريرك بنجاح! سنتواصل معك قريباً.';
        this.reportForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/my-issues']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating issue:', error);
        if (error.status === 401) {
          this.errorMessage = this.currentLang === 'en' 
            ? 'Session expired. Please login again.' 
            : 'انتهت جلستك. الرجاء تسجيل الدخول مرة أخرى.';
          this.router.navigate(['/auth/login']);
          return;
        }
        
        this.errorMessage = error.error?.message || (this.currentLang === 'en' 
          ? 'An error occurred. Please try again.' 
          : 'حدث خطأ. الرجاء المحاولة مرة أخرى.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}