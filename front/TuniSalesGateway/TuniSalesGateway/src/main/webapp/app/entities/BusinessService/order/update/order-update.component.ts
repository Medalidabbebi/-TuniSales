import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { OrderFormService, OrderFormGroup } from './order-form.service';
import { IOrder } from '../order.model';
import { OrderService } from '../service/order.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { ProductService } from 'app/entities/BusinessService/product/service/product.service';
import { OrderLineService } from 'app/entities/BusinessService/order-line/service/order-line.service';
import { NewOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { AiSummaryService } from 'app/shared/service/ai-summary.service';
import { ClientContactService } from 'app/entities/BusinessService/client-contact/service/client-contact.service';
import { IClientContact } from 'app/entities/BusinessService/client-contact/client-contact.model';

interface LineFormGroup {
  product: FormControl<IProduct | null>;
  quantity: FormControl<number | null>;
  unitPrice: FormControl<number | null>;
  discountPct: FormControl<number | null>;
  lineTotal: FormControl<number | null>;
}

@Component({
  selector: 'jhi-order-update',
  templateUrl: './order-update.component.html',
  styleUrls: ['./order-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderUpdateComponent implements OnInit {
  isSaving = false;
  order: IOrder | null = null;

  clientsSharedCollection: IClient[] = [];
  productsSharedCollection: IProduct[] = [];
  paymentMethodValues = Object.values(PaymentMethod);
  orderStatusValues = Object.values(OrderStatus);

  // ── Notification modal ────────────────────────────────────────────────────
  notifModal = false;
  notifTab: 'email' | 'sms' = 'email';
  notifEmailContent = '';
  notifSmsContent = '';
  isGeneratingEmail = false;
  isGeneratingSms = false;
  emailCopied = false;
  smsCopied = false;
  clientContact: IClientContact | null = null;
  isLoadingContact = false;

  editForm: OrderFormGroup = this.orderFormService.createOrderFormGroup();

  linesArray = new FormArray<FormGroup<LineFormGroup>>([]);

  constructor(
    protected orderService: OrderService,
    protected orderFormService: OrderFormService,
    protected orderLineService: OrderLineService,
    protected clientService: ClientService,
    protected productService: ProductService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private aiSummaryService: AiSummaryService,
    private clientContactService: ClientContactService,
  ) {}

  get isNewOrder(): boolean {
    return this.editForm.controls.id.value === null;
  }

  get subtotal(): number {
    return this.linesArray.controls.reduce((sum, line) => sum + (line.getRawValue().lineTotal ?? 0), 0);
  }

  get discountPercent(): number {
    return this.editForm.get('discountPercent')?.value ?? 0;
  }

  get discountAmount(): number {
    return Math.round(this.subtotal * this.discountPercent) / 100;
  }

  get totalAmount(): number {
    return Math.round((this.subtotal - this.discountAmount) * 100) / 100;
  }

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);
  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => (o1 && o2 ? o1.id === o2.id : o1 === o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ order }) => {
      this.order = order;
      if (order) {
        this.updateForm(order);
      }
      this.loadRelationshipsOptions();
    });
    if (this.linesArray.length === 0) {
      this.addLine();
    }
  }

  addLine(): void {
    this.linesArray.push(
      new FormGroup<LineFormGroup>({
        product: new FormControl<IProduct | null>(null, Validators.required),
        quantity: new FormControl<number | null>(1, [Validators.required, Validators.min(1)]),
        unitPrice: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
        discountPct: new FormControl<number | null>(0, [Validators.min(0), Validators.max(100)]),
        lineTotal: new FormControl<number | null>({ value: 0, disabled: true }),
      })
    );
  }

  removeLine(index: number): void {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(index);
    }
  }

  onProductChange(index: number): void {
    const line = this.linesArray.at(index);
    const product = line.get('product')?.value as IProduct | null;
    if (product?.price != null) {
      line.get('unitPrice')?.setValue(product.price);
    }
    this.recalcLine(index);
  }

  recalcLine(index: number): void {
    const line = this.linesArray.at(index);
    const qty = line.get('quantity')?.value ?? 0;
    const price = line.get('unitPrice')?.value ?? 0;
    const disc = line.get('discountPct')?.value ?? 0;
    const total = Math.round(qty * price * (1 - disc / 100) * 100) / 100;
    line.get('lineTotal')?.setValue(total);
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.linesArray.invalid || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.linesArray.controls.forEach(l => l.markAllAsTouched());
      return;
    }

    this.isSaving = true;
    const order = this.orderFormService.getOrder(this.editForm) as any;

    order.subtotal = this.subtotal;
    order.discountAmount = this.discountAmount;
    order.totalAmount = this.totalAmount;

    if (this.isNewOrder) {
      order.status = OrderStatus.PENDING;

      // Capture notification data before async operations
      const notifData = {
        clientName: (order.client as IClient)?.name ?? 'Client',
        orderNumber: '',
        totalAmount: this.totalAmount.toFixed(2),
        paymentTermsDays: order.paymentTermsDays ?? 30,
      };

      let createdOrder: IOrder;

      this.orderService
        .create(order)
        .pipe(
          switchMap(res => {
            createdOrder = res.body!;
            notifData.orderNumber = createdOrder.orderNumber ?? '#' + createdOrder.id;
            const lineRequests = this.linesArray.controls.map(ctrl => {
              const v = ctrl.getRawValue();
              const newLine: NewOrderLine = {
                id: null,
                quantity: v.quantity,
                unitPrice: v.unitPrice,
                discountPct: v.discountPct,
                lineTotal: v.lineTotal,
                product: v.product ? { id: v.product.id, name: v.product.name ?? '' } : null,
                order: { id: createdOrder.id, orderNumber: createdOrder.orderNumber ?? '' },
              };
              return this.orderLineService.create(newLine);
            });
            return forkJoin(lineRequests);
          }),
          finalize(() => (this.isSaving = false))
        )
        .subscribe({
          next: () => this.openNotifModal(notifData),
          error: () => (this.isSaving = false),
        });
    } else {
      this.orderService
        .update(order)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({ next: () => this.previousState() });
    }
  }

  // ── Notification modal methods ────────────────────────────────────────────

  switchNotifTab(tab: 'email' | 'sms'): void {
    this.notifTab = tab;
  }

  copyNotifContent(): void {
    const text = this.notifTab === 'email' ? this.notifEmailContent : this.notifSmsContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (this.notifTab === 'email') {
        this.emailCopied = true;
        setTimeout(() => (this.emailCopied = false), 2500);
      } else {
        this.smsCopied = true;
        setTimeout(() => (this.smsCopied = false), 2500);
      }
    });
  }

  sendByEmail(): void {
    if (!this.notifEmailContent) return;
    const lines = this.notifEmailContent.split('\n');
    const subjectLine = lines.find(l => /^objet\s*:/i.test(l.trim()));
    const subject = subjectLine
      ? subjectLine.replace(/^objet\s*:\s*/i, '').trim()
      : 'Confirmation de commande';
    const emailAddr = this.clientContact?.email ?? '';
    const mailto = `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.notifEmailContent)}`;
    window.open(mailto, '_blank');
  }

  sendBySms(): void {
    if (!this.notifSmsContent || !this.clientContact?.phone) return;
    const phone = this.clientContact.phone.replace(/\s+/g, '');
    window.open(`sms:${phone}?body=${encodeURIComponent(this.notifSmsContent)}`, '_blank');
  }

  sendByWhatsApp(): void {
    if (!this.notifSmsContent || !this.clientContact?.phone) return;
    const phone = this.clientContact.phone.replace(/[\s\-\(\)\+]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(this.notifSmsContent)}`, '_blank');
  }

  closeNotifModal(): void {
    this.notifModal = false;
    this.router.navigate(['/order']);
  }

  private openNotifModal(data: { clientName: string; orderNumber: string; totalAmount: string; paymentTermsDays: number }): void {
    this.notifModal = true;
    this.notifTab = 'email';
    this.notifEmailContent = '';
    this.notifSmsContent = '';
    this.clientContact = null;
    this.isGeneratingEmail = true;
    this.isGeneratingSms = true;
    this.isLoadingContact = true;
    this.emailCopied = false;
    this.smsCopied = false;

    const clientId = this.editForm.controls.client.value?.id;
    const contactQuery$ = clientId
      ? this.clientContactService.query({ 'clientId.equals': clientId, size: 20 })
      : of({ body: [] as IClientContact[] } as any);

    forkJoin([
      this.aiSummaryService.generateEmail('order_confirm', data),
      this.aiSummaryService.generateSms(data),
      contactQuery$,
    ]).subscribe({
      next: ([email, sms, contactsRes]) => {
        this.notifEmailContent = email;
        this.notifSmsContent = sms;
        const contacts: IClientContact[] = contactsRes.body ?? [];
        this.clientContact = contacts.find(c => c.isPrimary) ?? contacts[0] ?? null;
        this.isGeneratingEmail = false;
        this.isGeneratingSms = false;
        this.isLoadingContact = false;
      },
      error: () => {
        this.isGeneratingEmail = false;
        this.isGeneratingSms = false;
        this.isLoadingContact = false;
      },
    });
  }

  /** Returns the ou-status--* CSS class for the given OrderStatus */
  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:        'ou-status--draft',
      PENDING:      'ou-status--pending',
      SUBMITTED:    'ou-status--submitted',
      UNDER_REVIEW: 'ou-status--review',
      APPROVED:     'ou-status--approved',
      ACCEPTED:     'ou-status--accepted',
      IN_PREPARATION: 'ou-status--preparation',
      NEGOTIATED:   'ou-status--negotiated',
      SHIPPED:      'ou-status--shipped',
      DELIVERED:    'ou-status--delivered',
      INVOICED:     'ou-status--invoiced',
      PAID:         'ou-status--paid',
      REFUSED:      'ou-status--refused',
      REJECTED:     'ou-status--rejected',
      CANCELLED:    'ou-status--cancelled',
      CONFIRMED:    'ou-status--confirmed',
      RETURNED:     'ou-status--returned',
    };
    return map[status ?? ''] || 'ou-status--draft';
  }

  /** Returns the French label for an OrderStatus */
  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'Brouillon',
      PENDING:        'En attente',
      SUBMITTED:      'Soumise',
      UNDER_REVIEW:   'En examen',
      APPROVED:       'Approuvée',
      ACCEPTED:       'Acceptée',
      IN_PREPARATION: 'En préparation',
      NEGOTIATED:     'Négociée',
      SHIPPED:        'Expédiée',
      DELIVERED:      'Livrée',
      INVOICED:       'Facturée',
      PAID:           'Payée',
      REFUSED:        'Refusée',
      REJECTED:       'Rejetée',
      CANCELLED:      'Annulée',
      CONFIRMED:      'Confirmée',
      RETURNED:       'Retournée',
    };
    return map[status ?? ''] || 'Inconnu';
  }

  /** Returns the French label for a PaymentMethod */
  getPaymentMethodLabel(method: string | null | undefined): string {
    const map: Record<string, string> = {
      CASH:   'Espèces',
      CHEQUE: 'Chèque',
    };
    return map[method ?? ''] || '—';
  }

  protected updateForm(order: IOrder): void {
    this.order = order;
    this.orderFormService.resetForm(this.editForm, order);
    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, order.client);
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .subscribe(clients => (this.clientsSharedCollection = clients));

    this.productService
      .query({ 'isActive.equals': true, size: 500 })
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .subscribe(products => (this.productsSharedCollection = products));
  }
}
