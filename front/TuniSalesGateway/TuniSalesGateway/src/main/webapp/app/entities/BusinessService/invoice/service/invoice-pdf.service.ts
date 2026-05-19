import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { IInvoice } from '../invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicePdfService {

  generate(invoice: IInvoice): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 18;
    const contentW = W - margin * 2;

    // ── Palette ─────────────────────────────────────────────────────
    const C = {
      primary:   [8, 145, 178]   as [number,number,number],
      dark:      [15, 23, 42]    as [number,number,number],
      muted:     [100, 116, 139] as [number,number,number],
      light:     [240, 250, 250] as [number,number,number],
      white:     [255, 255, 255] as [number,number,number],
      border:    [203, 213, 225] as [number,number,number],
      green:     [22, 163, 74]   as [number,number,number],
      orange:    [217, 119, 6]   as [number,number,number],
      red:       [220, 38, 38]   as [number,number,number],
    };

    const fmt = (v: number | null | undefined): string =>
      v != null ? v.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' TND' : '—';

    const fmtDate = (d: any): string => {
      if (!d) return '—';
      try { return d.format ? d.format('DD/MM/YYYY') : String(d).slice(0, 10); }
      catch { return '—'; }
    };

    const statusInfo = (s: string | null | undefined): { label: string; color: [number,number,number] } => {
      const map: Record<string, { label: string; color: [number,number,number] }> = {
        DRAFT:          { label: 'Brouillon',       color: C.muted },
        ISSUED:         { label: 'Émise',            color: C.primary },
        PARTIALLY_PAID: { label: 'Partiellement payée', color: C.orange },
        PAID:           { label: 'Payée',            color: C.green },
        OVERDUE:        { label: 'En retard',        color: C.red },
        CANCELLED:      { label: 'Annulée',          color: [127, 29, 29] },
      };
      return map[s ?? ''] ?? { label: '—', color: C.muted };
    };

    let y = 0;

    // ── Header banner ───────────────────────────────────────────────
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, W, 36, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...C.white);
    doc.text('TuniSales', margin, 16);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(207, 250, 254);
    doc.text('Plateforme de gestion commerciale', margin, 22);

    // FACTURE label (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...C.white);
    doc.text('FACTURE', W - margin, 16, { align: 'right' });

    // Invoice number under label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(207, 250, 254);
    doc.text(invoice.invoiceNumber ?? `#${invoice.id}`, W - margin, 23, { align: 'right' });

    y = 44;

    // ── Status badge ────────────────────────────────────────────────
    const si = statusInfo(invoice.status);
    doc.setFillColor(...si.color);
    doc.roundedRect(margin, y - 5, 42, 7, 3.5, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text(si.label.toUpperCase(), margin + 21, y, { align: 'center' });

    y += 6;

    // ── Divider ─────────────────────────────────────────────────────
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W - margin, y);
    y += 6;

    // ── Info block: left (client/order) & right (dates) ─────────────
    const infoY = y;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text('FACTURER À', margin, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.dark);
    doc.text(invoice.client?.name ?? '—', margin, y);
    y += 5;

    if (invoice.order?.orderNumber) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      doc.text(`Commande : ${invoice.order.orderNumber}`, margin, y);
      y += 5;
    }

    // Right column — dates
    const rX = W - margin;
    let ry = infoY;
    const dateRow = (label: string, val: string): void => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(label, rX, ry, { align: 'right' });
      ry += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.dark);
      doc.text(val, rX, ry, { align: 'right' });
      ry += 6;
    };

    dateRow("DATE D'ÉMISSION", fmtDate(invoice.issueDate));
    dateRow("DATE D'ÉCHÉANCE", fmtDate(invoice.dueDate));
    if (invoice.paidAt) dateRow('PAYÉE LE', fmtDate(invoice.paidAt));

    y = Math.max(y, ry) + 4;

    // ── Divider ─────────────────────────────────────────────────────
    doc.setDrawColor(...C.border);
    doc.line(margin, y, W - margin, y);
    y += 8;

    // ── Financial table ──────────────────────────────────────────────
    const tableX = margin + 20;
    const tableW = contentW - 20;
    const col1 = tableX;
    const col2 = tableX + tableW;

    const drawRow = (label: string, value: string, bg: [number,number,number] | null, bold = false, textColor: [number,number,number] = C.dark): void => {
      if (bg) {
        doc.setFillColor(...bg);
        doc.rect(col1 - 4, y - 5, tableW + 8, 8, 'F');
      }
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 10 : 9.5);
      doc.setTextColor(...textColor);
      doc.text(label, col1, y);
      doc.text(value, col2, y, { align: 'right' });
      y += 9;
    };

    // Table header
    doc.setFillColor(...C.primary);
    doc.rect(margin, y - 5, contentW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.white);
    doc.text('DESCRIPTION', margin + 4, y);
    doc.text('MONTANT', W - margin - 4, y, { align: 'right' });
    y += 9;

    drawRow('Montant HT', fmt(invoice.amountHt), [248, 250, 252]);
    drawRow('TVA', fmt(invoice.taxAmount), null);

    // Separator
    doc.setDrawColor(...C.border);
    doc.line(col1 - 4, y - 3, col2 + 4, y - 3);
    y += 2;

    // Total row
    doc.setFillColor(8, 145, 178, 15);
    doc.rect(col1 - 4, y - 5, tableW + 8, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.primary);
    doc.text('TOTAL TTC', col1, y);
    doc.text(fmt(invoice.amountTtc), col2, y, { align: 'right' });
    y += 14;

    // ── Payment note ────────────────────────────────────────────────
    if (invoice.status === 'PAID') {
      doc.setFillColor(...C.green);
      doc.roundedRect(margin, y, contentW, 9, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C.white);
      doc.text(`✓  Payée le ${fmtDate(invoice.paidAt)}`, W / 2, y + 5.5, { align: 'center' });
      y += 14;
    }

    // ── Footer ──────────────────────────────────────────────────────
    const footerY = 285;
    doc.setFillColor(...C.light);
    doc.rect(0, footerY - 2, W, 14, 'F');
    doc.setDrawColor(...C.border);
    doc.line(0, footerY - 2, W, footerY - 2);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text('TuniSales — Plateforme de gestion commerciale', W / 2, footerY + 3, { align: 'center' });
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-TN')}`, W / 2, footerY + 7.5, { align: 'center' });

    // ── Save ────────────────────────────────────────────────────────
    const filename = `facture-${invoice.invoiceNumber ?? invoice.id}.pdf`;
    doc.save(filename);
  }
}
