import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueResponseDto, IssueStatisticsDto, IssueFilterDto } from "../../../../core/models/issue.model";
import { IssueService } from "../../../../core/services/issue.service";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: 'app-admin-issues-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-issues-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminIssuesListComponent implements OnInit, OnDestroy {
  issues: IssueResponseDto[] = [];
  isLoading = true;
  showStatistics = false;
  statistics: IssueStatisticsDto | null = null;
  currentLang = 'en';
  private langSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  filters: IssueFilterDto = {
    pageNumber: 1,
    pageSize: 50
  };

  constructor(
    private issueService: IssueService,
    private router: Router,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(this.langSubscription);
    this.loadIssues();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadIssues(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    console.log('Loading admin issues with filters:', this.filters);
    
    const sub = this.issueService.getAllIssues(this.filters).subscribe({
      next: (issues) => {
        console.log('Admin issues loaded:', issues.length);
        this.issues = issues;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.issues = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    this.loadIssues();
  }

  resetFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 50
    };
    this.loadIssues();
  }

  refresh(): void {
    this.loadIssues();
  }

  loadStatistics(): void {
    this.issueService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.showStatistics = true;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/admin/issues', id]);
  }
}