import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueResponseDto } from "../../../../core/models/issue.model";
import { AuthService } from "../../../../core/services/auth.service";
import { IssueService } from "../../../../core/services/issue.service";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: 'app-my-issues',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-issues.component.html',
  styleUrls: ['./my-issues.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyIssuesComponent implements OnInit, OnDestroy {
  issues: IssueResponseDto[] = [];
  currentLang = 'en';
  isLoading = true;
  private langSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private issueService: IssueService,
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(this.langSubscription);

    this.loadUserIssues();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUserIssues(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      this.cdr.markForCheck();
      this.router.navigate(['/auth/login']);
      return;
    }

    const userId = this.getUserIdFromToken();
    if (userId) {
      this.issueService.getUserIssues(userId).subscribe({
        next: (issues) => {
          this.issues = issues;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading issues:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      console.error('Unable to extract userId from token');
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found');
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format');
        return null;
      }
      const decoded = JSON.parse(atob(parts[1]));
      const userId = decoded.nameid ? parseInt(decoded.nameid) : null;
      if (!userId) {
        console.error('No nameid claim in token');
      }
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  goToReport(): void {
    this.router.navigate(['/report-issue']);
  }
}