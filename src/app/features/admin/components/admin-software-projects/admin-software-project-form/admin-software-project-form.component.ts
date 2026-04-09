import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { FrontendType, FrontendLibrary, BackendType, BackendFramework, DatabaseType } from "../../../../../core/models/software-project.model";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminSoftwareProjectApiService } from "../../../services/admin-software-project-api.service";

@Component({
  selector: 'app-admin-software-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-software-project-form.component.html',
  styleUrls: ['./admin-software-project-form.component.css']
})
export class AdminSoftwareProjectFormComponent implements OnInit, OnDestroy {
  projectId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  currentLang = 'en';
  errorMessage = '';
  successMessage = '';
  private subscriptions: Subscription = new Subscription();

  // Form data
  nameAr = '';
  nameEn = '';
  descriptionAr = '';
  descriptionEn = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  
  // Multiple images support
  selectedImages: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];
  
  // ✅ استخدام enum values للتخزين
  frontendType: FrontendType = FrontendType.Angular;
  selectedFrontendLibraries: FrontendLibrary[] = [];
  backendType: BackendType = BackendType.DotNet;
  backendFramework: BackendFramework | null = null;
  database: DatabaseType | null = null;
  githubUrl = '';
  liveDemoUrl = '';

  // Options
  frontendTypeOptions = [
    { value: FrontendType.Angular, labelEn: 'Angular', labelAr: 'Angular' },
    { value: FrontendType.React, labelEn: 'React', labelAr: 'React' },
    { value: FrontendType.Vue, labelEn: 'Vue.js', labelAr: 'Vue.js' },
    { value: FrontendType.VanillaJS, labelEn: 'Vanilla JS', labelAr: 'Vanilla JS' },
    { value: FrontendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  frontendLibraryOptions = [
    { value: FrontendLibrary.Tailwind, labelEn: 'Tailwind CSS', labelAr: 'Tailwind CSS' },
    { value: FrontendLibrary.Bootstrap, labelEn: 'Bootstrap', labelAr: 'Bootstrap' },
    { value: FrontendLibrary.MaterialUI, labelEn: 'Material UI', labelAr: 'Material UI' },
    { value: FrontendLibrary.AntDesign, labelEn: 'Ant Design', labelAr: 'Ant Design' },
    { value: FrontendLibrary.ChakraUI, labelEn: 'Chakra UI', labelAr: 'Chakra UI' },
    { value: FrontendLibrary.None, labelEn: 'None', labelAr: 'بدون' },
    { value: FrontendLibrary.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  backendTypeOptions = [
    { value: BackendType.DotNet, labelEn: '.NET', labelAr: '.NET' },
    { value: BackendType.NodeJS, labelEn: 'Node.js', labelAr: 'Node.js' },
    { value: BackendType.Python, labelEn: 'Python', labelAr: 'Python' },
    { value: BackendType.PHP, labelEn: 'PHP', labelAr: 'PHP' },
    { value: BackendType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  backendFrameworkOptions = [
    { value: BackendFramework.AspNetCore, labelEn: 'ASP.NET Core', labelAr: 'ASP.NET Core' },
    { value: BackendFramework.ExpressJS, labelEn: 'Express.js', labelAr: 'Express.js' },
    { value: BackendFramework.Django, labelEn: 'Django', labelAr: 'Django' },
    { value: BackendFramework.Flask, labelEn: 'Flask', labelAr: 'Flask' },
    { value: BackendFramework.Laravel, labelEn: 'Laravel', labelAr: 'Laravel' },
    { value: BackendFramework.None, labelEn: 'None', labelAr: 'بدون' },
    { value: BackendFramework.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  databaseOptions = [
    { value: DatabaseType.SqlServer, labelEn: 'SQL Server', labelAr: 'SQL Server' },
    { value: DatabaseType.MySql, labelEn: 'MySQL', labelAr: 'MySQL' },
    { value: DatabaseType.PostgreSQL, labelEn: 'PostgreSQL', labelAr: 'PostgreSQL' },
    { value: DatabaseType.MongoDB, labelEn: 'MongoDB', labelAr: 'MongoDB' },
    { value: DatabaseType.None, labelEn: 'None', labelAr: 'بدون' },
    { value: DatabaseType.Other, labelEn: 'Other', labelAr: 'أخرى' }
  ];

  // ✅ Helper function to convert string to enum
  private frontendTypeMap: Record<string, FrontendType> = {
    'Angular': FrontendType.Angular,
    'React': FrontendType.React,
    'Vue.js': FrontendType.Vue,
    'Vanilla JS': FrontendType.VanillaJS,
    'Other': FrontendType.Other
  };

  private backendTypeMap: Record<string, BackendType> = {
    '.NET': BackendType.DotNet,
    'Node.js': BackendType.NodeJS,
    'Python': BackendType.Python,
    'PHP': BackendType.PHP,
    'Other': BackendType.Other
  };

  private backendFrameworkMap: Record<string, BackendFramework> = {
    'ASP.NET Core': BackendFramework.AspNetCore,
    'Express.js': BackendFramework.ExpressJS,
    'Django': BackendFramework.Django,
    'Flask': BackendFramework.Flask,
    'Laravel': BackendFramework.Laravel,
    'None': BackendFramework.None,
    'Other': BackendFramework.Other
  };

  private databaseMap: Record<string, DatabaseType> = {
    'SQL Server': DatabaseType.SqlServer,
    'MySQL': DatabaseType.MySql,
    'PostgreSQL': DatabaseType.PostgreSQL,
    'MongoDB': DatabaseType.MongoDB,
    'None': DatabaseType.None,
    'Other': DatabaseType.Other
  };

  private frontendLibraryMap: Record<string, FrontendLibrary> = {
    'Tailwind CSS': FrontendLibrary.Tailwind,
    'Bootstrap': FrontendLibrary.Bootstrap,
    'Material UI': FrontendLibrary.MaterialUI,
    'Ant Design': FrontendLibrary.AntDesign,
    'Chakra UI': FrontendLibrary.ChakraUI,
    'None': FrontendLibrary.None,
    'Other': FrontendLibrary.Other
  };

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

    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEditMode = true;
      this.loadProject();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
    this.imagePreviews.forEach(preview => {
      if (typeof preview === 'string') {
        URL.revokeObjectURL(preview);
      }
    });
  }

  loadProject(): void {
    this.isLoading = true;
    const sub = this.adminApi.getProjectById(this.projectId!).subscribe({
      next: (project) => {
        this.nameAr = project.nameAr;
        this.nameEn = project.nameEn;
        this.descriptionAr = project.descriptionAr;
        this.descriptionEn = project.descriptionEn;
        this.imagePreview = project.imageUrl;
        
        // ✅ تحويل القيم النصية إلى enum values
        this.frontendType = this.frontendTypeMap[project.frontendType] || FrontendType.Angular;
        
        // ✅ تحويل أسماء المكتبات إلى enum values
        this.selectedFrontendLibraries = (project.frontendLibraries || [])
          .map(lib => this.frontendLibraryMap[lib])
          .filter(lib => lib !== undefined);
        
        this.backendType = this.backendTypeMap[project.backendType] || BackendType.DotNet;
        this.backendFramework = project.backendFramework 
          ? this.backendFrameworkMap[project.backendFramework] || null 
          : null;
        this.database = project.database 
          ? this.databaseMap[project.database] || null 
          : null;
        
        this.githubUrl = project.githubUrl || '';
        this.liveDemoUrl = project.liveDemoUrl || '';
        
        this.selectedImages = [];
        this.imagePreviews = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.errorMessage = 'Failed to load project';
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview);
      }
      this.imagePreview = URL.createObjectURL(this.selectedImage);
    }
  }

  onMultipleImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedImages = Array.from(input.files);
      this.imagePreviews = [];
      
      this.selectedImages.forEach((file, index) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          this.imagePreviews[index] = e.target?.result || null;
        };
        fileReader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    if (this.imagePreviews[index] && typeof this.imagePreviews[index] === 'string') {
      URL.revokeObjectURL(this.imagePreviews[index] as string);
    }
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  toggleFrontendLibrary(library: FrontendLibrary): void {
    const index = this.selectedFrontendLibraries.indexOf(library);
    if (index === -1) {
      this.selectedFrontendLibraries.push(library);
    } else {
      this.selectedFrontendLibraries.splice(index, 1);
    }
  }

  isLibrarySelected(library: FrontendLibrary): boolean {
    return this.selectedFrontendLibraries.includes(library);
  }

onSubmit(): void {
  if (!this.nameAr || !this.nameEn || !this.descriptionAr || !this.descriptionEn) {
    this.errorMessage = this.currentLang === 'en' ? 'Please fill all required fields' : 'الرجاء ملء جميع الحقول المطلوبة';
    return;
  }

  if (this.descriptionEn.trim().length < 10) {
    this.errorMessage = this.currentLang === 'en' 
      ? 'English description must be at least 10 characters' 
      : 'يجب أن يكون الوصف الإنجليزي 10 أحرف على الأقل';
    return;
  }

  if (this.descriptionAr.trim().length < 10) {
    this.errorMessage = this.currentLang === 'en' 
      ? 'Arabic description must be at least 10 characters' 
      : 'يجب أن يكون الوصف العربي 10 أحرف على الأقل';
    return;
  }

  if (this.nameEn.trim().length < 2 || this.nameEn.trim().length > 200) {
    this.errorMessage = this.currentLang === 'en' 
      ? 'English name must be between 2 and 200 characters' 
      : 'يجب أن يكون الاسم الإنجليزي بين 2 و 200 حرف';
    return;
  }

  if (this.nameAr.trim().length < 2 || this.nameAr.trim().length > 200) {
    this.errorMessage = this.currentLang === 'en' 
      ? 'Arabic name must be between 2 and 200 characters' 
      : 'يجب أن يكون الاسم العربي بين 2 و 200 حرف';
    return;
  }

  if (!this.isEditMode && !this.selectedImage) {
    this.errorMessage = this.currentLang === 'en' ? 'Please select an image' : 'الرجاء اختيار صورة';
    return;
  }

  this.isSaving = true;
  this.errorMessage = '';
  this.successMessage = '';

  const formData = new FormData();
  
  // ✅ إضافة ID في حالة التعديل
  if (this.isEditMode && this.projectId) {
    formData.append('id', this.projectId);
  }
  
  formData.append('nameAr', this.nameAr.trim());
  formData.append('nameEn', this.nameEn.trim());
  formData.append('descriptionAr', this.descriptionAr.trim());
  formData.append('descriptionEn', this.descriptionEn.trim());
  formData.append('frontendType', this.frontendType.toString());
  formData.append('backendType', this.backendType.toString());
  
  if (this.selectedFrontendLibraries.length > 0) {
    this.selectedFrontendLibraries.forEach(lib => {
      formData.append('frontendLibraries', lib.toString());
    });
  }
  
  if (this.backendFramework) {
    formData.append('backendFramework', this.backendFramework.toString());
  }
  if (this.database) {
    formData.append('database', this.database.toString());
  }
  
  if (this.githubUrl && this.githubUrl.trim()) {
    formData.append('githubUrl', this.githubUrl.trim());
  }
  if (this.liveDemoUrl && this.liveDemoUrl.trim()) {
    formData.append('liveDemoUrl', this.liveDemoUrl.trim());
  }
  
  if (this.selectedImage) {
    formData.append('image', this.selectedImage);
  }

  const request = this.isEditMode && this.projectId
    ? this.adminApi.updateProject(formData)
    : this.adminApi.createProject(formData);

  request.subscribe({
    next: () => {
      this.isSaving = false;
      this.successMessage = this.isEditMode 
        ? (this.currentLang === 'en' ? 'Project updated successfully!' : 'تم تحديث المشروع بنجاح!')
        : (this.currentLang === 'en' ? 'Project created successfully!' : 'تم إنشاء المشروع بنجاح!');
      setTimeout(() => {
        this.router.navigate(['/admin/software-projects']);
      }, 2000);
    },
    error: (error) => {
      console.error('Error saving project:', error);
      
      let errorMsg = this.currentLang === 'en' ? 'Failed to save project' : 'فشل حفظ المشروع';
      
      if (error.error?.errors) {
        const validationErrors: string[] = [];
        
        Object.entries(error.error.errors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            validationErrors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            validationErrors.push(`${field}: ${messages}`);
          }
        });
        
        if (validationErrors.length > 0) {
          errorMsg = validationErrors.join('\n');
        }
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMsg = error.error;
      }
      
      this.errorMessage = errorMsg;
      this.isSaving = false;
    }
  });
}

  cancel(): void {
    this.router.navigate(['/admin/software-projects']);
  }
}