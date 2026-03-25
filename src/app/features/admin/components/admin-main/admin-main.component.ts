import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { LanguageService } from "../../../../core/services/language.service";
import { AdminService } from "../../../../core/services/admin.service";
import { Subscription } from "rxjs";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.css']
})
export class AdminMainComponent implements OnInit {
  currentLang = 'en';
  currentSection = 'dashboard'; // default
  adminName = '';
  private langSubscription!: Subscription;
  private adminSubscription!: Subscription;

  constructor(
    private languageService: LanguageService,
    public adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    this.adminSubscription = this.adminService.currentAdmin$.subscribe(admin => {
      this.adminName = admin?.fullName || '';
    });
  }

  switchSection(section: string): void {
    this.currentSection = section;
    switch(section) {
      case 'dashboard': this.router.navigate(['/admin/dashboard']); break;
      case 'laptops': this.router.navigate(['/admin/laptops']); break;
      case 'maintenance': this.router.navigate(['/admin/maintenance']); break;
      case 'software': this.router.navigate(['/admin/software']); break;
    }
  }

  logout(): void {
    this.adminService.logout();
  }
}

