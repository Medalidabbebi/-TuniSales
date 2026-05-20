import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, merge, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { ProductService } from 'app/entities/BusinessService/product/service/product.service';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';
import { StockItemStatus } from 'app/entities/enumerations/stock-item-status.model';
import { NewOrder, IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';
import { NewOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { OrderLineService } from 'app/entities/BusinessService/order-line/service/order-line.service';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { AiSummaryService } from 'app/shared/service/ai-summary.service';
import { ClientContactService } from 'app/entities/BusinessService/client-contact/service/client-contact.service';
import { IClientContact } from 'app/entities/BusinessService/client-contact/client-contact.model';

interface Step {
  title: string;
  description: string;
}

type PaymentMode = 'CASH' | 'TRANSFER' | 'CHEQUE';

@Component({
  selector: 'jhi-sales-offer-create',
  templateUrl: './sales-offer-create.component.html',
  styleUrls: ['./sales-offer-create.component.scss'],
})
export class SalesOfferCreateComponent implements OnInit, OnDestroy {
  readonly steps: Step[] = [
    { title: 'Client', description: 'Choisir le client de l\'offre' },
    { title: 'Produits', description: 'Ajouter les produits et quantites' },
    { title: 'Remise', description: 'Definir la remise globale' },
    { title: 'Paiement', description: 'Choisir le mode de paiement' },
    { title: 'Validation', description: 'Verifier et creer l\'offre' },
  ];

  readonly paymentModes: Array<{ value: PaymentMode; label: string; terms: string }> = [
    { value: 'CASH', label: 'Comptant', terms: 'Paiement immediat' },
    { value: 'TRANSFER', label: 'Virement', terms: 'Paiement a 30 jours' },
    { value: 'CHEQUE', label: 'Cheque', terms: 'Paiement a 60 jours' },
  ];

  currentStep = 0;
  isLoadingOptions = false;
  isSubmitting = false;
  submitSuccessMessage = '';
  submitErrorMessage = '';
  stockInsufficient = false;

  // ── Notification modal ────────────────────────────────────────────────────
  notifModal = false;
  notifTab: 'email' | 'sms' = 'email';
  notifEmailContent = '';
  notifSmsContent = '';
  notifEmailAddr = '';
  notifPhoneNumber = '';
  isGeneratingEmail = false;
  isGeneratingSms = false;
  emailCopied = false;
  smsCopied = false;
  clientContact: IClientContact | null = null;
  isLoadingContact = false;

  clients: IClient[] = [];
  products: IProduct[] = [];
  availableByProduct = new Map<number, number>();

  clientSearchTerm = '';
  showClientDropdown = false;
  productSearchTerms: string[] = [];
  showProductDropdowns: boolean[] = [];
  stockWarning = '';

  private readonly lineSubscriptions: Subscription[] = [];

  offerForm = this.fb.group({
    clientId: [null as number | null, [Validators.required]],
    globalDiscountPct: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    paymentMode: [null as PaymentMode | null, [Validators.required]],
    lines: this.fb.array<FormGroup>([]),
  });

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private productService: ProductService,
    private orderService: OrderService,
    private orderLineService: OrderLineService,
    private stockItemService: StockItemService,
    private router: Router,
    private aiSummaryService: AiSummaryService,
    private clientContactService: ClientContactService,
  ) {}

  /**
   * Generate a unique order number
   * Format: ORD-YYYYMMDD-HHMMSS-RAND (e.g., ORD-20260503-122530-0123)
   */
  private generateOrderNumber(): string {
    const now = dayjs();
    const date = now.format('YYYYMMDD');
    const time = now.format('HHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${date}-${time}-${random}`;
  }

  ngOnInit(): void {
    this.loadOptions();
    this.addLine();
  }

  ngOnDestroy(): void {
    this.lineSubscriptions.forEach(subscription => subscription.unsubscribe());
    this.lineSubscriptions.length = 0;
  }

  get lines(): FormArray<FormGroup> {
    return this.offerForm.get('lines') as FormArray<FormGroup>;
  }

  get selectedClient(): IClient | undefined {
    const clientId = this.offerForm.controls.clientId.value;
    return this.clients.find(client => client.id === clientId);
  }

  get subtotal(): number {
    return this.lines.controls.reduce((sum, lineGroup) => {
      const quantity = Number(lineGroup.controls.quantity.value ?? 0);
      const discountPct = Number(lineGroup.controls.discountPct.value ?? 0);
      const productId = Number(lineGroup.controls.productId.value ?? 0);
      const productPrice = this.products.find(product => product.id === productId)?.price ?? 0;
      const lineTotal = quantity * productPrice * (1 - discountPct / 100);
      return sum + lineTotal;
    }, 0);
  }

  get discountAmount(): number {
    const globalDiscountPct = Number(this.offerForm.controls.globalDiscountPct.value ?? 0);
    return this.subtotal * (globalDiscountPct / 100);
  }

  get totalAmount(): number {
    return this.subtotal - this.discountAmount;
  }

  get filteredClients(): IClient[] {
    const term = this.clientSearchTerm.toLowerCase().trim();
    if (!term) return this.clients;
    return this.clients.filter(c => (c.name ?? '').toLowerCase().includes(term));
  }

  getFilteredProducts(index: number): IProduct[] {
    const term = (this.productSearchTerms[index] ?? '').toLowerCase().trim();
    if (!term) return this.products;
    return this.products.filter(
      p => (p.name ?? '').toLowerCase().includes(term) || (p.sku ?? '').toLowerCase().includes(term)
    );
  }

  onClientInput(): void {
    this.showClientDropdown = true;
    const selected = this.clients.find(c => c.id === this.offerForm.controls.clientId.value);
    if (selected && selected.name !== this.clientSearchTerm) {
      this.offerForm.controls.clientId.setValue(null);
    }
  }

  selectClient(client: IClient): void {
    this.offerForm.controls.clientId.setValue(client.id);
    this.offerForm.controls.clientId.markAsTouched();
    this.clientSearchTerm = client.name ?? '';
    this.showClientDropdown = false;
  }

  clearClient(): void {
    this.offerForm.controls.clientId.setValue(null);
    this.clientSearchTerm = '';
    this.showClientDropdown = false;
  }

  hideClientDropdown(): void {
    setTimeout(() => (this.showClientDropdown = false), 150);
  }

  onProductInput(index: number): void {
    this.showProductDropdowns[index] = true;
    const productId = this.lines.at(index).controls['productId'].value as number | null;
    const selected = this.products.find(p => p.id === productId);
    if (selected && selected.name !== this.productSearchTerms[index]) {
      this.lines.at(index).controls['productId'].setValue(null);
    }
  }

  selectProduct(index: number, product: IProduct): void {
    this.lines.at(index).controls['productId'].setValue(product.id);
    this.lines.at(index).controls['productId'].markAsTouched();
    this.productSearchTerms[index] = product.name ?? '';
    this.showProductDropdowns[index] = false;
  }

  clearProduct(index: number): void {
    this.lines.at(index).controls['productId'].setValue(null);
    this.productSearchTerms[index] = '';
    this.showProductDropdowns[index] = false;
  }

  hideProductDropdown(index: number): void {
    setTimeout(() => (this.showProductDropdowns[index] = false), 150);
  }

  addLine(): void {
    const line = this.fb.group({
      productId: [null as number | null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1), this.stockQuantityValidator()]],
      discountPct: [0, [Validators.min(0), Validators.max(100)]],
    });
    this.lines.push(line);
    this.productSearchTerms.push('');
    this.showProductDropdowns.push(false);
    this.registerLineSubscription(line);
  }

  removeLine(index: number): void {
    if (this.lines.length === 1) {
      return;
    }

    this.lineSubscriptions[index]?.unsubscribe();
    this.lineSubscriptions.splice(index, 1);
    this.lines.removeAt(index);
    this.productSearchTerms.splice(index, 1);
    this.showProductDropdowns.splice(index, 1);
  }

  getAvailableStock(productId: number | null): number | null {
    if (!productId) {
      return null;
    }

    return this.availableByProduct.get(productId) ?? null;
  }

  getProductPrice(productId: number | null): number {
    if (!productId) return 0;
    return this.products.find(p => p.id === productId)?.price ?? 0;
  }

  getProductName(productId: number | null): string {
    if (!productId) return '—';
    return this.products.find(p => p.id === productId)?.name ?? '—';
  }

  getProductSku(productId: number | null): string {
    if (!productId) return '';
    return this.products.find(p => p.id === productId)?.sku ?? '';
  }

  getLineTotal(index: number): number {
    const lineGroup = this.lines.at(index);
    const quantity = Number(lineGroup.controls.quantity.value ?? 0);
    const discountPct = Number(lineGroup.controls.discountPct.value ?? 0);
    const productId = lineGroup.controls.productId.value as number | null;
    const unitPrice = this.getProductPrice(productId);
    return quantity * unitPrice * (1 - discountPct / 100);
  }

  hasExceedsStock(): boolean {
    return this.lines.controls.some(lineGroup => lineGroup.controls.quantity.hasError('exceedsStock'));
  }

  nextStep(): void {
    if (!this.canGoNext()) {
      this.markCurrentStepTouched();
      return;
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep += 1;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  goToStep(stepIndex: number): void {
    if (stepIndex < this.currentStep) {
      this.currentStep = stepIndex;
      return;
    }

    if (stepIndex === this.currentStep + 1 && this.canGoNext()) {
      this.currentStep = stepIndex;
      return;
    }

    if (stepIndex <= this.maxReachableStep()) {
      this.currentStep = stepIndex;
    }
  }

  canGoNext(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.offerForm.controls.clientId.valid;
      case 1:
        return this.lines.length > 0 && this.lines.valid && !this.hasOutOfStockProducts();
      case 2:
        return this.offerForm.controls.globalDiscountPct.valid;
      case 3:
        return this.offerForm.controls.paymentMode.valid;
      default:
        return true;
    }
  }

  maxReachableStep(): number {
    if (!this.offerForm.controls.clientId.valid) {
      return 0;
    }
    if (!(this.lines.length > 0 && this.lines.valid) || this.hasOutOfStockProducts()) {
      return 1;
    }
    if (!this.offerForm.controls.globalDiscountPct.valid) {
      return 2;
    }
    if (!this.offerForm.controls.paymentMode.valid) {
      return 3;
    }
    return 4;
  }

  submitOffer(): void {
    this.submitSuccessMessage = '';
    this.submitErrorMessage = '';
    this.stockInsufficient = false;

    if (this.offerForm.invalid || !(this.lines.length > 0 && this.lines.valid)) {
      this.offerForm.markAllAsTouched();
      this.currentStep = this.maxReachableStep();
      return;
    }

    const paymentMode = this.offerForm.controls.paymentMode.value as PaymentMode;
    const paymentTermsDays = this.getPaymentTermsDays(paymentMode);
    const generatedOrderNumber = this.generateOrderNumber();

    const notifData = {
      clientName: this.selectedClient?.name ?? 'Client',
      orderNumber: generatedOrderNumber,
      totalAmount: this.roundTo2(this.totalAmount).toFixed(2),
      paymentTermsDays,
    };

    const orderPayload: NewOrder = {
      id: null,
      tenantId: 1, // TODO: Get actual tenant ID from account service  
      orderNumber: generatedOrderNumber,
      status: OrderStatus.DRAFT,
      subtotal: this.roundTo2(this.subtotal),
      discountAmount: this.roundTo2(this.discountAmount),
      taxAmount: 0,
      totalAmount: this.roundTo2(this.totalAmount),
      paymentTermsDays,
      dueDate: dayjs().add(paymentTermsDays, 'day'),
      isDeleted: false,
      createdAt: dayjs(),
      client: this.selectedClient ? { id: this.selectedClient.id, name: this.selectedClient.name ?? null } : null,
    };

    this.isSubmitting = true;

    this.orderService.create(orderPayload)
      .pipe(
        switchMap((orderRes: HttpResponse<IOrder>) => {
              const createdOrder = orderRes.body;
              if (!createdOrder?.id) {
                return of(null);
              }

              const lineRequests = this.lines.controls.map(lineGroup => {
                const productId = lineGroup.controls.productId.value as number;
                const product = this.products.find(item => item.id === productId);
                const quantity = Number(lineGroup.controls.quantity.value ?? 0);
                const discountPct = Number(lineGroup.controls.discountPct.value ?? 0);
                const unitPrice = product?.price ?? 0;

                const linePayload: NewOrderLine = {
                  id: null,
                  quantity,
                  unitPrice,
                  discountPct,
                  lineTotal: this.roundTo2(quantity * unitPrice * (1 - discountPct / 100)),
                  createdAt: dayjs(),
                  product: product ? { id: product.id, name: product.name ?? null } : null,
                  order: { id: createdOrder.id, orderNumber: createdOrder.orderNumber ?? null },
                };

                return this.orderLineService.create(linePayload);
              });

              if (lineRequests.length === 0) {
                return of(null);
              }

              const lineData = this.lines.controls.map(lg => ({
                productId: lg.controls.productId.value as number,
                quantity: Number(lg.controls.quantity.value ?? 0),
              }));

              return forkJoin(lineRequests).pipe(
                switchMap(() => this.decrementStockForLines(lineData)),
                map(() => null)
              );
            }),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(() => {
          this.submitErrorMessage = "La creation de l'offre a echoue. Verifiez les donnees et reessayez.";
          return of(null);
        })
      )
      .subscribe(result => {
        if (result === null && !this.submitErrorMessage) {
          this.openNotifModal(notifData);
        }
      });
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
    if (!this.notifEmailContent || !this.notifEmailAddr) return;
    const lines = this.notifEmailContent.split('\n');
    const subjectLine = lines.find(l => /^objet\s*:/i.test(l.trim()));
    const subject = subjectLine
      ? subjectLine.replace(/^objet\s*:\s*/i, '').trim()
      : 'Confirmation de commande';
    window.open(
      `mailto:${this.notifEmailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.notifEmailContent)}`,
      '_blank'
    );
  }

  sendBySms(): void {
    if (!this.notifSmsContent || !this.notifPhoneNumber) return;
    const phone = this.notifPhoneNumber.replace(/\s+/g, '');
    window.open(`sms:${phone}?body=${encodeURIComponent(this.notifSmsContent)}`, '_blank');
  }

  sendByWhatsApp(): void {
    if (!this.notifSmsContent || !this.notifPhoneNumber) return;
    const phone = this.notifPhoneNumber.replace(/[\s\-\(\)\+]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(this.notifSmsContent)}`, '_blank');
  }

  closeNotifModal(): void {
    this.notifModal = false;
    void this.router.navigate(['/order']);
  }

  private openNotifModal(data: { clientName: string; orderNumber: string; totalAmount: string; paymentTermsDays: number }): void {
    this.notifModal = true;
    this.notifTab = 'email';
    this.notifEmailContent = '';
    this.notifSmsContent = '';
    this.notifEmailAddr = '';
    this.notifPhoneNumber = '';
    this.clientContact = null;
    this.isGeneratingEmail = true;
    this.isGeneratingSms = true;
    this.isLoadingContact = true;
    this.emailCopied = false;
    this.smsCopied = false;

    const clientId = this.offerForm.controls.clientId.value;
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
        this.notifEmailAddr = this.clientContact?.email ?? '';
        this.notifPhoneNumber = this.clientContact?.phone ?? '';
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

  private checkStockForLines() {
    return this.refreshAvailableStock().pipe(
      map(() => {
        const requestedByProduct = new Map<number, number>();
        this.lines.controls.forEach(lineGroup => {
          const productId = Number(lineGroup.controls.productId.value ?? 0);
          const quantity = Number(lineGroup.controls.quantity.value ?? 0);
          if (!productId || quantity <= 0) {
            return;
          }
          requestedByProduct.set(productId, (requestedByProduct.get(productId) ?? 0) + quantity);
        });

        const over = Array.from(requestedByProduct.entries()).find(([productId, requested]) => requested > (this.availableByProduct.get(productId) ?? 0));

        if (over) {
          const [productId, requested] = over;
          const prod = this.products.find(p => p.id === productId);
          const available = this.availableByProduct.get(productId) ?? 0;
          this.submitErrorMessage = `Quantite demandee pour ${prod?.name ?? 'produit'} (${requested}) depasse le stock disponible (${available}).`;
          this.stockInsufficient = true;
          return false;
        }

        this.stockInsufficient = false;
        return true;
      })
    );
  }

  private refreshAvailableStock(): Observable<Map<number, number>> {
    return this.stockItemService.query({ size: 5000, sort: ['productId,asc'], ['status.equals']: StockItemStatus.AVAILABLE }).pipe(
      map(res => {
        const nextAvailable = new Map<number, number>();

        (res.body ?? []).forEach(stockItem => {
          const productId = stockItem.productId;
          if (!productId) {
            return;
          }

          nextAvailable.set(productId, (nextAvailable.get(productId) ?? 0) + 1);
        });

        this.availableByProduct = nextAvailable;
        this.refreshQuantityValidators();
        return nextAvailable;
      })
    );
  }

  private refreshQuantityValidators(): void {
    this.lines.controls.forEach(lineGroup => {
      lineGroup.controls.quantity.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  private registerLineSubscription(lineGroup: FormGroup): void {
    const subscription = merge(lineGroup.controls.productId.valueChanges, lineGroup.controls.quantity.valueChanges).subscribe(() => {
      lineGroup.controls.quantity.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.lineSubscriptions.push(subscription);
  }

  private decrementStockForLines(lines: Array<{ productId: number; quantity: number }>): Observable<unknown> {
    const productGroups = new Map<number, number>();
    lines.forEach(l => {
      if (l.productId && l.quantity > 0) {
        productGroups.set(l.productId, (productGroups.get(l.productId) ?? 0) + l.quantity);
      }
    });

    if (productGroups.size === 0) {
      return of(null);
    }

    const requests = Array.from(productGroups.entries()).map(([productId, quantity]) =>
      this.stockItemService
        .query({ 'productId.equals': productId, 'status.equals': StockItemStatus.AVAILABLE, size: quantity })
        .pipe(
          switchMap(res => {
            const items = res.body ?? [];
            if (items.length === 0) {
              return of(null);
            }
            return forkJoin(items.map(item => this.stockItemService.partialUpdate({ id: item.id, status: StockItemStatus.SOLD })));
          })
        )
    );

    return forkJoin(requests);
  }

  hasOutOfStockProducts(): boolean {
    return this.lines.controls.some(lineGroup => {
      const productId = Number(lineGroup.get('productId')?.value ?? 0);
      if (!productId) return false;
      return (this.availableByProduct.get(productId) ?? 0) === 0;
    });
  }

  private stockQuantityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const quantity = Number(control.value ?? 0);
      if (quantity <= 0) return null;

      const lineGroup = control.parent as FormGroup | null;
      if (!lineGroup) return null;

      const productId = Number(lineGroup.get('productId')?.value ?? 0);
      if (!productId) return null;

      const available = this.availableByProduct.get(productId) ?? 0;
      if (available === 0) {
        return { outOfStock: true };
      }
      if (quantity > available) {
        return { exceedsStock: { requested: quantity, available } };
      }
      return null;
    };
  }

  private loadOptions(): void {
    this.isLoadingOptions = true;

    forkJoin({
      clients: this.clientService.query({ size: 1000, sort: ['name,asc'] }),
      products: this.productService.query({ size: 1000, sort: ['name,asc'] }),
    })
      .pipe(finalize(() => (this.isLoadingOptions = false)))
      .subscribe({
        next: ({ clients, products }) => {
          this.clients = clients.body ?? [];
          this.products = products.body ?? [];
          this.refreshAvailableStock().subscribe({
            next: stockMap => {
              const total = Array.from(stockMap.values()).reduce((a, b) => a + b, 0);
              console.log('[Stock] items AVAILABLE par produit:', Array.from(stockMap.entries()));
              if (total === 0) {
                this.stockWarning = 'InventoryService : aucun article AVAILABLE trouvé. Vérifiez que le service est démarré et que des StockItems existent.';
              } else {
                this.stockWarning = '';
              }
            },
            error: (err) => {
              console.error('[Stock] Erreur InventoryService:', err);
              this.stockWarning = `InventoryService inaccessible (${err?.status ?? 'erreur réseau'}). Le stock ne peut pas être affiché.`;
              this.availableByProduct = new Map<number, number>();
              this.refreshQuantityValidators();
            },
          });
        },
        error: () => {
          this.submitErrorMessage = 'Impossible de charger les clients/produits.';
        },
      });
  }

  private markCurrentStepTouched(): void {
    if (this.currentStep === 0) {
      this.offerForm.controls.clientId.markAsTouched();
      return;
    }

    if (this.currentStep === 1) {
      this.lines.controls.forEach(line => line.markAllAsTouched());
      return;
    }

    if (this.currentStep === 2) {
      this.offerForm.controls.globalDiscountPct.markAsTouched();
      return;
    }

    if (this.currentStep === 3) {
      this.offerForm.controls.paymentMode.markAsTouched();
    }
  }

  private getPaymentTermsDays(mode: PaymentMode): number {
    if (mode === 'TRANSFER') {
      return 30;
    }
    if (mode === 'CHEQUE') {
      return 60;
    }
    return 0;
  }

  private roundTo2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private resetForm(): void {
    this.offerForm.reset({
      clientId: null,
      globalDiscountPct: 0,
      paymentMode: null,
    });

    this.lineSubscriptions.forEach(subscription => subscription.unsubscribe());
    this.lineSubscriptions.length = 0;

    while (this.lines.length > 0) {
      this.lines.removeAt(0);
    }

    this.addLine();
    this.currentStep = 0;
  }
}
