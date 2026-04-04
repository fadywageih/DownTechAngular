import { CommonModule } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { AdminAuthResultDto } from "../../../../core/models/admin.model";
import { AdminService } from "../../../../core/services/admin.service";

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {
  isMenuOpen = false;
  isProfileMenuOpen = false;
  currentAdmin: AdminAuthResultDto | null = null;
  currentDate = new Date();
  
  // Navigation items
  navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', active: true },
    { path: '/admin/laptops', label: 'Laptops', icon: 'fas fa-laptop', active: false },
    { path: '/admin/maintenance', label: 'Maintenance', icon: 'fas fa-tools', active: false },
    { path: '/admin/software', label: 'Software', icon: 'fas fa-code', active: false },
    { path: '/admin/add-product', label: 'Add Product', icon: 'fas fa-plus-circle', active: false }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentAdmin = this.adminService.getCurrentAdmin();
    
    // Update current date every minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  logout(): void {
    this.adminService.logout();
  }

  getInitials(): string {
    if (!this.currentAdmin?.fullName) return 'A';
    const names = this.currentAdmin.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return this.currentAdmin.fullName.charAt(0).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.mobile-menu')) {
      this.isMenuOpen = false;
    }
    if (!target.closest('.profile-button') && !target.closest('.profile-dropdown')) {
      this.isProfileMenuOpen = false;
    }
  }
}