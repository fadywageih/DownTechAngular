import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SoftwareProjectResponseDto } from "../../../../core/models/software-project.model";
import { LanguageService } from "../../../../core/services/language.service";
import { SoftwareProjectService } from "../../../../core/services/software-project.service";

declare const AOS: any;

@Component({
  selector: 'app-software-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './software-project-details.component.html',
  styleUrls: ['./software-project-details.component.css'] 
})
export class SoftwareProjectDetailsComponent implements OnInit, OnDestroy {
  project: SoftwareProjectResponseDto | null = null;
  isLoading = true;
  currentLang = 'en';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private projectService: SoftwareProjectService,
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
    const sub = this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        this.cdr.markForCheck();
        
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

  goBack(): void {
    this.router.navigate(['/software-projects']);
  }

  // ✅ دوال محسنة للتعامل مع البيانات النصية من الباك اند
  getFrontendTypeName(): string {
    return this.project?.frontendType || 'Unknown';
  }

  getBackendTypeName(): string {
    return this.project?.backendType || 'Unknown';
  }

  getBackendFrameworkName(): string {
    return this.project?.backendFramework || 'None';
  }

  getDatabaseName(): string {
    return this.project?.database || 'None';
  }

  getLibraryName(library: string): string {
    // ✅ المكتبات أصبحت string[] مباشرة من الباك اند
    return library || 'Unknown';
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}