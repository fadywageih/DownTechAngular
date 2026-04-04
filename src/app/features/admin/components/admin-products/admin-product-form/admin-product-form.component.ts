import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UpdateProductDto, CreateProductDto, UpdateProductMediaDto } from "../../../../../core/models/admin-product.model";
import { MediaType, ProductType, DeviceCondition, AccessoryType } from "../../../../../core/models/product.model";
import { LanguageService } from "../../../../../core/services/language.service";
import { AdminProductApiService } from "../../../services/admin-product-api.service";

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-product-form.component.html',
  styleUrls: ['./admin-product-form.component.css']
})
export class AdminProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  currentLang: string = 'en';
  loading: boolean = false;
  isEditMode: boolean = false;
  productId: string | null = null;
  uploadedFiles: { 
    mediaId?: string;
    file: File | null, 
    previewUrl: string,
    actualUrl?: string,
    mediaType: MediaType, 
    isMain: boolean, 
    order: number,
    isExisting: boolean
  }[] = [];
  
  productTypes = [
    { value: ProductType.Laptop, labelEn: 'Laptop', labelAr: 'لابتوب' },
    { value: ProductType.PC, labelEn: 'PC', labelAr: 'كمبيوتر مكتبي' },
    { value: ProductType.Accessory, labelEn: 'Accessory', labelAr: 'إكسسوار' }
  ];
  
  conditions = [
    { value: DeviceCondition.New, labelEn: 'New', labelAr: 'جديد' },
    { value: DeviceCondition.Used, labelEn: 'Used', labelAr: 'مستعمل' }
  ];
  
  accessoryTypes = [
    { value: AccessoryType.Monitor, labelEn: 'Monitor', labelAr: 'شاشة' },
    { value: AccessoryType.Keyboard, labelEn: 'Keyboard', labelAr: 'كيبورد' },
    { value: AccessoryType.Mouse, labelEn: 'Mouse', labelAr: 'ماوس' },
    { value: AccessoryType.Printer, labelEn: 'Printer', labelAr: 'طابعة' }
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private adminProductApi: AdminProductApiService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.languageService.currentLang$.subscribe(lang => {
        this.currentLang = lang;
      })
    );
    
    this.initForm();
    
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.productId = params['id'];
          this.loadProduct();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.uploadedFiles.forEach(f => {
      if (!f.isExisting && f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.maxLength(200)]],
      nameEn: ['', [Validators.required, Validators.maxLength(200)]],
      descriptionAr: ['', Validators.maxLength(1000)],
      descriptionEn: ['', Validators.maxLength(1000)],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      productType: [ProductType.Laptop, Validators.required],
      condition: [DeviceCondition.New, Validators.required],
      allowRamUpgrade: [false],
      allowStorageUpgrade: [false],
      allowGpuUpgrade: [false],
      accessoryType: [null],
      isActive: [true],
      specifications: this.fb.array([]),
      media: this.fb.array([])
    });
    
    this.addSpecification();
  }

  get specifications(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  get media(): FormArray {
    return this.productForm.get('media') as FormArray;
  }

  addSpecification(): void {
    this.specifications.push(this.fb.group({
      keyAr: ['', Validators.required],
      keyEn: ['', Validators.required],
      valueAr: ['', Validators.required],
      valueEn: ['', Validators.required],
      isUpgradable: [false]
    }));
  }

  removeSpecification(index: number): void {
    this.specifications.removeAt(index);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    
    const files = Array.from(input.files);
    const currentOrder = this.uploadedFiles.length;
    
    files.forEach((file, index) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension);
      const mediaType = isVideo ? MediaType.Video : MediaType.Image;
      
      const previewUrl = URL.createObjectURL(file);
      
      this.uploadedFiles.push({
        mediaId: undefined,
        file: file,
        previewUrl: previewUrl,
        actualUrl: undefined,
        mediaType: mediaType,
        isMain: this.uploadedFiles.length === 0 && currentOrder === 0 && index === 0,
        order: currentOrder + index,
        isExisting: false
      });
    });
    
    input.value = '';
    this.updateMediaFormArray();
  }
  private updateMediaFormArray(): void {
    while (this.media.length) {
      this.media.removeAt(0);
    }
    
    this.uploadedFiles.forEach((file, index) => {
      let urlToSend = '';
      if (file.isExisting && file.actualUrl) {
        urlToSend = file.actualUrl;
      }
      
      this.media.push(this.fb.group({
        mediaId: [file.mediaId],
        url: [urlToSend],
        mediaType: [file.mediaType, Validators.required],
        order: [index],
        isMain: [file.isMain]
      }));
    });
  }

  setAsMain(index: number): void {
    this.uploadedFiles.forEach((file, i) => {
      file.isMain = i === index;
    });
    this.updateMediaFormArray();
  }

  removeUploadedFile(index: number): void {
    const file = this.uploadedFiles[index];
    
    if (!file.isExisting && file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    
    this.uploadedFiles.splice(index, 1);
    
    this.uploadedFiles.forEach((file, i) => {
      file.order = i;
      if (i === 0 && !this.uploadedFiles.some(f => f.isMain)) {
        file.isMain = true;
      }
    });
    
    this.updateMediaFormArray();
  }
  loadProduct(): void {
    this.loading = true;
    this.adminProductApi.getProductById(this.productId!).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          descriptionAr: product.descriptionAr,
          descriptionEn: product.descriptionEn,
          basePrice: product.basePrice,
          productType: product.productType,
          condition: product.condition,
          allowRamUpgrade: product.allowRamUpgrade,
          allowStorageUpgrade: product.allowStorageUpgrade,
          allowGpuUpgrade: product.allowGpuUpgrade,
          accessoryType: product.accessoryType,
          isActive: product.isActive
        });
        
        while (this.specifications.length) {
          this.specifications.removeAt(0);
        }
        while (this.media.length) {
          this.media.removeAt(0);
        }
        
        this.uploadedFiles.forEach(f => {
          if (!f.isExisting && f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        this.uploadedFiles = [];
        
        product.specifications.forEach(spec => {
          this.specifications.push(this.fb.group({
            keyAr: [spec.keyAr, Validators.required],
            keyEn: [spec.keyEn, Validators.required],
            valueAr: [spec.valueAr, Validators.required],
            valueEn: [spec.valueEn, Validators.required],
            isUpgradable: [spec.isUpgradable]
          }));
        });
        product.media.forEach((media, index) => {
          this.uploadedFiles.push({
            mediaId: undefined,
            file: null,
            previewUrl: media.url,
            actualUrl: media.url,
            mediaType: media.mediaType,
            isMain: media.isMain,
            order: media.order,
            isExisting: true
          });
        });
        
        this.updateMediaFormArray();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    const formValue = this.productForm.value;
const mediaDto: UpdateProductMediaDto[] = this.uploadedFiles
  .filter(file => file.isExisting && file.actualUrl && !file.actualUrl.startsWith('blob:'))  // ✅ فلتر إضافي
  .map((file, index) => ({
    id: file.mediaId,
    url: file.actualUrl!,
    mediaType: file.mediaType,
    order: file.order,
    isMain: file.isMain
  }));
    const newFiles = this.uploadedFiles
      .filter(f => f.file !== null)
      .map(f => f.file as File);
    
    if (this.isEditMode) {
      const updateDto: UpdateProductDto = {
        id: this.productId!,
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
        descriptionAr: formValue.descriptionAr,
        descriptionEn: formValue.descriptionEn,
        basePrice: formValue.basePrice,
        condition: formValue.condition,
        isActive: formValue.isActive,
        allowRamUpgrade: formValue.allowRamUpgrade,
        allowStorageUpgrade: formValue.allowStorageUpgrade,
        allowGpuUpgrade: formValue.allowGpuUpgrade,
        accessoryType: formValue.accessoryType,
        specifications: formValue.specifications,
        media: mediaDto,
        mediaFiles: newFiles
      };
      
      this.adminProductApi.updateProduct(updateDto).subscribe({
        next: () => {
          this.loading = false;
          alert(this.currentLang === 'en' ? 'Product updated successfully!' : 'تم تحديث المنتج بنجاح!');
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.loading = false;
          alert(this.currentLang === 'en' ? 'Error updating product' : 'خطأ في تحديث المنتج');
        }
      });
    } else {
      const createDto: CreateProductDto = {
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
        descriptionAr: formValue.descriptionAr,
        descriptionEn: formValue.descriptionEn,
        basePrice: formValue.basePrice,
        productType: formValue.productType,
        condition: formValue.condition,
        allowRamUpgrade: formValue.allowRamUpgrade,
        allowStorageUpgrade: formValue.allowStorageUpgrade,
        allowGpuUpgrade: formValue.allowGpuUpgrade,
        accessoryType: formValue.accessoryType,
        specifications: formValue.specifications,
        media: [], 
        mediaFiles: newFiles
      };
      
      this.adminProductApi.createProduct(createDto).subscribe({
        next: () => {
          this.loading = false;
          alert(this.currentLang === 'en' ? 'Product created successfully!' : 'تم إنشاء المنتج بنجاح!');
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.loading = false;
          alert(this.currentLang === 'en' ? 'Error creating product' : 'خطأ في إنشاء المنتج');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  getProductTypeLabel(type: ProductType): string {
    const found = this.productTypes.find(t => t.value === type);
    return found ? (this.currentLang === 'en' ? found.labelEn : found.labelAr) : '';
  }
  
  isVideoFile(mediaType: MediaType): boolean {
    return mediaType === MediaType.Video;
  }
}