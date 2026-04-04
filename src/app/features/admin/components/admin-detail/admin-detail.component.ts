import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { AdminResultDto } from "../../../../core/models/admin.model";
import { AdminService } from "../../../../core/services/admin.service";

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Details</h1>
          <p class="text-gray-600">View admin profile information</p>
        </div>
        <a routerLink="/admin/admins" class="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-all font-semibold shadow-lg flex items-center space-x-2">
          <i class="fas fa-arrow-left"></i>
          <span>Back to List</span>
        </a>
      </div>

      <div *ngIf="loading" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="admin && !loading" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-8 border-b border-gray-200">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <i class="fas fa-user text-2xl text-white"></i>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ admin.firstName }} {{ admin.lastName }}</h2>
              <p class="text-gray-600">{{ admin.email }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div class="space-y-4">
              <div>
                <span class="text-sm text-gray-500">Role:</span>
                <span class="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {{ admin.role }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-500">Status:</span>
                <span class="ml-2 px-3 py-1 rounded-full text-sm font-medium"
                  [class]="admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ admin.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-500">ID:</span>
                <span class="ml-2 font-mono text-sm text-gray-900">{{ admin.id | slice:0:8 }}...</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
            <div class="space-y-4">
              <div>
                <span class="text-sm text-gray-500">Last Login:</span>
                <span class="ml-2 text-gray-900">{{ admin.lastLogin | date:'medium' }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-500">Created:</span>
                <span class="ml-2 text-gray-900">{{ admin.createdAt | date:'medium' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  `
})
export class AdminDetailComponent implements OnInit {
  admin: AdminResultDto | null = null;
  loading = true;
  error: string | null = null;
  id!: string;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadAdmin();
  }

  loadAdmin(): void {
    this.adminService.getAdminById(this.id).subscribe({
      next: (admin) => {
        this.admin = admin;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Admin not found';
        this.loading = false;
        console.error('Error loading admin:', error);
      }
    });
  }
}

