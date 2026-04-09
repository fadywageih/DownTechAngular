import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SoftwareProjectListDto, FrontendType, SoftwareProjectFilterDto } from "../../../../../core/models/software-project.model";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminSoftwareProjectApiService } from "../../../services/admin-software-project-api.service";

@Component({
  selector: 'app-admin-software-projects-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-software-projects-list.component.html',
  styleUrls: ['./admin-software-projects-list.component.css']
})
export class AdminSoftwareProjectsListComponent implements OnInit, OnDestroy {
  projects: SoftwareProjectListDto[] = [];
  isLoading = true;
  currentLang = 'en';
  searchQuery = '';
  selectedFrontendType: FrontendType | null = null;
  
  private subscriptions: Subscription = new Subscription();

  frontendTypeOptions = [
    { value: FrontendType.Angular, labelEn: 'Angular', labelAr: 'Angular' },
    { value: FrontendType.React, labelEn: 'React', labelAr: 'React' },
    { value: FrontendType.Vue, labelEn: 'Vue.js', labelAr: 'Vue.js' },
    { value: FrontendType.VanillaJS, labelEn: 'Vanilla JS', labelAr: 'Vanilla JS' },
    { value: FrontendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  constructor(
    private adminApi: AdminSoftwareProjectApiService,
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
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProjects(): void {
    this.isLoading = true;
    
    // ✅ بناء فلتر صحيح يتوافق مع الباك اند
    const filter: SoftwareProjectFilterDto = {
      searchTerm: this.searchQuery || undefined,
      frontendType: this.selectedFrontendType || undefined,
      pageNumber: 1,
      pageSize: 10
    };

    const sub = this.adminApi.getAllProjects(filter).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    this.loadProjects();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedFrontendType = null;
    this.loadProjects();
  }

  createProject(): void {
    this.router.navigate(['/admin/software-projects/create']);
  }

  viewProject(id: string): void {
    this.router.navigate(['/admin/software-projects', id]);
  }

  editProject(id: string): void {
    this.router.navigate(['/admin/software-projects/edit', id]);
  }

  softDeleteProject(id: string): void {
    if (confirm(this.currentLang === 'en' ? 'Move to trash?' : 'نقل إلى سلة المحذوفات؟')) {
      const sub = this.adminApi.softDeleteProject(id).subscribe({
        next: () => this.loadProjects(),
        error: (err) => console.error('Error soft deleting project:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  deleteProject(id: string): void {
    if (confirm(this.currentLang === 'en' ? 'Permanently delete?' : 'حذف نهائي؟')) {
      const sub = this.adminApi.deleteProject(id).subscribe({
        next: () => this.loadProjects(),
        error: (err) => console.error('Error deleting project:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  // ✅ النوع string مباشرة من الباك اند
  getFrontendTypeLabel(type: string): string {
    return type || '';
  }

  refresh(): void {
    this.loadProjects();
  }
}