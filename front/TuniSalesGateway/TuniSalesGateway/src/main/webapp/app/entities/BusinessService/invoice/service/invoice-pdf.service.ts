import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { IInvoice } from '../invoice.model';

// ── Company profile (update these to match the real company) ─────────────────
const COMPANY = {
  name:    'TuniSales SARL',
  tagline: 'Plateforme de Gestion Commerciale',
  address: 'Avenue Habib Bourguiba, Immeuble Business Center',
  city:    '1001 Tunis, Tunisie',
  phone:   '+216 71 000 000',
  fax:     '+216 71 000 001',
  email:   'contact@tunisales.tn',
  web:     'www.tunisales.tn',
  mf:      '0000000/A/M/000',
  rc:      'B 123456 2020',
  rib:     'TN59 0780 1234 5678 9012 3456',
  bank:    'Banque de Tunisie (BT)',
  tva:     19,
};

@Injectable({ providedIn: 'root' })
export class InvoicePdfService {

  generate(invoice: IInvoice): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PAGE_W   = 210;
    const PAGE_H   = 297;
    const ML       = 14;   // margin left
    const MR       = 14;   // margin right
    const CW       = PAGE_W - ML - MR;  // content width = 182

    // ── Colour palette ────────────────────────────────────────────────
    type RGB = [number, number, number];
    const C: Record<string, RGB> = {
      primary:  [0,  102, 153],
      dark:     [15,  23,  42],
      muted:    [90, 105, 125],
      light:    [245, 248, 252],
      white:    [255, 255, 255],
      border:   [200, 210, 220],
      altRow:   [248, 250, 253],
      green:    [22,  163,  74],
      orange:   [217, 119,   6],
      red:      [185,  28,  28],
      accent:   [0,   82, 136],
    };

    // ── Helpers ───────────────────────────────────────────────────────
    const fmtNum = (v: number | null | undefined, dec = 3): string =>
      v != null ? v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '—';

    const fmtDate = (d: any): string => {
      if (!d) return '—';
      try { return d.format ? d.format('DD/MM/YYYY') : String(d).slice(0, 10); }
      catch { return '—'; }
    };

    const statusInfo = (s: string | null | undefined): { label: string; bg: RGB; text: RGB } => {
      const map: Record<string, { label: string; bg: RGB; text: RGB }> = {
        DRAFT:          { label: 'BROUILLON',            bg: [203,213,225], text: [51,65,85] },
        ISSUED:         { label: 'ÉMISE',                bg: [0,102,153],   text: [255,255,255] },
        PARTIALLY_PAID: { label: 'PARTIELLEMENT PAYÉE',  bg: [217,119,6],   text: [255,255,255] },
        PAID:           { label: 'PAYÉE',                bg: [22,163,74],   text: [255,255,255] },
        OVERDUE:        { label: 'EN RETARD',            bg: [185,28,28],   text: [255,255,255] },
        CANCELLED:      { label: 'ANNULÉE',              bg: [100,100,100], text: [255,255,255] },
      };
      return map[s ?? ''] ?? { label: '—', bg: C.muted, text: C.white };
    };

    // ── Number to French words ─────────────────────────────────────────
    const toWords = (n: number): string => {
      if (n == null || isNaN(n)) return '—';
      const units  = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf',
                      'dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
      const tens   = ['','','vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt'];
      const conv   = (x: number): string => {
        if (x === 0)  return '';
        if (x < 20)  return units[x];
        const t = Math.floor(x / 10), u = x % 10;
        if (t === 7 || t === 9) return tens[t] + (u === 0 ? '' : (t===7&&u===1?'-et':'-') + units[10 + u]);
        return tens[t] + (u === 1 && t !== 8 ? '-et-un' : u === 0 ? '' : '-' + units[u]);
      };
      const hundreds = (x: number): string => {
        if (x < 100) return conv(x);
        const h = Math.floor(x / 100), r = x % 100;
        return (h === 1 ? 'cent' : units[h] + '-cent') + (r ? '-' + conv(r) : (h > 1 ? 's' : ''));
      };
      const int = Math.floor(Math.abs(n));
      const dec = Math.round((Math.abs(n) - int) * 1000);
      let words = '';
      if (int === 0) { words = 'zéro'; }
      else {
        const mil = Math.floor(int / 1000), rem = int % 1000;
        if (mil > 0) words += (mil === 1 ? 'mille' : hundreds(mil) + '-mille') + (rem ? '-' : '');
        if (rem > 0) words += hundreds(rem);
      }
      const dinars = words.charAt(0).toUpperCase() + words.slice(1) + ' dinar' + (int > 1 ? 's' : '');
      const milStr = dec > 0 ? ' et ' + hundreds(dec) + ' millime' + (dec > 1 ? 's' : '') : '';
      return dinars + milStr;
    };

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 1 — HEADER
    // ─────────────────────────────────────────────────────────────────
    let y = 0;

    // Top colour band
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, PAGE_W, 4, 'F');

    // Company logo placeholder (square with initials)
    const logoX = ML, logoY = 8, logoSize = 22;
    doc.setFillColor(...C.primary);
    doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.white);
    doc.text('TS', logoX + logoSize / 2, logoY + 14.5, { align: 'center' });

    // Company name & details (left of logo)
    const compX = ML + logoSize + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...C.primary);
    doc.text(COMPANY.name, compX, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(COMPANY.tagline, compX, 22);
    doc.text(COMPANY.address, compX, 26.5);
    doc.text(COMPANY.city,    compX, 30.5);
    doc.text(`Tél : ${COMPANY.phone}  |  Fax : ${COMPANY.fax}`, compX, 34.5);
    doc.text(`Email : ${COMPANY.email}  |  ${COMPANY.web}`, compX, 38.5);

    // FACTURE title (right block)
    const rX = PAGE_W - MR;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...C.primary);
    doc.text('FACTURE', rX, 17, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    doc.text(`N°  ${invoice.invoiceNumber ?? invoice.id}`, rX, 24, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`Date d'émission : ${fmtDate(invoice.issueDate)}`, rX, 30, { align: 'right' });
    doc.text(`Date d'échéance : ${fmtDate(invoice.dueDate)}`,  rX, 35, { align: 'right' });

    // Status badge
    const si = statusInfo(invoice.status);
    const badgeW = 46, badgeH = 6.5;
    const badgeX = PAGE_W - MR - badgeW;
    doc.setFillColor(...si.bg);
    doc.roundedRect(badgeX, 39, badgeW, badgeH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...si.text);
    doc.text(si.label, badgeX + badgeW / 2, 39 + badgeH - 1.5, { align: 'center' });

    y = 52;

    // ── Full-width accent line ────────────────────────────────────────
    doc.setFillColor(...C.primary);
    doc.rect(ML, y, CW, 1.2, 'F');
    y += 5;

    // ── Fiscal info strip ─────────────────────────────────────────────
    doc.setFillColor(...C.light);
    doc.rect(ML, y, CW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`MF : ${COMPANY.mf}`, ML + 3, y + 4.5);
    doc.text(`RC : ${COMPANY.rc}`, ML + 50, y + 4.5);
    doc.text(`RIB : ${COMPANY.rib}  —  ${COMPANY.bank}`, ML + 95, y + 4.5);
    y += 11;

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 2 — PARTIES (Fournisseur / Client)
    // ─────────────────────────────────────────────────────────────────
    const colW = CW / 2 - 3;

    // Fournisseur box
    doc.setFillColor(...C.primary);
    doc.rect(ML, y, colW, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text('FOURNISSEUR', ML + 4, y + 4);

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.rect(ML, y + 6, colW, 24, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    doc.text(COMPANY.name, ML + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(COMPANY.address, ML + 4, y + 17);
    doc.text(COMPANY.city,    ML + 4, y + 21.5);
    doc.text(`Tél : ${COMPANY.phone}`, ML + 4, y + 26);

    // Client box
    const clientX = ML + colW + 6;
    doc.setFillColor(0, 122, 80);
    doc.rect(clientX, y, colW, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text('CLIENT', clientX + 4, y + 4);

    doc.setDrawColor(...C.border);
    doc.rect(clientX, y + 6, colW, 24, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    doc.text(invoice.client?.name ?? '—', clientX + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    if (invoice.order?.orderNumber) {
      doc.text(`Réf. commande : ${invoice.order.orderNumber}`, clientX + 4, y + 17);
    }
    doc.text(`ID client : ${invoice.client?.id ?? '—'}`, clientX + 4, y + 21.5);

    y += 36;

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 3 — ITEMS TABLE
    // ─────────────────────────────────────────────────────────────────
    y += 4;

    // Column layout
    const cols = {
      num:   { x: ML,        w: 10 },
      desc:  { x: ML + 10,   w: 72 },
      qty:   { x: ML + 82,   w: 14 },
      pu:    { x: ML + 96,   w: 30 },
      tva:   { x: ML + 126,  w: 16 },
      total: { x: ML + 142,  w: CW - 142 + ML - ML },
    };
    // total.w = ML + 142 + total.w = PAGE_W - MR  → total.w = PAGE_W - MR - ML - 142 = 182 - 142 = 40
    cols.total.w = 40;

    const ROW_H = 8;
    const HEAD_H = 8;

    // Table header
    doc.setFillColor(...C.dark);
    doc.rect(ML, y, CW, HEAD_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text('N°',          cols.num.x   + cols.num.w   / 2, y + 5.2, { align: 'center' });
    doc.text('DÉSIGNATION', cols.desc.x  + 2,                y + 5.2);
    doc.text('QTÉ',         cols.qty.x   + cols.qty.w   / 2, y + 5.2, { align: 'center' });
    doc.text('P.U. HT',     cols.pu.x    + cols.pu.w    - 2, y + 5.2, { align: 'right' });
    doc.text('TVA',         cols.tva.x   + cols.tva.w   / 2, y + 5.2, { align: 'center' });
    doc.text('TOTAL HT',    cols.total.x + cols.total.w - 2, y + 5.2, { align: 'right' });
    y += HEAD_H;

    // Single line item (the invoice total breakdown represented as one service line)
    const htVal  = invoice.amountHt  ?? 0;
    const rows = [
      { num: 1, desc: 'Prestation de services / Fournitures', qty: 1, pu: htVal, tva: COMPANY.tva, total: htVal },
    ];

    rows.forEach((row, i) => {
      doc.setFillColor(...(i % 2 === 0 ? C.white : C.altRow));
      doc.rect(ML, y, CW, ROW_H, 'F');

      // vertical col separators
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      [cols.desc.x, cols.qty.x, cols.pu.x, cols.tva.x, cols.total.x].forEach(cx => {
        doc.line(cx, y, cx, y + ROW_H);
      });
      // row bottom border
      doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(String(row.num),            cols.num.x   + cols.num.w   / 2, y + 5.3, { align: 'center' });
      doc.text(row.desc,                   cols.desc.x  + 2,                y + 5.3);
      doc.text(String(row.qty),            cols.qty.x   + cols.qty.w   / 2, y + 5.3, { align: 'center' });
      doc.text(fmtNum(row.pu),             cols.pu.x    + cols.pu.w    - 2, y + 5.3, { align: 'right' });
      doc.text(`${row.tva}%`,              cols.tva.x   + cols.tva.w   / 2, y + 5.3, { align: 'center' });
      doc.text(fmtNum(row.total),          cols.total.x + cols.total.w - 2, y + 5.3, { align: 'right' });
      y += ROW_H;
    });

    // outer border around table
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.rect(ML, y - HEAD_H - rows.length * ROW_H, CW, HEAD_H + rows.length * ROW_H, 'S');
    y += 6;

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 4 — TOTALS + CACHET
    // ─────────────────────────────────────────────────────────────────
    const totalsX = ML + 90;
    const totalsW = CW - 90;
    const totY0   = y;

    // Totals box
    const drawTotalRow = (label: string, value: string, bold = false, highlight = false): void => {
      const rh = 8;
      if (highlight) {
        doc.setFillColor(...C.primary);
        doc.rect(totalsX, y, totalsW, rh, 'F');
      }
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 9.5 : 8.5);
      doc.setTextColor(highlight ? 255 : (C.dark[0]), highlight ? 255 : C.dark[1], highlight ? 255 : C.dark[2]);
      doc.text(label, totalsX + 3, y + 5.3);
      doc.text(value, totalsX + totalsW - 3, y + 5.3, { align: 'right' });
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(totalsX, y + rh, totalsX + totalsW, y + rh);
      y += rh;
    };

    drawTotalRow('Montant HT (TND)',  fmtNum(invoice.amountHt));
    drawTotalRow(`TVA ${COMPANY.tva}% (TND)`, fmtNum(invoice.taxAmount));
    drawTotalRow('Timbre fiscal',      '1,000');
    drawTotalRow('TOTAL TTC (TND)',   fmtNum((invoice.amountTtc ?? 0) + 1), true, true);

    // outer border for totals
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.rect(totalsX, totY0, totalsW, y - totY0, 'S');

    // ── Cachet & Signature (left of totals) ───────────────────────────
    const stampX = ML, stampY = totY0, stampW = 82, stampH = y - totY0;
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.6);
    doc.setLineDash([2, 2]);
    doc.rect(stampX, stampY, stampW, stampH, 'S');
    doc.setLineDash([]);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text('CACHET & SIGNATURE', stampX + stampW / 2, stampY + 7, { align: 'center' });

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    // circle for stamp
    const cx = stampX + stampW / 2, cy = stampY + stampH / 2 + 3, cr = 14;
    doc.circle(cx, cy, cr, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(COMPANY.name, cx, cy - 3, { align: 'center', maxWidth: cr * 2 - 2 });
    doc.setFontSize(6);
    doc.text('Cachet officiel', cx, cy + 1.5, { align: 'center' });
    doc.text(COMPANY.mf, cx, cy + 6, { align: 'center' });

    y += 8;

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 5 — PAYMENT NOTE / ARRÊTÉE
    // ─────────────────────────────────────────────────────────────────
    if (invoice.status === 'PAID' && invoice.paidAt) {
      doc.setFillColor(...C.green);
      doc.roundedRect(ML, y, CW, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.white);
      doc.text(`✓  Facture acquittée le ${fmtDate(invoice.paidAt)} — Règlement reçu intégralement.`,
        PAGE_W / 2, y + 5.2, { align: 'center' });
      y += 12;
    }

    // Montant en lettres
    y += 2;
    const ttcFull = (invoice.amountTtc ?? 0) + 1;
    doc.setFillColor(...C.light);
    doc.rect(ML, y, CW, 9, 'F');
    doc.setDrawColor(...C.border);
    doc.rect(ML, y, CW, 9, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text('Arrêtée la présente facture à la somme de :', ML + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.dark);
    doc.text(toWords(ttcFull), ML + 80, y + 5);
    y += 13;

    // ── Conditions de paiement ────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text('Conditions de paiement :', ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dark);
    doc.text('Règlement par virement bancaire dans un délai de 30 jours à compter de la date de facturation.', ML + 40, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(`RIB : ${COMPANY.rib}  —  ${COMPANY.bank}`, ML, y);

    // ─────────────────────────────────────────────────────────────────
    //  FOOTER
    // ─────────────────────────────────────────────────────────────────
    const FY = PAGE_H - 12;
    doc.setFillColor(...C.dark);
    doc.rect(0, FY, PAGE_W, 12, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 195, 210);
    const footLine1 = `${COMPANY.name}  |  RC : ${COMPANY.rc}  |  MF : ${COMPANY.mf}`;
    const footLine2 = `${COMPANY.address}, ${COMPANY.city}  |  ${COMPANY.phone}  |  ${COMPANY.email}`;
    doc.text(footLine1, PAGE_W / 2, FY + 4, { align: 'center' });
    doc.text(footLine2, PAGE_W / 2, FY + 8.5, { align: 'center' });

    // page number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.primary);
    doc.text('1 / 1', PAGE_W - MR, FY + 6, { align: 'right' });

    // Top accent band repeated at bottom
    doc.setFillColor(...C.primary);
    doc.rect(0, PAGE_H - 2, PAGE_W, 2, 'F');

    // ── Save ──────────────────────────────────────────────────────────
    const filename = `facture-${invoice.invoiceNumber ?? invoice.id}.pdf`;
    doc.save(filename);
  }
}
