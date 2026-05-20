import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { InvoiceService } from 'app/entities/BusinessService/invoice/service/invoice.service';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  isLoadingDashboard = false;

  selectedSalesPeriod: 7 | 30 | 90 = 7;

  kpis: Array<{ label: string; value: string; trend: string; trendDir: string; icon: IconProp; color: string }> = [];

  recentOrders: Array<{ id: string; clientId?: number; client: string; amount: string; status: string; date: string }> = [];

  recentActivity: Array<{ text: string; time: string; type: string }> = [];

  alerts: Array<{ text: string; type: string }> = [];

  salesSeriesByPeriod: Record<7 | 30 | 90, number[]> = { 7: [], 30: [], 90: [] };

  ordersByStatus: Array<{ label: string; value: number; color: string }> = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account = account;
        if (account) {
          this.loadDashboard();
        }
      });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  setSalesPeriod(period: 7 | 30 | 90): void {
    this.selectedSalesPeriod = period;
  }

  private loadDashboard(): void {
    this.isLoadingDashboard = true;
    forkJoin([
      this.orderService.query({ size: 1000, sort: ['createdAt,desc'], eagerload: true }),
      this.invoiceService.query({ size: 1000, sort: ['createdAt,desc'], eagerload: true }),
      this.clientService.query({ size: 1000 }),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([ordRes, invRes, cliRes]) => {
          const orders: IOrder[] = ordRes.body ?? [];
          const invoices: IInvoice[] = invRes.body ?? [];
          const clients: IClient[] = cliRes.body ?? [];
          this.buildKpis(orders, invoices, clients);
          this.buildRecentOrders(orders);
          this.buildOrdersByStatus(orders);
          this.buildSalesSeries(invoices);
          this.buildRecentActivity(orders, invoices);
          this.buildAlerts(orders, invoices);
          this.isLoadingDashboard = false;
        },
        error: () => { this.isLoadingDashboard = false; },
      });
  }

  private buildKpis(orders: IOrder[], invoices: IInvoice[], clients: IClient[]): void {
    const caTtc = invoices.reduce((sum, inv) => sum + (inv.amountTtc ?? 0), 0);

    const activeStatuses = new Set(['DRAFT', 'SUBMITTED', 'APPROVED', 'PROCESSING', 'SHIPPED', 'READY_TO_PICK', 'PICKING', 'PACKED']);
    const pendingOrders = orders.filter(o => o.status && activeStatuses.has(o.status)).length;

    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;

    const unpaidInvoices = invoices.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').length;

    this.kpis = [
      {
        label: 'Chiffre d\'Affaires',
        value: this.fmtAmount(caTtc) + ' TND',
        trend: invoices.length + ' factures',
        trendDir: 'up',
        icon: 'chart-line' as IconProp,
        color: 'blue',
      },
      {
        label: 'Commandes en cours',
        value: String(pendingOrders),
        trend: orders.length + ' total',
        trendDir: pendingOrders > 0 ? 'up' : 'neutral',
        icon: 'shopping-cart' as IconProp,
        color: 'orange',
      },
      {
        label: 'Clients actifs',
        value: String(activeClients),
        trend: clients.length + ' total',
        trendDir: 'up',
        icon: 'users' as IconProp,
        color: 'green',
      },
      {
        label: 'Factures impayées',
        value: String(unpaidInvoices),
        trend: unpaidInvoices > 0 ? 'À traiter' : 'Tout payé',
        trendDir: unpaidInvoices > 0 ? 'down' : 'up',
        icon: 'file-invoice-dollar' as IconProp,
        color: unpaidInvoices > 0 ? 'red' : 'green',
      },
    ];
  }

  private buildRecentOrders(orders: IOrder[]): void {
    this.recentOrders = orders.slice(0, 5).map(o => ({
      id: o.orderNumber || '#' + o.id,
      clientId: o.client?.id,
      client: o.client?.name || '—',
      amount: this.fmtAmount(o.totalAmount ?? 0) + ' TND',
      status: o.status || '—',
      date: o.createdAt ? this.relativeDate(o.createdAt) : '—',
    }));
  }

  private buildOrdersByStatus(orders: IOrder[]): void {
    const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
      DRAFT:         { label: 'Brouillon',    color: '#94a3b8' },
      SUBMITTED:     { label: 'Soumis',       color: '#0ea5e9' },
      APPROVED:      { label: 'Approuvé',     color: '#3b82f6' },
      PROCESSING:    { label: 'En traitement',color: '#8b5cf6' },
      READY_TO_PICK: { label: 'Prêt',         color: '#f59e0b' },
      PICKING:       { label: 'Picking',      color: '#f97316' },
      PACKED:        { label: 'Emballé',      color: '#06b6d4' },
      SHIPPED:       { label: 'Expédié',      color: '#f59e0b' },
      DELIVERED:     { label: 'Livré',        color: '#22c55e' },
      CANCELLED:     { label: 'Annulé',       color: '#6b7280' },
      REJECTED:      { label: 'Rejeté',       color: '#ef4444' },
    };

    const counts: Record<string, number> = {};
    for (const o of orders) {
      if (o.status) {
        counts[o.status] = (counts[o.status] ?? 0) + 1;
      }
    }

    this.ordersByStatus = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([key, value]) => ({
        label: STATUS_CONFIG[key]?.label ?? key,
        value,
        color: STATUS_CONFIG[key]?.color ?? '#94a3b8',
      }));
  }

  private buildSalesSeries(invoices: IInvoice[]): void {
    ([7, 30, 90] as const).forEach(days => {
      const now = dayjs();
      const buckets = days <= 7 ? days : days <= 30 ? 10 : 10;
      const bucketSize = days / buckets;
      const series: number[] = new Array(buckets).fill(0);

      for (const inv of invoices) {
        const date = inv.issueDate ?? inv.createdAt;
        if (!date) continue;
        const diffDays = now.diff(dayjs(date), 'day');
        if (diffDays < 0 || diffDays >= days) continue;
        const bucketIdx = Math.min(buckets - 1, Math.floor((days - diffDays - 1) / bucketSize));
        series[bucketIdx] += inv.amountTtc ?? 0;
      }
      this.salesSeriesByPeriod[days] = series;
    });
  }

  private buildRecentActivity(orders: IOrder[], invoices: IInvoice[]): void {
    const items: Array<{ text: string; time: string; type: string; ts: number }> = [];

    for (const o of orders.slice(0, 5)) {
      const statusLabel = this.getStatusLabel(o.status);
      items.push({
        text: `Commande ${o.orderNumber || '#' + o.id} — ${o.client?.name ?? '?'} (${statusLabel})`,
        time: o.createdAt ? this.relativeDate(o.createdAt) : '—',
        type: o.status === 'DELIVERED' ? 'success' : o.status === 'CANCELLED' || o.status === 'REJECTED' ? 'danger' : 'info',
        ts: o.createdAt ? dayjs(o.createdAt).valueOf() : 0,
      });
    }

    for (const inv of invoices.slice(0, 5)) {
      items.push({
        text: `Facture ${inv.invoiceNumber || '#' + inv.id} — ${inv.client?.name ?? '?'} (${inv.status})`,
        time: inv.createdAt ? this.relativeDate(inv.createdAt) : '—',
        type: inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'info',
        ts: inv.createdAt ? dayjs(inv.createdAt).valueOf() : 0,
      });
    }

    items.sort((a, b) => b.ts - a.ts);
    this.recentActivity = items.slice(0, 6).map(({ text, time, type }) => ({ text, time, type }));
  }

  private buildAlerts(orders: IOrder[], invoices: IInvoice[]): void {
    this.alerts = [];

    const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
    if (overdueInvoices.length > 0) {
      this.alerts.push({ text: `${overdueInvoices.length} facture(s) en retard de paiement`, type: 'danger' });
    }

    const issuedInvoices = invoices.filter(i => i.status === 'ISSUED');
    if (issuedInvoices.length > 0) {
      this.alerts.push({ text: `${issuedInvoices.length} facture(s) en attente de paiement`, type: 'warning' });
    }

    const pendingApproval = orders.filter(o => o.status === 'SUBMITTED');
    if (pendingApproval.length > 0) {
      this.alerts.push({ text: `${pendingApproval.length} commande(s) en attente d'approbation`, type: 'warning' });
    }

    if (this.alerts.length === 0) {
      this.alerts.push({ text: 'Aucune alerte — tout est en ordre.', type: 'success' });
    }
  }

  getSalesPath(): string {
    const data = this.salesSeriesByPeriod[this.selectedSalesPeriod];
    if (!data || data.length === 0) return '';

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
    if (!data || data.length === 0) return '';

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
    const max = Math.max(...this.ordersByStatus.map(s => s.value), 1);
    return (value / max) * 100;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT:         'draft',
      SUBMITTED:     'submitted',
      APPROVED:      'approved',
      PROCESSING:    'processing',
      READY_TO_PICK: 'ready',
      PICKING:       'picking',
      PACKED:        'packed',
      SHIPPED:       'shipped',
      DELIVERED:     'delivered',
      PAID:          'paid',
      CANCELLED:     'cancelled',
      REJECTED:      'rejected',
    };
    return map[status] || 'neutral';
  }

  private getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT: 'Brouillon', SUBMITTED: 'Soumis', APPROVED: 'Approuvé',
      PROCESSING: 'En traitement', SHIPPED: 'Expédié', DELIVERED: 'Livré',
      CANCELLED: 'Annulé', REJECTED: 'Rejeté',
    };
    return map[status || ''] || (status || '—');
  }

  private fmtAmount(n: number): string {
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }

  private relativeDate(date: dayjs.Dayjs | string): string {
    const d = dayjs(date);
    const diffMins = dayjs().diff(d, 'minute');
    if (diffMins < 60) return `il y a ${diffMins} min`;
    const diffH = dayjs().diff(d, 'hour');
    if (diffH < 24) return `il y a ${diffH}h`;
    const diffD = dayjs().diff(d, 'day');
    if (diffD < 30) return `il y a ${diffD}j`;
    return d.format('DD/MM/YYYY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
