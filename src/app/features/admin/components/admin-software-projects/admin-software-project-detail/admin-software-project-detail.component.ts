import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SoftwareProjectResponseDto } from "../../../../../core/models/software-project.model";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminSoftwareProjectApiService } from "../../../services/admin-software-project-api.service";

declare const AOS: any;

@Component({
  selector: 'app-admin-software-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-software-project-detail.component.html',
  styleUrls: ['./admin-software-project-detail.component.css']
})
export class AdminSoftwareProjectDetailComponent implements OnInit, OnDestroy {
  project: SoftwareProjectResponseDto | null = null;
  isLoading = true;
  currentLang = 'en';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private adminApi: AdminSoftwareProjectApiService,
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(sub);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
    }

    // Initialize AOS
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProject(id: string): void {
    this.isLoading = true;
    const sub = this.adminApi.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        this.cdr.markForCheck();
        
        // Refresh AOS after content loads
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  editProject(): void {
    if (this.project) {
      this.router.navigate(['/admin/software-projects/edit', this.project.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/software-projects']);
  }
}