import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;

  selectedSalesPeriod: 7 | 30 | 90 = 7;

  // Mock KPI data (to be replaced with real API calls)
  kpis: Array<{ label: string; value: string; trend: string; trendDir: string; icon: IconProp; color: string }> = [
    { label: 'Total Sales', value: '124,500 TND', trend: '+12.5%', trendDir: 'up', icon: 'chart-line' as IconProp, color: 'blue' },
    { label: 'Pending Orders', value: '48', trend: '+8 today', trendDir: 'up', icon: 'shopping-cart' as IconProp, color: 'orange' },
    { label: 'Delivered', value: '312', trend: '+23 this week', trendDir: 'up', icon: 'truck' as IconProp, color: 'green' },
    { label: 'Revenue', value: '89,200 TND', trend: '-3.2%', trendDir: 'down', icon: 'file-invoice-dollar' as IconProp, color: 'red' },
  ];

  recentOrders = [
    { id: '#ORD-2847', client: 'Tunisie Telecom', amount: '4,200 TND', status: 'DELIVERED', date: '2 hours ago' },
    { id: '#ORD-2846', client: 'Ooredoo Tunisia', amount: '12,800 TND', status: 'SHIPPED', date: '5 hours ago' },
    { id: '#ORD-2845', client: 'Orange Tunisia', amount: '6,500 TND', status: 'APPROVED', date: '1 day ago' },
    { id: '#ORD-2844', client: 'Distri-Plus SARL', amount: '2,150 TND', status: 'SUBMITTED', date: '1 day ago' },
    { id: '#ORD-2843', client: 'MegaStore Sfax', amount: '8,900 TND', status: 'DRAFT', date: '2 days ago' },
  ];

  recentActivity = [
    { text: 'New order #ORD-2847 placed by Tunisie Telecom', time: '2 hours ago', type: 'info' },
    { text: 'Delivery #DEL-1204 completed successfully', time: '3 hours ago', type: 'success' },
    { text: 'Low stock alert: SKU-1024 (< 10 units)', time: '5 hours ago', type: 'warning' },
    { text: 'Invoice #INV-987 paid by Ooredoo', time: '1 day ago', type: 'success' },
    { text: 'Delivery #DEL-1198 delayed - address issue', time: '1 day ago', type: 'danger' },
  ];

  alerts = [
    { text: 'Product "SIM Card Premium" - stock below threshold (8 remaining)', type: 'warning' },
    { text: 'Delivery #DEL-1201 delayed by 2 days', type: 'danger' },
    { text: '3 orders pending approval for > 48h', type: 'warning' },
  ];

  salesSeriesByPeriod: Record<7 | 30 | 90, number[]> = {
    7: [9800, 11400, 10200, 12800, 12100, 13700, 14900],
    30: [6200, 7100, 6800, 7400, 7900, 7600, 8100, 8400, 8800, 8600],
    90: [4200, 4600, 5100, 5500, 5900, 6400, 7000, 7400, 7900, 8300],
  };

  ordersByStatus: Array<{ label: string; value: number; color: string }> = [
    { label: 'Draft', value: 14, color: '#94a3b8' },
    { label: 'Submitted', value: 22, color: '#0ea5e9' },
    { label: 'Approved', value: 31, color: '#16a34a' },
    { label: 'Shipped', value: 18, color: '#f59e0b' },
    { label: 'Delivered', value: 27, color: '#22c55e' },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  setSalesPeriod(period: 7 | 30 | 90): void {
    this.selectedSalesPeriod = period;
  }

  getSalesPath(): string {
    const data = this.salesSeriesByPeriod[this.selectedSalesPeriod];
    if (data.length === 0) {
      return '';
    }

    const width = 820;
    const height = 240;
    const padX = 18;
    const padY = 18;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(max - min, 1);
    const step = (width - padX * 2) / Math.max(data.length - 1, 1);

    return data
      .map((value, index) => {
        const x = padX + index * step;
        const y = height - padY - ((value - min) / range) * (height - padY * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  getSalesAreaPath(): string {
    const data = this.salesSeriesByPeriod[this.selectedSalesPeriod];
    if (data.length === 0) {
      return '';
    }

    const width = 820;
    const height = 240;
    const padX = 18;
    const padY = 18;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(max - min, 1);
    const step = (width - padX * 2) / Math.max(data.length - 1, 1);

    const points = data
      .map((value, index) => {
        const x = padX + index * step;
        const y = height - padY - ((value - min) / range) * (height - padY * 2);
        return `${x} ${y}`;
      })
      .join(' L ');

    const endX = padX + (data.length - 1) * step;
    return `M ${padX} ${height - padY} L ${points} L ${endX} ${height - padY} Z`;
  }

  getStatusWidth(value: number): number {
    const max = Math.max(...this.ordersByStatus.map(status => status.value), 1);
    return (value / max) * 100;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft',
      SUBMITTED: 'submitted',
      APPROVED: 'approved',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      PAID: 'paid',
      CANCELLED: 'cancelled',
      REJECTED: 'rejected',
    };
    return map[status] || 'neutral';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
