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
import { DeliveryService } from 'app/entities/BusinessService/delivery/service/delivery.service';
import { AiSummaryService } from 'app/shared/service/ai-summary.service';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { IDelivery } from 'app/entities/BusinessService/delivery/delivery.model';
import dayjs from 'dayjs/esm';

// All order status labels in French
const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT:          'Brouillon',
  PENDING:        'En attente',
  SUBMITTED:      'Soumis',
  UNDER_REVIEW:   'En révision',
  APPROVED:       'Approuvé',
  ACCEPTED:       'Accepté',
  IN_PREPARATION: 'En préparation',
  NEGOTIATED:     'Négocié',
  CONFIRMED:      'Confirmé',
  SHIPPED:        'Expédié',
  DELIVERED:      'Livré',
  INVOICED:       'Facturé',
  PAID:           'Payé',
  REFUSED:        'Refusé',
  REJECTED:       'Rejeté',
  CANCELLED:      'Annulé',
  RETURNED:       'Retourné',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT:          '#94a3b8',
  PENDING:        '#a78bfa',
  SUBMITTED:      '#0ea5e9',
  UNDER_REVIEW:   '#818cf8',
  APPROVED:       '#3b82f6',
  ACCEPTED:       '#06b6d4',
  IN_PREPARATION: '#f97316',
  NEGOTIATED:     '#d946ef',
  CONFIRMED:      '#10b981',
  SHIPPED:        '#f59e0b',
  DELIVERED:      '#22c55e',
  INVOICED:       '#64748b',
  PAID:           '#16a34a',
  REFUSED:        '#f43f5e',
  REJECTED:       '#ef4444',
  CANCELLED:      '#6b7280',
  RETURNED:       '#78716c',
};

// Statuses that count as "en cours" (active / to validate / in progress)
const PENDING_VALIDATE = new Set(['PENDING', 'SUBMITTED', 'UNDER_REVIEW']);
const ACTIVE_STATUSES  = new Set(['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACCEPTED',
  'IN_PREPARATION', 'NEGOTIATED', 'CONFIRMED', 'SHIPPED']);

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  isLoadingDashboard = false;

  selectedSalesPeriod: 7 | 30 | 90 = 30;

  // ── AI Analytics ──────────────────────────────────────────────────────────
  dashboardInsight: string | null = null;
  isLoadingInsight = false;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  chatInput = '';
  isChatLoading = false;
  private dashboardContext = '';
  private _rawOrders: IOrder[] = [];
  private _rawInvoices: IInvoice[] = [];

  kpis: Array<{
    label: string; value: string; sub: string;
    trendDir: 'up' | 'down' | 'neutral'; icon: IconProp; color: string;
  }> = [];

  recentOrders: Array<{
    id: string; clientId?: number; client: string;
    amount: string; status: string; date: string;
  }> = [];

  recentActivity: Array<{ text: string; time: string; type: string }> = [];
  alerts: Array<{ text: string; type: string }> = [];
  topClients: Array<{ id?: number; name: string; invoiceCount: number; ca: string }> = [];

  salesSeriesByPeriod: Record<7 | 30 | 90, number[]> = { 7: [], 30: [], 90: [] };
  ordersByStatus: Array<{ label: string; value: number; color: string }> = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private deliveryService: DeliveryService,
    private aiSummaryService: AiSummaryService,
  ) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account = account;
        if (account) { this.loadDashboard(); }
      });
  }

  login(): void { this.router.navigate(['/login']); }

  setSalesPeriod(period: 7 | 30 | 90): void { this.selectedSalesPeriod = period; }

  // ─── Data loading ────────────────────────────────────────────────────────────

  private loadDashboard(): void {
    this.isLoadingDashboard = true;
    forkJoin([
      this.orderService.query({ size: 1000, sort: ['createdAt,desc'], eagerload: true }),
      this.invoiceService.query({ size: 1000, sort: ['createdAt,desc'], eagerload: true }),
      this.clientService.query({ size: 1000 }),
      this.deliveryService.query({ size: 1000 }),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([ordRes, invRes, cliRes, delRes]) => {
          const orders: IOrder[]       = ordRes.body ?? [];
          const invoices: IInvoice[]   = invRes.body ?? [];
          const clients: IClient[]     = cliRes.body ?? [];
          const deliveries: IDelivery[] = delRes.body ?? [];
          this._rawOrders   = orders;
          this._rawInvoices = invoices;
          this.buildKpis(orders, invoices, clients, deliveries);
          this.buildRecentOrders(orders);
          this.buildOrdersByStatus(orders);
          this.buildSalesSeries(invoices);
          this.buildTopClients(invoices, clients);
          this.buildRecentActivity(orders, invoices);
          this.buildAlerts(orders, invoices);
          this.isLoadingDashboard = false;
          this.loadDashboardInsights(orders, invoices, deliveries);
        },
        error: () => { this.isLoadingDashboard = false; },
      });
  }

  // ─── KPI cards ───────────────────────────────────────────────────────────────

  private buildKpis(orders: IOrder[], invoices: IInvoice[], clients: IClient[], deliveries: IDelivery[]): void {
    // 1. CA TTC — sum of all invoice amounts
    const caTtc = invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0);

    // 2. Commandes à valider — PENDING + SUBMITTED + UNDER_REVIEW
    const toValidate = orders.filter(o => o.status && PENDING_VALIDATE.has(o.status)).length;
    const totalActive = orders.filter(o => o.status && ACTIVE_STATUSES.has(o.status)).length;

    // 3. Taux de livraison — basé sur les statuts réels des livraisons
    const totalDeliveries = deliveries.length;
    const deliveredCount  = deliveries.filter(d => d.status === 'DELIVERED').length;
    const deliveryRate    = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;

    // 4. Montant impayé — sum of amountTtc for ISSUED + OVERDUE
    const unpaidAmount = invoices
      .filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE')
      .reduce((s, i) => s + (i.amountTtc ?? 0), 0);
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

    this.kpis = [
      {
        label: 'Chiffre d\'Affaires TTC',
        value: this.fmtAmount(caTtc) + ' TND',
        sub: invoices.length + ' factures · ' + clients.length + ' clients',
        trendDir: 'up',
        icon: 'chart-line' as IconProp,
        color: 'blue',
      },
      {
        label: 'Commandes à valider',
        value: String(toValidate),
        sub: totalActive + ' commandes actives au total',
        trendDir: toValidate > 0 ? 'down' : 'up',
        icon: 'clipboard-check' as IconProp,
        color: toValidate > 0 ? 'orange' : 'green',
      },
      {
        label: 'Taux de livraison',
        value: deliveryRate + ' %',
        sub: deliveredCount + ' livrées sur ' + totalDeliveries + ' livraison(s)',
        trendDir: deliveryRate >= 70 ? 'up' : 'down',
        icon: 'truck' as IconProp,
        color: deliveryRate >= 70 ? 'green' : 'orange',
      },
      {
        label: 'Montant impayé',
        value: this.fmtAmount(unpaidAmount) + ' TND',
        sub: overdueCount + ' facture(s) en retard',
        trendDir: overdueCount > 0 ? 'down' : 'up',
        icon: 'file-invoice-dollar' as IconProp,
        color: overdueCount > 0 ? 'red' : 'green',
      },
    ];
  }

  // ─── Recent orders ────────────────────────────────────────────────────────────

  private buildRecentOrders(orders: IOrder[]): void {
    this.recentOrders = orders.slice(0, 6).map(o => ({
      id: o.orderNumber || '#' + o.id,
      clientId: o.client?.id,
      client: o.client?.name || '—',
      amount: this.fmtAmount(o.totalAmount ?? 0) + ' TND',
      status: o.status || '—',
      date: o.createdAt ? this.relativeDate(o.createdAt) : '—',
    }));
  }

  // ─── Orders by status ─────────────────────────────────────────────────────────

  private buildOrdersByStatus(orders: IOrder[]): void {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      if (o.status) counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    this.ordersByStatus = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([key, value]) => ({
        label: ORDER_STATUS_LABELS[key] ?? key,
        value,
        color: ORDER_STATUS_COLORS[key] ?? '#94a3b8',
      }));
  }

  // ─── Sales series ─────────────────────────────────────────────────────────────

  private buildSalesSeries(invoices: IInvoice[]): void {
    ([7, 30, 90] as const).forEach(days => {
      const buckets = days <= 7 ? 7 : 10;
      const bucketSize = days / buckets;
      const series: number[] = new Array(buckets).fill(0);
      const now = dayjs();
      for (const inv of invoices) {
        const date = inv.issueDate ?? inv.createdAt;
        if (!date) continue;
        const diffDays = now.diff(dayjs(date), 'day');
        if (diffDays < 0 || diffDays >= days) continue;
        const idx = Math.min(buckets - 1, Math.floor((days - diffDays - 1) / bucketSize));
        series[idx] += inv.amountTtc ?? 0;
      }
      this.salesSeriesByPeriod[days] = series;
    });
  }

  // ─── Top clients by revenue ───────────────────────────────────────────────────

  private buildTopClients(invoices: IInvoice[], clients: IClient[]): void {
    const byClient: Record<number, { name: string; ca: number; count: number }> = {};
    for (const inv of invoices) {
      if (!inv.client?.id) continue;
      const id = inv.client.id;
      if (!byClient[id]) byClient[id] = { name: inv.client.name ?? '—', ca: 0, count: 0 };
      byClient[id].ca    += inv.amountTtc ?? 0;
      byClient[id].count += 1;
    }
    // Merge client status from clients list
    this.topClients = Object.entries(byClient)
      .sort(([, a], [, b]) => b.ca - a.ca)
      .slice(0, 5)
      .map(([idStr, v]) => ({
        id: Number(idStr),
        name: v.name,
        invoiceCount: v.count,
        ca: this.fmtAmount(v.ca),
      }));
  }

  // ─── Activity ─────────────────────────────────────────────────────────────────

  private buildRecentActivity(orders: IOrder[], invoices: IInvoice[]): void {
    const items: Array<{ text: string; time: string; type: string; ts: number }> = [];
    for (const o of orders.slice(0, 6)) {
      items.push({
        text: `Commande ${o.orderNumber || '#' + o.id} — ${o.client?.name ?? '?'} → ${ORDER_STATUS_LABELS[o.status ?? ''] ?? o.status}`,
        time: o.createdAt ? this.relativeDate(o.createdAt) : '—',
        type: o.status === 'DELIVERED' || o.status === 'PAID' ? 'success'
            : o.status === 'CANCELLED' || o.status === 'REJECTED' || o.status === 'REFUSED' ? 'danger' : 'info',
        ts: o.createdAt ? dayjs(o.createdAt).valueOf() : 0,
      });
    }
    for (const inv of invoices.slice(0, 4)) {
      items.push({
        text: `Facture ${inv.invoiceNumber || '#' + inv.id} — ${inv.client?.name ?? '?'} (${this.fmtAmount(inv.amountTtc ?? 0)} TND)`,
        time: inv.createdAt ? this.relativeDate(inv.createdAt) : '—',
        type: inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'info',
        ts: inv.createdAt ? dayjs(inv.createdAt).valueOf() : 0,
      });
    }
    items.sort((a, b) => b.ts - a.ts);
    this.recentActivity = items.slice(0, 7).map(({ text, time, type }) => ({ text, time, type }));
  }

  // ─── Alerts ───────────────────────────────────────────────────────────────────

  private buildAlerts(orders: IOrder[], invoices: IInvoice[]): void {
    this.alerts = [];
    const overdue = invoices.filter(i => i.status === 'OVERDUE');
    if (overdue.length > 0) {
      const sum = this.fmtAmount(overdue.reduce((s, i) => s + (i.amountTtc ?? 0), 0));
      this.alerts.push({ text: `${overdue.length} facture(s) en retard — ${sum} TND à recouvrer`, type: 'danger' });
    }
    const toValidate = orders.filter(o => o.status && PENDING_VALIDATE.has(o.status));
    if (toValidate.length > 0) {
      this.alerts.push({ text: `${toValidate.length} commande(s) en attente de validation`, type: 'warning' });
    }
    const issued = invoices.filter(i => i.status === 'ISSUED');
    if (issued.length > 0) {
      const sum = this.fmtAmount(issued.reduce((s, i) => s + (i.amountTtc ?? 0), 0));
      this.alerts.push({ text: `${issued.length} facture(s) émises non payées — ${sum} TND`, type: 'warning' });
    }
    if (this.alerts.length === 0) {
      this.alerts.push({ text: 'Aucune alerte — tout est en ordre.', type: 'success' });
    }
  }

  // ─── Chart helpers ────────────────────────────────────────────────────────────

  getSalesPath(): string {
    const data = this.salesSeriesByPeriod[this.selectedSalesPeriod];
    if (!data?.length) return '';
    const { pts } = this.chartPoints(data);
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  getSalesAreaPath(): string {
    const data = this.salesSeriesByPeriod[this.selectedSalesPeriod];
    if (!data?.length) return '';
    const { pts, padX, height, padY } = this.chartPoints(data);
    const line = pts.map(p => `${p.x} ${p.y}`).join(' L ');
    const endX  = pts[pts.length - 1].x;
    return `M ${padX} ${height - padY} L ${line} L ${endX} ${height - padY} Z`;
  }

  private chartPoints(data: number[]): { pts: { x: number; y: number }[]; padX: number; padY: number; width: number; height: number } {
    const width = 820; const height = 240; const padX = 18; const padY = 18;
    const max = Math.max(...data); const min = Math.min(...data);
    const range = Math.max(max - min, 1);
    const step  = (width - padX * 2) / Math.max(data.length - 1, 1);
    const pts   = data.map((v, i) => ({
      x: padX + i * step,
      y: height - padY - ((v - min) / range) * (height - padY * 2),
    }));
    return { pts, padX, padY, width, height };
  }

  getStatusWidth(value: number): number {
    const max = Math.max(...this.ordersByStatus.map(s => s.value), 1);
    return (value / max) * 100;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'draft', PENDING: 'submitted', SUBMITTED: 'submitted',
      UNDER_REVIEW: 'submitted', APPROVED: 'approved', ACCEPTED: 'approved',
      IN_PREPARATION: 'shipped', NEGOTIATED: 'shipped', CONFIRMED: 'approved',
      SHIPPED: 'shipped', DELIVERED: 'delivered', INVOICED: 'paid',
      PAID: 'paid', REFUSED: 'rejected', REJECTED: 'rejected',
      CANCELLED: 'cancelled', RETURNED: 'cancelled',
    };
    return map[status] || 'neutral';
  }

  getStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  // ─── Utils ────────────────────────────────────────────────────────────────────

  private fmtAmount(n: number): string {
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  }

  private relativeDate(date: dayjs.Dayjs | string): string {
    const d = dayjs(date);
    const mins = dayjs().diff(d, 'minute');
    if (mins < 60) return `il y a ${mins} min`;
    const h = dayjs().diff(d, 'hour');
    if (h < 24) return `il y a ${h}h`;
    const dd = dayjs().diff(d, 'day');
    if (dd < 30) return `il y a ${dd}j`;
    return d.format('DD/MM/YYYY');
  }

  // ─── AI Analytics ─────────────────────────────────────────────────────────

  private loadDashboardInsights(orders: IOrder[], invoices: IInvoice[], deliveries: IDelivery[]): void {
    const caTtc           = invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0);
    const toValidate      = orders.filter(o => o.status && PENDING_VALIDATE.has(o.status)).length;
    const activeOrders    = orders.filter(o => o.status && ACTIVE_STATUSES.has(o.status)).length;
    const delivered       = deliveries.filter(d => d.status === 'DELIVERED').length;
    const totalDeliveries = deliveries.length;
    const deliveryRate    = totalDeliveries > 0 ? Math.round((delivered / totalDeliveries) * 100) : 0;
    const unpaidAmount = invoices.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE')
                                 .reduce((s, i) => s + (i.amountTtc ?? 0), 0);
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
    const issuedCount  = invoices.filter(i => i.status === 'ISSUED').length;
    const topClientEntry = this.topClients[0];

    this.dashboardContext =
      `CA TTC total: ${caTtc.toFixed(0)} TND. ` +
      `${orders.length} commandes dont ${activeOrders} actives et ${toValidate} à valider. ` +
      `Taux de livraison: ${deliveryRate}% (${delivered}/${totalDeliveries} livraisons). ` +
      `Impayés: ${unpaidAmount.toFixed(0)} TND (${overdueCount} en retard, ${issuedCount} émises). ` +
      (topClientEntry ? `Meilleur client: ${topClientEntry.name} (${topClientEntry.ca} TND).` : '');

    this.isLoadingInsight = true;
    this.aiSummaryService.generateDashboardInsights({
      caTtc, totalOrders: orders.length, toValidate, deliveryRate,
      unpaidAmount, overdueCount, activeOrders, issuedCount,
      topClient: topClientEntry?.name ?? '',
      topClientCa: topClientEntry ? parseFloat(topClientEntry.ca.replace(/\s/g, '').replace(',', '.')) : 0,
    }).subscribe({
      next: text => { this.dashboardInsight = text; this.isLoadingInsight = false; },
      error: ()   => { this.isLoadingInsight = false; },
    });
  }

  refreshInsights(): void {
    this.dashboardInsight = null;
    this.loadDashboardInsights(this._rawOrders, this._rawInvoices);
  }

  sendChat(): void {
    const msg = this.chatInput.trim();
    if (!msg || this.isChatLoading) return;
    this.chatInput = '';
    this.chatMessages.push({ role: 'user', content: msg });
    this.isChatLoading = true;

    this.aiSummaryService.chat([...this.chatMessages], this.dashboardContext).subscribe({
      next: reply => {
        this.chatMessages.push({ role: 'assistant', content: reply });
        this.isChatLoading = false;
      },
      error: () => {
        this.chatMessages.push({ role: 'assistant', content: 'Service IA non disponible.' });
        this.isChatLoading = false;
      },
    });
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChat();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
