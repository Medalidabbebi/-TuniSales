import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';

export interface ExportInvoiceOptions {
  includeStats?: boolean;
  columns?: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class SalesExcelService {

  private fmtDate(d: any): string {
    if (!d) return '';
    try { return d.format ? d.format('DD/MM/YYYY') : String(d).slice(0, 10); }
    catch { return ''; }
  }

  private fmtNum(v: number | null | undefined): number | string {
    return v != null ? v : '';
  }

  private autoWidth(ws: XLSX.WorkSheet, data: any[][]): void {
    const colWidths = data[0].map((_: any, ci: number) =>
      Math.max(...data.map(row => String(row[ci] ?? '').length), 10) + 2
    );
    ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 40) }));
  }

  private applyHeaderStyle(ws: XLSX.WorkSheet, colCount: number): void {
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill:      { fgColor: { rgb: '006699' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'medium', color: { rgb: '004466' } },
        },
      };
    }
  }

  exportOrders(orders: IOrder[], filename = 'commandes-ventes'): void {
    const STATUS_FR: Record<string, string> = {
      DRAFT: 'Brouillon', SUBMITTED: 'Soumis', UNDER_REVIEW: 'En révision',
      APPROVED: 'Approuvé', IN_PREPARATION: 'En préparation', SHIPPED: 'Expédié',
      DELIVERED: 'Livré', INVOICED: 'Facturé', PAID: 'Payé',
      REJECTED: 'Rejeté', CANCELLED: 'Annulé',
    };

    const PAYMENT_FR: Record<string, string> = {
      CASH: 'Espèces', BANK_TRANSFER: 'Virement', CHECK: 'Chèque',
      CREDIT_CARD: 'Carte', DEFERRED: 'Différé',
    };

    const headers = [
      'N° Ordre', 'Client', 'Statut', 'Mode de paiement',
      'Sous-total (TND)', 'Remise %', 'Remise (TND)', 'TVA (TND)', 'Total (TND)',
      'Délai paiement (j)', 'Date échéance', 'Soumis le', 'Validé le', 'Créé le',
    ];

    const rows = orders.map(o => [
      o.orderNumber ?? '',
      o.client?.name ?? '',
      STATUS_FR[o.status ?? ''] ?? o.status ?? '',
      PAYMENT_FR[o.paymentMethod ?? ''] ?? o.paymentMethod ?? '',
      this.fmtNum(o.subtotal),
      this.fmtNum(o.discountPercent),
      this.fmtNum(o.discountAmount),
      this.fmtNum(o.taxAmount),
      this.fmtNum(o.totalAmount),
      this.fmtNum(o.paymentTermsDays),
      this.fmtDate(o.dueDate),
      this.fmtDate(o.submittedAt),
      this.fmtDate(o.validatedAt),
      this.fmtDate(o.createdAt),
    ]);

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.autoWidth(ws, data);
    this.applyHeaderStyle(ws, headers.length);

    // Summary row
    if (rows.length > 0) {
      const summaryRow = Array(headers.length).fill('');
      summaryRow[0] = `TOTAL (${rows.length} commandes)`;
      summaryRow[8] = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
      XLSX.utils.sheet_add_aoa(ws, [summaryRow], { origin: -1 });
      const lastRow = rows.length + 1;
      ws[XLSX.utils.encode_cell({ r: lastRow, c: 0 })].s = {
        font: { bold: true, color: { rgb: '006699' } },
        fill: { fgColor: { rgb: 'EFF8FF' } },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');

    // Stats sheet
    this.addOrderStats(wb, orders, STATUS_FR);

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}-${date}.xlsx`);
  }

  private addOrderStats(wb: XLSX.WorkBook, orders: IOrder[], statusFr: Record<string, string>): void {
    const totalTtc = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const totalHt  = orders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
    const totalTva = orders.reduce((s, o) => s + (o.taxAmount ?? 0), 0);

    const byStatus: Record<string, number> = {};
    orders.forEach(o => {
      const k = statusFr[o.status ?? ''] ?? o.status ?? 'Inconnu';
      byStatus[k] = (byStatus[k] ?? 0) + 1;
    });

    const statsData: any[][] = [
      ['SYNTHÈSE DES VENTES', ''],
      ['', ''],
      ['Indicateur', 'Valeur'],
      ['Nombre de commandes', orders.length],
      ['Montant HT total (TND)', totalHt],
      ['TVA totale (TND)', totalTva],
      ['Montant TTC total (TND)', totalTtc],
      ['Montant moyen/commande (TND)', orders.length ? totalTtc / orders.length : 0],
      ['', ''],
      ['RÉPARTITION PAR STATUT', ''],
      ['Statut', 'Nombre'],
      ...Object.entries(byStatus).map(([k, v]) => [k, v]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(statsData);
    ws2['!cols'] = [{ wch: 35 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Synthèse');
  }

  exportInvoices(invoices: IInvoice[], filename = 'factures-ventes', options?: ExportInvoiceOptions): void {
    const STATUS_FR: Record<string, string> = {
      DRAFT: 'Brouillon', ISSUED: 'Émise', PARTIALLY_PAID: 'Part. payée',
      PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée',
    };

    const include = (key: string): boolean => !options?.columns || options.columns[key] !== false;

    const colDefs: Array<{ key: string; label: string; val: (inv: IInvoice) => string | number }> = [
      { key: 'invoiceNumber', label: 'N° Facture',       val: inv => inv.invoiceNumber ?? '' },
      { key: 'client',        label: 'Client',            val: inv => inv.client?.name ?? '' },
      { key: 'order',         label: 'Commande liée',     val: inv => inv.order?.orderNumber ?? '' },
      { key: 'status',        label: 'Statut',            val: inv => STATUS_FR[inv.status ?? ''] ?? inv.status ?? '' },
      { key: 'amountHt',      label: 'Montant HT (TND)',  val: inv => this.fmtNum(inv.amountHt) },
      { key: 'taxAmount',     label: 'TVA (TND)',          val: inv => this.fmtNum(inv.taxAmount) },
      { key: 'amountTtc',     label: 'Montant TTC (TND)', val: inv => this.fmtNum(inv.amountTtc) },
      { key: 'issueDate',     label: "Date d'émission",   val: inv => this.fmtDate(inv.issueDate) },
      { key: 'dueDate',       label: "Date d'échéance",   val: inv => this.fmtDate(inv.dueDate) },
      { key: 'paidAt',        label: 'Payée le',          val: inv => this.fmtDate(inv.paidAt) },
      { key: 'createdAt',     label: 'Créée le',          val: inv => this.fmtDate(inv.createdAt) },
    ];

    const activeCols = colDefs.filter(c => include(c.key));
    const headers = activeCols.map(c => c.label);
    const rows = invoices.map(inv => activeCols.map(c => c.val(inv)));

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.autoWidth(ws, data);
    this.applyHeaderStyle(ws, headers.length);

    if (rows.length > 0) {
      const summaryRow = Array(activeCols.length).fill('');
      summaryRow[0] = `TOTAL (${rows.length} factures)`;
      const htIdx  = activeCols.findIndex(c => c.key === 'amountHt');
      const tvaIdx = activeCols.findIndex(c => c.key === 'taxAmount');
      const ttcIdx = activeCols.findIndex(c => c.key === 'amountTtc');
      if (htIdx  >= 0) summaryRow[htIdx]  = invoices.reduce((s, i) => s + (i.amountHt  ?? 0), 0);
      if (tvaIdx >= 0) summaryRow[tvaIdx] = invoices.reduce((s, i) => s + (i.taxAmount ?? 0), 0);
      if (ttcIdx >= 0) summaryRow[ttcIdx] = invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0);
      XLSX.utils.sheet_add_aoa(ws, [summaryRow], { origin: -1 });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');

    if (options?.includeStats !== false) {
      this.addInvoiceStats(wb, invoices, STATUS_FR);
    }

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}-${date}.xlsx`);
  }

  exportClients(clients: IClient[]): void {
    const TYPE_FR: Record<string, string> = {
      NATIONAL_DISTRIBUTOR: 'Distributeur national', REGIONAL_WHOLESALER: 'Grossiste régional',
      INDEPENDENT_POS: 'PDV indépendant', TELECOM_OPERATOR: 'Opérateur télécom',
    };
    const STATUS_FR: Record<string, string> = {
      ACTIVE: 'Actif', INACTIVE: 'Inactif', SUSPENDED: 'Suspendu', CHURN_RISK: 'À risque',
    };
    const headers = [
      'ID', 'Nom', 'Type', 'Statut', 'Matricule fiscal',
      'Limite crédit (TND)', 'Crédit utilisé (TND)', 'Délai paiement (j)',
      'Dernière commande', 'Créé le',
    ];
    const rows = clients.map(c => [
      c.id,
      c.name ?? '',
      TYPE_FR[c.clientType ?? ''] ?? c.clientType ?? '',
      STATUS_FR[c.status ?? ''] ?? c.status ?? '',
      c.taxId ?? '',
      this.fmtNum(c.creditLimit),
      this.fmtNum(c.creditUsed),
      this.fmtNum(c.paymentTermsDays),
      this.fmtDate(c.lastOrderAt),
      this.fmtDate(c.createdAt),
    ]);
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    this.autoWidth(ws, data);
    this.applyHeaderStyle(ws, headers.length);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `clients-${date}.xlsx`);
  }

  exportByClient(client: IClient, orders: IOrder[], invoices: IInvoice[]): void {
    const ORDER_STATUS: Record<string, string> = {
      DRAFT: 'Brouillon', SUBMITTED: 'Soumis', UNDER_REVIEW: 'En révision',
      APPROVED: 'Approuvé', IN_PREPARATION: 'En préparation', SHIPPED: 'Expédié',
      DELIVERED: 'Livré', INVOICED: 'Facturé', PAID: 'Payé',
      REJECTED: 'Rejeté', CANCELLED: 'Annulé',
    };
    const INV_STATUS: Record<string, string> = {
      DRAFT: 'Brouillon', ISSUED: 'Émise', PARTIALLY_PAID: 'Part. payée',
      PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée',
    };
    const TYPE_FR: Record<string, string> = {
      NATIONAL_DISTRIBUTOR: 'Distributeur national', REGIONAL_WHOLESALER: 'Grossiste régional',
      INDEPENDENT_POS: 'PDV indépendant', TELECOM_OPERATOR: 'Opérateur télécom',
    };
    const STATUS_FR: Record<string, string> = {
      ACTIVE: 'Actif', INACTIVE: 'Inactif', SUSPENDED: 'Suspendu', CHURN_RISK: 'À risque',
    };

    const wb = XLSX.utils.book_new();

    // ── Sheet 1 : Fiche client ────────────────────────────────────────
    const clientData: any[][] = [
      ['FICHE CLIENT', ''],
      ['', ''],
      ['Champ', 'Valeur'],
      ['ID', client.id],
      ['Nom', client.name ?? ''],
      ['Type', TYPE_FR[client.clientType ?? ''] ?? client.clientType ?? ''],
      ['Statut', STATUS_FR[client.status ?? ''] ?? client.status ?? ''],
      ['Matricule fiscal', client.taxId ?? ''],
      ['Limite crédit (TND)', this.fmtNum(client.creditLimit)],
      ['Crédit utilisé (TND)', this.fmtNum(client.creditUsed)],
      ['Délai paiement (j)', this.fmtNum(client.paymentTermsDays)],
      ['Dernière commande', this.fmtDate(client.lastOrderAt)],
      ['Créé le', this.fmtDate(client.createdAt)],
      ['', ''],
      ['RÉSUMÉ VENTES', ''],
      ['Nombre de commandes', orders.length],
      ['Nombre de factures', invoices.length],
      ['CA total commandes (TND)', orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)],
      ['CA total facturé (TND)', invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0)],
      ['Montant encaissé (TND)', invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.amountTtc ?? 0), 0)],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(clientData);
    ws1['!cols'] = [{ wch: 28 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Fiche client');

    // ── Sheet 2 : Commandes ───────────────────────────────────────────
    const orderHeaders = [
      'N° Ordre', 'Statut', 'Mode paiement',
      'Sous-total HT (TND)', 'Remise %', 'Remise (TND)', 'TVA (TND)', 'Total TTC (TND)',
      'Date échéance', 'Soumis le', 'Validé le',
    ];
    const orderRows = orders.map(o => [
      o.orderNumber ?? '',
      ORDER_STATUS[o.status ?? ''] ?? o.status ?? '',
      o.paymentMethod ?? '',
      this.fmtNum(o.subtotal),
      this.fmtNum(o.discountPercent),
      this.fmtNum(o.discountAmount),
      this.fmtNum(o.taxAmount),
      this.fmtNum(o.totalAmount),
      this.fmtDate(o.dueDate),
      this.fmtDate(o.submittedAt),
      this.fmtDate(o.validatedAt),
    ]);
    if (orderRows.length > 0) {
      const totalRow = Array(orderHeaders.length).fill('');
      totalRow[0] = `TOTAL (${orderRows.length})`;
      totalRow[7] = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
      orderRows.push(totalRow);
    }
    const ordData = [orderHeaders, ...orderRows];
    const ws2 = XLSX.utils.aoa_to_sheet(ordData);
    this.autoWidth(ws2, ordData);
    this.applyHeaderStyle(ws2, orderHeaders.length);
    XLSX.utils.book_append_sheet(wb, ws2, 'Commandes');

    // ── Sheet 3 : Factures ────────────────────────────────────────────
    const invHeaders = [
      'N° Facture', 'Commande liée', 'Statut',
      'Montant HT (TND)', 'TVA (TND)', 'Montant TTC (TND)',
      "Date d'émission", "Date d'échéance", 'Payée le',
    ];
    const invRows = invoices.map(inv => [
      inv.invoiceNumber ?? '',
      inv.order?.orderNumber ?? '',
      INV_STATUS[inv.status ?? ''] ?? inv.status ?? '',
      this.fmtNum(inv.amountHt),
      this.fmtNum(inv.taxAmount),
      this.fmtNum(inv.amountTtc),
      this.fmtDate(inv.issueDate),
      this.fmtDate(inv.dueDate),
      this.fmtDate(inv.paidAt),
    ]);
    if (invRows.length > 0) {
      const totalRow = Array(invHeaders.length).fill('');
      totalRow[0] = `TOTAL (${invRows.length})`;
      totalRow[3] = invoices.reduce((s, i) => s + (i.amountHt  ?? 0), 0);
      totalRow[4] = invoices.reduce((s, i) => s + (i.taxAmount ?? 0), 0);
      totalRow[5] = invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0);
      invRows.push(totalRow);
    }
    const invData = [invHeaders, ...invRows];
    const ws3 = XLSX.utils.aoa_to_sheet(invData);
    this.autoWidth(ws3, invData);
    this.applyHeaderStyle(ws3, invHeaders.length);
    XLSX.utils.book_append_sheet(wb, ws3, 'Factures');

    const date = new Date().toISOString().slice(0, 10);
    const safeName = (client.name ?? 'client').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `ventes-${safeName}-${date}.xlsx`);
  }

  private addInvoiceStats(wb: XLSX.WorkBook, invoices: IInvoice[], statusFr: Record<string, string>): void {
    const totalHt  = invoices.reduce((s, i) => s + (i.amountHt  ?? 0), 0);
    const totalTva = invoices.reduce((s, i) => s + (i.taxAmount ?? 0), 0);
    const totalTtc = invoices.reduce((s, i) => s + (i.amountTtc ?? 0), 0);
    const paid     = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.amountTtc ?? 0), 0);
    const unpaid   = totalTtc - paid;

    const byStatus: Record<string, number> = {};
    invoices.forEach(i => {
      const k = statusFr[i.status ?? ''] ?? i.status ?? 'Inconnu';
      byStatus[k] = (byStatus[k] ?? 0) + 1;
    });

    const statsData: any[][] = [
      ['SYNTHÈSE DES FACTURES', ''],
      ['', ''],
      ['Indicateur', 'Valeur'],
      ['Nombre de factures', invoices.length],
      ['Total HT (TND)', totalHt],
      ['Total TVA (TND)', totalTva],
      ['Total TTC (TND)', totalTtc],
      ['Montant encaissé (TND)', paid],
      ['Montant restant dû (TND)', unpaid],
      ['', ''],
      ['RÉPARTITION PAR STATUT', ''],
      ['Statut', 'Nombre'],
      ...Object.entries(byStatus).map(([k, v]) => [k, v]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(statsData);
    ws2['!cols'] = [{ wch: 32 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Synthèse');
  }
}
