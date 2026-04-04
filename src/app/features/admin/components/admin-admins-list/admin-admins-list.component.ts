import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { AdminResultDto } from "../../../../core/models/admin.model";
import { AdminService } from "../../../../core/services/admin.service";

@Component({
  selector: 'app-admin-admins-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-admins-list.component.html',
  styleUrls: ['./admin-admins-list.component.css']
})
export class AdminAdminsListComponent implements OnInit {
  admins: AdminResultDto[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private router: Router  // ✅ أضف Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAllAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.adminService.logout(); // هذا سيقوم بتسجيل الخروج وتنظيف الـ tokens
  }

  trackById(index: number, admin: AdminResultDto): string {
    return admin.id;
  }
}