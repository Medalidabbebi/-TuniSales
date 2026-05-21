import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { IClient } from '../client.model';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { InvoiceService } from 'app/entities/BusinessService/invoice/service/invoice.service';
import { AiSummaryService } from 'app/shared/service/ai-summary.service';

@Component({
  selector: 'jhi-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClientDetailComponent implements OnInit {
  client: IClient | null = null;

  orders: IOrder[] = [];
  invoices: IInvoice[] = [];
  isLoadingData = false;

  aiSummary: string | null = null;
  isLoadingAi = false;

  riskScore: { score: number; label: string; colorClass: string; bar: string } | null = null;

  loyaltyScore: { score: number; grade: string; label: string; colorClass: string; barClass: string; ringColor: string } | null = null;

  historyInsight: string | null = null;
  isLoadingHistoryInsight = false;

  historyPage = 1;
  historyPageSize = 5;

  emailModal = false;
  emailContent = '';
  isGeneratingEmail = false;
  emailCopied = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private aiSummaryService: AiSummaryService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
      this.loadClientData();
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-status-badge--active',
      INACTIVE:   'cd-status-badge--inactive',
      SUSPENDED:  'cd-status-badge--suspended',
      CHURN_RISK: 'cd-status-badge--churn-risk',
    };
    return map[status || ''] || 'cd-status-badge--inactive';
  }

  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'Actif',
      INACTIVE:   'Inactif',
      SUSPENDED:  'Suspendu',
      CHURN_RISK: 'À risque',
    };
    return map[status || ''] || (status || '—');
  }

  getTypeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      NATIONAL_DISTRIBUTOR:  'Distributeur national',
      REGIONAL_WHOLESALER:   'Grossiste régional',
      INDEPENDENT_POS:       'PDV indépendant',
      TELECOM_OPERATOR:      'Opérateur télécom',
    };
    return map[type || ''] || (type || '—');
  }

  getKpiStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-kpi-card--green',
      INACTIVE:   'cd-kpi-card--gray',
      SUSPENDED:  'cd-kpi-card--orange',
      CHURN_RISK: 'cd-kpi-card--red',
    };
    return map[status || ''] || 'cd-kpi-card--gray';
  }

  getKpiStatusIconClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cd-kpi-card__icon--green',
      INACTIVE:   'cd-kpi-card__icon--gray',
      SUSPENDED:  'cd-kpi-card__icon--orange',
      CHURN_RISK: 'cd-kpi-card__icon--red',
    };
    return map[status || ''] || 'cd-kpi-card__icon--gray';
  }

  openEmailModal(): void {
    this.emailModal = true;
    this.emailContent = '';
    this.isGeneratingEmail = true;
    this.emailCopied = false;
    const data = {
      clientName: this.client?.name,
      nbOrders: this.orders.length,
      nbInvoices: this.invoices.length,
      overdueCount: this.invoices.filter(i => i.status === 'OVERDUE').length,
    };
    this.aiSummaryService.generateEmail('invoice_reminder', data)
      .subscribe({
        next: t => { this.emailContent = t; this.isGeneratingEmail = false; },
        error: () => { this.isGeneratingEmail = false; },
      });
  }

  copyEmail(): void {
    navigator.clipboard.writeText(this.emailContent).then(() => {
      this.emailCopied = true;
      setTimeout(() => this.emailCopied = false, 2000);
    });
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private loadClientData(): void {
    if (!this.client?.id) return;
    this.isLoadingData = true;
    forkJoin([
      this.orderService.query({ 'clientId.equals': this.client.id, size: 500, eagerload: true }),
      this.invoiceService.query({ 'clientId.equals': this.client.id, size: 500, eagerload: true }),
    ]).subscribe({
      next: ([ordRes, invRes]) => {
        this.orders = ordRes.body ?? [];
        this.invoices = invRes.body ?? [];
        this.isLoadingData = false;
        this.computeRiskScore();
        this.computeLoyaltyScore();
        this.loadAiSummary();
        this.loadHistoryInsight();
      },
      error: () => { this.isLoadingData = false; },
    });
  }

  private computeRiskScore(): void {
    const creditLimit = this.client?.creditLimit;
    const creditUsed  = this.client?.creditUsed;
    const creditRatio = creditLimit ? Math.min(100, Math.max(0, ((creditUsed ?? 0) / creditLimit) * 100)) : 0;

    const statusPenalty: Record<string, number> = {
      CHURN_RISK: -30,
      SUSPENDED:  -20,
      INACTIVE:   -10,
      ACTIVE:      0,
    };
    const penalty = statusPenalty[this.client?.status ?? ''] ?? 0;

    const paymentPenalty = (this.client?.paymentTermsDays ?? 0) > 60 ? -10 : 0;
    const overdueInvoices = this.invoices.filter(i => i.status === 'OVERDUE').length * 5;

    const raw = 100 - creditRatio * 0.4 + penalty - overdueInvoices - paymentPenalty;
    const score = Math.max(0, Math.min(100, raw));

    let label: string;
    let colorClass: string;
    let bar: string;

    if (score >= 80) {
      label = 'Faible risque';
      colorClass = 'risk--low';
      bar = 'risk-bar--green';
    } else if (score >= 60) {
      label = 'Risque modéré';
      colorClass = 'risk--medium';
      bar = 'risk-bar--orange';
    } else if (score >= 40) {
      label = 'Risque élevé';
      colorClass = 'risk--high';
      bar = 'risk-bar--red';
    } else {
      label = 'Très risqué';
      colorClass = 'risk--critical';
      bar = 'risk-bar--red';
    }

    this.riskScore = { score, label, colorClass, bar };
  }

  get clientInitials(): string {
    return (this.client?.name || '')
      .trim().split(/\s+/).slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '').join('');
  }

  get creditUsagePercent(): number {
    const limit = this.client?.creditLimit ?? 0;
    const used  = this.client?.creditUsed  ?? 0;
    return limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  }

  get totalOrdersAmount(): number {
    return this.orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  }

  get historyOrders(): IOrder[] {
    const start = (this.historyPage - 1) * this.historyPageSize;
    return this.orders.slice(start, start + this.historyPageSize);
  }

  get historyTotalPages(): number {
    return Math.ceil(this.orders.length / this.historyPageSize);
  }

  getOrderStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:     'cd-order-badge--draft',
      SUBMITTED: 'cd-order-badge--submitted',
      VALIDATED: 'cd-order-badge--validated',
      DELIVERED: 'cd-order-badge--delivered',
      CANCELLED: 'cd-order-badge--cancelled',
      REJECTED:  'cd-order-badge--rejected',
    };
    return map[status || ''] || 'cd-order-badge--draft';
  }

  getOrderStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:     'Brouillon',
      SUBMITTED: 'Soumise',
      VALIDATED: 'Validée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
      REJECTED:  'Rejetée',
    };
    return map[status || ''] || (status || '—');
  }

  private computeLoyaltyScore(): void {
    const count = this.orders.length;
    const totalSpend = this.orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    const successStatuses = new Set(['VALIDATED', 'DELIVERED']);
    const successCount = this.orders.filter(o => successStatuses.has(o.status ?? '')).length;

    // Recency: days since last order
    let recencyScore = 0;
    const lastOrder = this.client?.lastOrderAt;
    if (lastOrder) {
      const days = Math.abs(Math.round(new Date().valueOf() / 86400000 - lastOrder.valueOf() / 86400000));
      if (days < 30)       recencyScore = 20;
      else if (days < 90)  recencyScore = 15;
      else if (days < 180) recencyScore = 10;
      else                 recencyScore = 5;
    }

    // Order count score (0-30)
    let countScore = 0;
    if (count >= 6)      countScore = 30;
    else if (count >= 3) countScore = 20;
    else if (count >= 1) countScore = 10;

    // Spend score (0-40)
    let spendScore = 0;
    if (totalSpend > 50000)       spendScore = 40;
    else if (totalSpend > 20000)  spendScore = 30;
    else if (totalSpend > 5000)   spendScore = 20;
    else if (totalSpend > 0)      spendScore = 10;

    // Success rate (0-10)
    const successScore = count > 0 ? Math.round((successCount / count) * 10) : 0;

    const score = Math.min(100, countScore + spendScore + recencyScore + successScore);

    let grade: string;
    let label: string;
    let colorClass: string;
    let barClass: string;

    let ringColor: string;
    if (score >= 80) {
      grade = 'A'; label = 'Excellent client'; colorClass = 'loyalty--a'; barClass = 'loyalty-bar--green'; ringColor = '#10b981';
    } else if (score >= 60) {
      grade = 'B'; label = 'Bon client'; colorClass = 'loyalty--b'; barClass = 'loyalty-bar--blue'; ringColor = '#3b82f6';
    } else if (score >= 40) {
      grade = 'C'; label = 'Client moyen'; colorClass = 'loyalty--c'; barClass = 'loyalty-bar--orange'; ringColor = '#f59e0b';
    } else {
      grade = 'D'; label = 'Client inactif'; colorClass = 'loyalty--d'; barClass = 'loyalty-bar--red'; ringColor = '#ef4444';
    }

    this.loyaltyScore = { score, grade, label, colorClass, barClass, ringColor };
  }

  private loadAiSummary(): void {
    this.isLoadingAi = true;
    this.aiSummaryService.generateClientSummary(this.client!, this.orders, this.invoices)
      .subscribe({
        next: t => { this.aiSummary = t; this.isLoadingAi = false; },
        error: () => { this.isLoadingAi = false; },
      });
  }

  private loadHistoryInsight(): void {
    if (this.orders.length === 0) return;
    this.isLoadingHistoryInsight = true;
    this.aiSummaryService.generateOrderHistoryInsight(this.client!, this.orders)
      .subscribe({
        next: t => { this.historyInsight = t; this.isLoadingHistoryInsight = false; },
        error: () => { this.isLoadingHistoryInsight = false; },
      });
  }
}
