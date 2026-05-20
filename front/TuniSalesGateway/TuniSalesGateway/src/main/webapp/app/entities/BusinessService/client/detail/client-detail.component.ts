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
        this.loadAiSummary();
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

  private loadAiSummary(): void {
    this.isLoadingAi = true;
    this.aiSummaryService.generateClientSummary(this.client!, this.orders, this.invoices)
      .subscribe({
        next: t => { this.aiSummary = t; this.isLoadingAi = false; },
        error: () => { this.isLoadingAi = false; },
      });
  }
}
