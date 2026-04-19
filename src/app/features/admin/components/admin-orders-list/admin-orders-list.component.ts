import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminOrdersApiService } from '../../services/admin-orders-api.service';
import { ProductRequestDto } from '../../../../core/models/product-request.model';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-admin-orders-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders-list.component.html',
  styleUrls: ['./admin-orders-list.component.css']
})
export class AdminOrdersListComponent implements OnInit {
  orders: ProductRequestDto[] = [];
  loading = false;
  currentLang = 'en';
  totalPending = 0;
  totalContacted = 0;
  totalSold = 0;

  constructor(
    private adminOrdersApi: AdminOrdersApiService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.loadOrders();
    });
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminOrdersApi.getProductRequests().subscribe({
      next: (data) => {
        this.orders = data;
        this.updateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  updateStats(): void {
    this.totalPending = this.orders.filter(o => o.status === 'Pending').length;
    this.totalContacted = this.orders.filter(o => o.status === 'Contacted').length;
    this.totalSold = this.orders.filter(o => o.status === 'Sold').length;
  }

  getStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'Pending': this.currentLang === 'en' ? 'Pending' : 'معلق',
      'Contacted': this.currentLang === 'en' ? 'Contacted' : 'تم التواصل',
      'Sold': this.currentLang === 'en' ? 'Sold' : 'مباع',
      'Rejected': this.currentLang === 'en' ? 'Rejected' : 'مرفوض'
    };
    return statuses[status] || status;
  }

  viewCustomer(order: ProductRequestDto): void {
    alert(`Customer: ${order.userName || 'N/A'}\nPhone: ${order.phone}`);
  }

  contactCustomer(order: ProductRequestDto): void {
    window.open(`tel:${order.phone}`);
  }

  markContacted(order: ProductRequestDto): void {
    // TODO: API to update status
    alert('Update status API pending');
  }

  markSold(order: ProductRequestDto): void {
    // TODO: API to update status
    alert('Update status API pending');
  }

  rejectOrder(order: ProductRequestDto): void {
    // TODO: API to update status
    alert('Update status API pending');
  }
}

