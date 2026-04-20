import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SoftwareProjectResponseDto } from "../../../../core/models/software-project.model";
import { SoftwareProjectRequestService } from "../../../../core/services/software-project-request.service";
import { CreateSoftwareProjectRequestDto } from "../../../../core/models/software-project-request.model";
import { LanguageService } from "../../../../core/services/language.service";
import { SoftwareProjectService } from "../../../../core/services/software-project.service";
import { AuthService } from "../../../../core/services/auth.service";

declare const AOS: any;

interface RequestFormData {
  userName: string;
  userEmail: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-software-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './software-project-details.component.html',
  styleUrls: ['./software-project-details.component.css']
})
export class SoftwareProjectDetailsComponent implements OnInit, OnDestroy {
  project: SoftwareProjectResponseDto | null = null;
  isLoading = true;
  currentLang = 'en';
  showRequestForm = false;
  
  requestForm: RequestFormData = {
    userName: '',
    userEmail: '',
    phoneNumber: ''
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private projectService: SoftwareProjectService,
    private softwareRequestService: SoftwareProjectRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const langSub = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });
    this.subscriptions.add(langSub);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.requestForm.userName = currentUser.displayName || '';
      this.requestForm.userEmail = currentUser.email || '';
    }

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
    return library || 'Unknown';
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  openRequestForm(): void {
    if (!this.project) {
      alert('Project not loaded');
      return;
    }
    this.showRequestForm = true;
  }
  cancelRequest(): void {
    this.showRequestForm = false;
  }
  submitRequest(): void {
    if (!this.project) return;
    
    if (!this.requestForm.userName || !this.requestForm.userEmail) {
      alert(this.currentLang === 'en' ? 'Please fill in your name and email' : 'الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }

    const request: CreateSoftwareProjectRequestDto = {
      userName: this.requestForm.userName,
      userEmail: this.requestForm.userEmail,
phoneNumber: this.requestForm.phoneNumber ? this.requestForm.phoneNumber.trim() : '',
      softwareProjectId: this.project.id,
      details: `Request for software project: ${this.currentLang === 'en' ? this.project.nameEn : this.project.nameAr} (${this.project.frontendType} / ${this.project.backendType})`
    };

    this.softwareRequestService.createRequest(request).subscribe({
      next: () => {
        this.showRequestForm = false;
        alert(this.currentLang === 'en' ? 'Request sent successfully!' : 'تم إرسال الطلب بنجاح!');
      },
      error: (error) => {
        console.error('Request error:', error);
        alert(this.currentLang === 'en' ? 'Failed to send request. Try again.' : 'فشل في إرسال الطلب. حاول مرة أخرى.');
      }
    });
  }
}