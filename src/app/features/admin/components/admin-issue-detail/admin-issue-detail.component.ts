import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { IssueResponseDto, IssueStatus } from "../../../../core/models/issue.model";
import { IssueService } from "../../../../core/services/issue.service";

@Component({
  selector: 'app-admin-issue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-issue-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminIssueDetailComponent implements OnInit, OnDestroy {
  issue: IssueResponseDto | null = null;
  isLoading = true;
  isSaving = false;
  selectedStatus: IssueStatus = IssueStatus.Pending;
  adminNotes = '';
  errorMessage = '';
  successMessage = '';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIssue(id);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadIssue(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    const sub = this.issueService.getIssueById(id).subscribe({
      next: (issue) => {
        this.issue = issue;
        this.selectedStatus = issue.statusValue;
        this.adminNotes = issue.adminNotes || '';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading issue:', error);
        this.errorMessage = 'Failed to load issue details';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  updateStatus(): void {
    if (!this.issue) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const sub = this.issueService.updateIssueStatus({
      issueId: this.issue.id,
      issueStatus: this.selectedStatus,
      adminNotes: this.adminNotes
    }).subscribe({
      next: (updated) => {
        this.issue = updated;
        this.selectedStatus = updated.statusValue;
        this.adminNotes = updated.adminNotes || '';
        this.isSaving = false;
        this.successMessage = 'Status updated successfully';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.errorMessage = 'Failed to update status';
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  assignToMe(): void {
    if (!this.issue) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const sub = this.issueService.assignIssueToAdmin(this.issue.id).subscribe({
      next: (updated) => {
        this.issue = updated;
        this.selectedStatus = updated.statusValue;
        this.isSaving = false;
        this.successMessage = 'Issue assigned to you successfully';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (error) => {
        console.error('Error assigning issue:', error);
        this.errorMessage = 'Failed to assign issue';
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  goBack(): void {
    this.router.navigate(['/admin/issues']);
  }
}