import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SoftwareProjectListDto, FrontendType, BackendType, DatabaseType } from "../../../../core/models/software-project.model";
import { LanguageService } from "../../../../core/services/language.service";
import { SoftwareProjectService } from "../../../../core/services/software-project.service";

declare const AOS: any;

@Component({
  selector: 'app-software-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './software-project-list.component.html',
  styleUrls: ['./software-project-list.component.css'],
})
export class SoftwareProjectListComponent implements OnInit, OnDestroy {
  projects: SoftwareProjectListDto[] = [];
  filteredProjects: SoftwareProjectListDto[] = [];
  isLoading = true;
  currentLang = 'en';
  searchQuery = '';
  selectedFrontendType: FrontendType | null = null;
  selectedBackendType: BackendType | null = null;
  selectedDatabaseType: DatabaseType | null = null;
  
  frontendMenuOpen = false;
  backendMenuOpen = false;
  databaseMenuOpen = false;
  
  private subscriptions: Subscription = new Subscription();

  frontendTypeOptions = [
    { value: FrontendType.Angular, labelEn: 'Angular', labelAr: 'Angular' },
    { value: FrontendType.React, labelEn: 'React', labelAr: 'React' },
    { value: FrontendType.Vue, labelEn: 'Vue.js', labelAr: 'Vue.js' },
    { value: FrontendType.VanillaJS, labelEn: 'Vanilla JS', labelAr: 'Vanilla JS' },
    { value: FrontendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  backendTypeOptions = [
    { value: BackendType.DotNet, labelEn: '.NET', labelAr: '.NET' },
    { value: BackendType.NodeJS, labelEn: 'Node.js', labelAr: 'Node.js' },
    { value: BackendType.Python, labelEn: 'Python', labelAr: 'Python' },
    { value: BackendType.PHP, labelEn: 'PHP', labelAr: 'PHP' },
    { value: BackendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  databaseTypeOptions = [
    { value: DatabaseType.SqlServer, labelEn: 'SQL Server', labelAr: 'SQL Server' },
    { value: DatabaseType.MySql, labelEn: 'MySQL', labelAr: 'MySQL' },
    { value: DatabaseType.PostgreSQL, labelEn: 'PostgreSQL', labelAr: 'PostgreSQL' },
    { value: DatabaseType.MongoDB, labelEn: 'MongoDB', labelAr: 'MongoDB' },
    { value: DatabaseType.None, labelEn: 'None', labelAr: 'بدون' },
    { value: DatabaseType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  constructor(
    private projectService: SoftwareProjectService,
    private languageService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(sub);
    this.loadProjects();

    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProjects(): void {
    this.isLoading = true;
    const sub = this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
        
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
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
    let filtered = [...this.projects];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.nameEn.toLowerCase().includes(query) || 
        project.nameAr.includes(query) ||
        project.descriptionEn.toLowerCase().includes(query) ||
        project.descriptionAr.includes(query)
      );
    }
    
    if (this.selectedFrontendType !== null) {
      filtered = filtered.filter(project => 
        project.frontendTypeValue === this.selectedFrontendType
      );
    }
    
    if (this.selectedBackendType !== null) {
      filtered = filtered.filter(project => 
        project.backendTypeValue === this.selectedBackendType
      );
    }
    
    if (this.selectedDatabaseType !== null) {
      filtered = filtered.filter(project => 
        project.databaseValue === this.selectedDatabaseType
      );
    }
    
    this.filteredProjects = filtered;
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedFrontendType = null;
    this.selectedBackendType = null;
    this.selectedDatabaseType = null;
    this.frontendMenuOpen = false;
    this.backendMenuOpen = false;
    this.databaseMenuOpen = false;
    this.applyFilters();
  }

  toggleFrontendMenu(): void {
    this.frontendMenuOpen = !this.frontendMenuOpen;
    if (this.frontendMenuOpen) {
      this.backendMenuOpen = false;
      this.databaseMenuOpen = false;
    }
  }

  toggleBackendMenu(): void {
    this.backendMenuOpen = !this.backendMenuOpen;
    if (this.backendMenuOpen) {
      this.frontendMenuOpen = false;
      this.databaseMenuOpen = false;
    }
  }

  toggleDatabaseMenu(): void {
    this.databaseMenuOpen = !this.databaseMenuOpen;
    if (this.databaseMenuOpen) {
      this.frontendMenuOpen = false;
      this.backendMenuOpen = false;
    }
  }

  selectFrontendType(type: FrontendType): void {
    this.selectedFrontendType = type;
    this.frontendMenuOpen = false;
    this.applyFilters();
  }

  selectBackendType(type: BackendType): void {
    this.selectedBackendType = type;
    this.backendMenuOpen = false;
    this.applyFilters();
  }

  selectDatabaseType(type: DatabaseType): void {
    this.selectedDatabaseType = type;
    this.databaseMenuOpen = false;
    this.applyFilters();
  }

  getSelectedFrontendLabel(): string {
    if (this.selectedFrontendType === null) {
      return this.currentLang === 'en' ? 'All' : 'الكل';
    }
    const option = this.frontendTypeOptions.find(t => t.value === this.selectedFrontendType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : (this.currentLang === 'en' ? 'All' : 'الكل');
  }

  getSelectedBackendLabel(): string {
    if (this.selectedBackendType === null) {
      return this.currentLang === 'en' ? 'All' : 'الكل';
    }
    const option = this.backendTypeOptions.find(t => t.value === this.selectedBackendType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : (this.currentLang === 'en' ? 'All' : 'الكل');
  }

  getSelectedDatabaseLabel(): string {
    if (this.selectedDatabaseType === null) {
      return this.currentLang === 'en' ? 'All' : 'الكل';
    }
    const option = this.databaseTypeOptions.find(t => t.value === this.selectedDatabaseType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : (this.currentLang === 'en' ? 'All' : 'الكل');
  }

  viewProject(id: string): void {
    this.router.navigate(['/software-projects', id]);
  }

  getFrontendTypeLabel(type: string): string {
    return type || '';
  }

  getBackendTypeLabel(type: string): string {
    return type || '';
  }

  getDatabaseLabel(db: string | undefined): string {
    return db || 'None';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedFrontendType !== null) count++;
    if (this.selectedBackendType !== null) count++;
    if (this.selectedDatabaseType !== null) count++;
    return count;
  }

  getFrontendFilterLabel(): string {
    if (this.selectedFrontendType === null) return '';
    const option = this.frontendTypeOptions.find(t => t.value === this.selectedFrontendType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }

  getBackendFilterLabel(): string {
    if (this.selectedBackendType === null) return '';
    const option = this.backendTypeOptions.find(t => t.value === this.selectedBackendType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }

  getDatabaseFilterLabel(): string {
    if (this.selectedDatabaseType === null) return '';
    const option = this.databaseTypeOptions.find(t => t.value === this.selectedDatabaseType);
    return option ? (this.currentLang === 'en' ? option.labelEn : option.labelAr) : '';
  }
  getFrontendIcon(type: FrontendType): string {
  switch(type) {
    case FrontendType.Angular: return 'fab fa-angular';
    case FrontendType.React: return 'fab fa-react';
    case FrontendType.Vue: return 'fab fa-vuejs';
    case FrontendType.VanillaJS: return 'fab fa-js';
    default: return 'fas fa-code';
  }
}

getBackendIcon(type: BackendType): string {
  switch(type) {
    case BackendType.DotNet: return 'fab fa-microsoft';
    case BackendType.NodeJS: return 'fab fa-node-js';
    case BackendType.Python: return 'fab fa-python';
    case BackendType.PHP: return 'fab fa-php';
    default: return 'fas fa-server';
  }
}

getDatabaseIcon(type: DatabaseType): string {
  switch(type) {
    case DatabaseType.SqlServer:
      return 'fas fa-server';
    case DatabaseType.MySql:
      return 'fas fa-database';
    case DatabaseType.PostgreSQL:
      return 'fas fa-database';
    case DatabaseType.MongoDB:
      return 'fas fa-database';
    case DatabaseType.None:
      return 'fas fa-ban';
    case DatabaseType.Other:
      return 'fas fa-database';
    default:
      return 'fas fa-database';
  }
}
}