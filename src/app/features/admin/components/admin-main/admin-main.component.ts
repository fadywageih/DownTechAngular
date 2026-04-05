import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AdminService } from "../../../../core/services/admin.service";
import { LanguageService } from "../../../../core/services/language.service";
import { HeaderComponent } from "../../../../shared/components/header/header.component";
@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent],
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.css']
})
export class AdminMainComponent implements OnInit {
  currentLang = 'en';
  currentSection = 'products'; 
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
      case 'products':
        this.router.navigate(['/admin/products']);
        break;
      case 'issues':
        this.router.navigate(['/admin/issues']);
        break;
      case 'admins':
        this.router.navigate(['/admin/admins']);
        break;
    }
  }

  logout(): void {
    this.adminService.logout();
  }
}