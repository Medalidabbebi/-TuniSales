import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { IOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { IInvoice } from 'app/entities/BusinessService/invoice/invoice.model';
import { SKIP_ERROR_HANDLER } from 'app/core/interceptor/error-handler.interceptor';

/** Replace with your Anthropic API key, or set via localStorage key "anthropic_api_key" */
const DEFAULT_API_KEY = '';

const STATUS_FR: Record<string, string> = {
  DRAFT: 'brouillon', PENDING: 'en attente', SUBMITTED: 'soumise',
  UNDER_REVIEW: 'en cours de révision', APPROVED: 'approuvée', ACCEPTED: 'acceptée',
  IN_PREPARATION: 'en préparation', NEGOTIATED: 'négociée', CONFIRMED: 'confirmée',
  SHIPPED: 'expédiée', DELIVERED: 'livrée', INVOICED: 'facturée',
  PAID: 'payée', REFUSED: 'refusée', REJECTED: 'rejetée',
  CANCELLED: 'annulée', RETURNED: 'retournée',
};

@Injectable({ providedIn: 'root' })
export class AiSummaryService {
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(private http: HttpClient) {}

  // ─── Existing method ──────────────────────────────────────────────────────

  generateOrderSummary(order: IOrder, lines: IOrderLine[]): Observable<string> {
    const apiKey = localStorage.getItem('anthropic_api_key') || DEFAULT_API_KEY;
    if (!apiKey) {
      return of(this.localSummary(order, lines));
    }

    const prompt = this.buildPrompt(order, lines);
    const context = new HttpContext().set(SKIP_ERROR_HANDLER, true);

    return this.http.post<any>(
      this.apiUrl,
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        context,
      }
    ).pipe(
      map((res: any) => (res?.content?.[0]?.text as string) ?? this.localSummary(order, lines)),
      catchError(() => of(this.localSummary(order, lines)))
    );
  }

  // ─── New: Client Summary ──────────────────────────────────────────────────

  generateClientSummary(client: IClient, orders: IOrder[], invoices: IInvoice[]): Observable<string> {
    const apiKey = localStorage.getItem('anthropic_api_key') || DEFAULT_API_KEY;
    const fallback = this.localClientSummary(client, orders, invoices);
    if (!apiKey) {
      return of(fallback);
    }

    const totalCA = invoices.reduce((sum, inv) => sum + (inv.amountTtc ?? 0), 0);
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

    const prompt = `Tu es un assistant commercial tunisien. Génère un bref paragraphe professionnel (2-4 phrases, uniquement en français) résumant le profil de ce client commercial. Sois précis et professionnel.

Données du client :
- Nom : ${client.name ?? '—'}
- Type : ${client.clientType ?? '—'}
- Statut : ${client.status ?? '—'}
- Limite de crédit : ${(client.creditLimit ?? 0).toFixed(2)} TND
- Crédit utilisé : ${(client.creditUsed ?? 0).toFixed(2)} TND
- Conditions de paiement : ${client.paymentTermsDays ?? '—'} jours
- Nombre de commandes : ${orders.length}
- Nombre de factures : ${invoices.length}
- Chiffre d'affaires total (TTC) : ${totalCA.toFixed(2)} TND
- Factures en retard : ${overdueCount}

Génère uniquement le paragraphe, sans titre, sans liste, sans mise en forme.`;

    const context = new HttpContext().set(SKIP_ERROR_HANDLER, true);

    return this.http.post<any>(
      this.apiUrl,
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 280,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        context,
      }
    ).pipe(
      map((res: any) => (res?.content?.[0]?.text as string) ?? fallback),
      catchError(() => of(fallback))
    );
  }

  // ─── New: Email Generator ─────────────────────────────────────────────────

  generateEmail(type: 'order_confirm' | 'order_reminder' | 'invoice_reminder' | 'invoice_overdue', data: any): Observable<string> {
    const apiKey = localStorage.getItem('anthropic_api_key') || DEFAULT_API_KEY;
    const fallback = this.localEmailFallback(type, data);
    if (!apiKey) {
      return of(fallback);
    }

    const typeLabels: Record<string, string> = {
      order_confirm: 'confirmation de commande',
      order_reminder: 'relance de commande en attente',
      invoice_reminder: 'relance de facture impayée',
      invoice_overdue: 'avertissement de facture en retard',
    };

    const prompt = `Tu es un assistant commercial pour une entreprise tunisienne (TuniSalesGateway). Génère un email professionnel en français de type "${typeLabels[type] ?? type}".

Données contextuelles :
${Object.entries(data).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Format attendu :
Objet : [ligne d'objet]

[Corps de l'email complet, avec formule de politesse, contenu professionnel, et signature "Équipe TuniSalesGateway"]

Génère uniquement l'email complet (objet + corps), sans commentaires supplémentaires.`;

    const context = new HttpContext().set(SKIP_ERROR_HANDLER, true);

    return this.http.post<any>(
      this.apiUrl,
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        context,
      }
    ).pipe(
      map((res: any) => (res?.content?.[0]?.text as string) ?? fallback),
      catchError(() => of(fallback))
    );
  }

  // ─── New: Chat ────────────────────────────────────────────────────────────

  chat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: string): Observable<string> {
    const apiKey = localStorage.getItem('anthropic_api_key') || DEFAULT_API_KEY;
    if (!apiKey) {
      return of('Service IA non disponible.');
    }

    const httpContext = new HttpContext().set(SKIP_ERROR_HANDLER, true);

    return this.http.post<any>(
      this.apiUrl,
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `Tu es un assistant commercial pour TuniSalesGateway. Réponds en français.\n\nContexte : ${context}`,
        messages,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        context: httpContext,
      }
    ).pipe(
      map((res: any) => (res?.content?.[0]?.text as string) ?? 'Service IA non disponible.'),
      catchError(() => of('Service IA non disponible.'))
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private buildPrompt(order: IOrder, lines: IOrderLine[]): string {
    const totalHt  = (order.subtotal ?? 0) - (order.discountAmount ?? 0);
    const created  = order.createdAt  ? dayjs(order.createdAt).format('DD/MM/YYYY')  : '—';
    const submitted = order.submittedAt ? dayjs(order.submittedAt).format('DD/MM/YYYY') : null;
    const validated = order.validatedAt ? dayjs(order.validatedAt).format('DD/MM/YYYY') : null;

    return `Tu es un assistant commercial tunisien. Génère un bref paragraphe professionnel (2-3 phrases, uniquement en français) résumant l'historique de cette commande commerciale. Sois précis et professionnel, mentionne les dates clés et les montants.

Données de la commande :
- Numéro : ${order.orderNumber ?? '#' + order.id}
- Client : ${order.client?.name ?? 'Inconnu'}
- Statut actuel : ${STATUS_FR[order.status ?? ''] ?? order.status}
- Montant HT : ${totalHt.toFixed(2)} TND
- TVA : ${(order.taxAmount ?? 0).toFixed(2)} TND
- Total TTC : ${(order.totalAmount ?? 0).toFixed(2)} TND
- Nombre de produits : ${lines.length}
- Date de création : ${created}${submitted ? '\n- Date de soumission : ' + submitted : ''}${validated ? '\n- Date de validation : ' + validated : ''}

Génère uniquement le paragraphe, sans titre, sans liste, sans mise en forme.`;
  }

  /** Local fallback — generates a professional paragraph without API */
  private localSummary(order: IOrder, lines: IOrderLine[]): string {
    const client    = order.client?.name ?? 'le client';
    const ref       = order.orderNumber  ?? '#' + order.id;
    const statusFr  = STATUS_FR[order.status ?? ''] ?? order.status ?? 'en cours';
    const total     = (order.totalAmount ?? 0).toFixed(2);
    const created   = order.createdAt   ? dayjs(order.createdAt).format('DD/MM/YYYY')   : null;
    const submitted = order.submittedAt ? dayjs(order.submittedAt).format('DD/MM/YYYY') : null;
    const validated = order.validatedAt ? dayjs(order.validatedAt).format('DD/MM/YYYY') : null;

    let text = `La commande ${ref} de ${client}, portant sur ${lines.length} ligne(s) de produits pour un montant total de ${total} TND TTC, est actuellement ${statusFr}.`;

    if (created) {
      text += ` Elle a été créée le ${created}`;
      if (submitted) text += `, soumise le ${submitted}`;
      if (validated) text += ` et validée le ${validated}`;
      text += '.';
    }

    if (order.status === 'DELIVERED' || order.status === 'INVOICED' || order.status === 'PAID') {
      text += ` La commande a suivi l'ensemble du processus commercial avec succès.`;
    } else if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      text += ` Cette commande n'a pas pu aboutir et a été clôturée.`;
    } else {
      text += ` Le traitement de cette commande est en cours.`;
    }

    return text;
  }

  private localClientSummary(client: IClient, orders: IOrder[], invoices: IInvoice[]): string {
    const name = client.name ?? 'Ce client';
    const totalCA = invoices.reduce((sum, inv) => sum + (inv.amountTtc ?? 0), 0);
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
    const creditRatio = client.creditLimit ? ((client.creditUsed ?? 0) / client.creditLimit) * 100 : 0;

    let text = `${name} est un client de type ${client.clientType ?? '—'} avec un statut ${client.status ?? '—'}.`;
    text += ` Il totalise ${orders.length} commande(s) et ${invoices.length} facture(s) pour un chiffre d'affaires de ${totalCA.toFixed(2)} TND TTC.`;

    if (client.creditLimit) {
      text += ` Sa limite de crédit est de ${client.creditLimit.toFixed(2)} TND, utilisée à ${creditRatio.toFixed(0)}%.`;
    }

    if (overdueCount > 0) {
      text += ` Attention : ${overdueCount} facture(s) en retard de paiement.`;
    }

    return text;
  }

  private localEmailFallback(type: string, data: any): string {
    const clientName = data.clientName ?? 'Client';
    const templates: Record<string, string> = {
      order_confirm: `Objet : Confirmation de votre commande

Madame, Monsieur ${clientName},

Nous avons le plaisir de vous confirmer la bonne réception et le traitement de votre commande.

Nous restons à votre disposition pour tout renseignement complémentaire.

Cordialement,
Équipe TuniSalesGateway`,
      order_reminder: `Objet : Relance — Commande en attente de validation

Madame, Monsieur ${clientName},

Nous vous contactons au sujet de votre commande actuellement en attente de traitement.

Nous vous remercions de bien vouloir prendre les dispositions nécessaires pour finaliser cette commande.

Cordialement,
Équipe TuniSalesGateway`,
      invoice_reminder: `Objet : Rappel de paiement — Facture(s) impayée(s)

Madame, Monsieur ${clientName},

Sauf erreur de notre part, nous n'avons pas encore reçu le règlement de votre (vos) facture(s) en attente.

Nous vous remercions de bien vouloir effectuer le virement correspondant dans les meilleurs délais.

Cordialement,
Équipe TuniSalesGateway`,
      invoice_overdue: `Objet : URGENT — Facture(s) en retard de paiement

Madame, Monsieur ${clientName},

Nous vous informons que ${data.overdueCount ?? 'plusieurs'} facture(s) arrivent ou sont arrivées à échéance sans règlement de votre part.

Nous vous prions de régulariser cette situation dans les plus brefs délais afin d'éviter toute suspension de compte.

Cordialement,
Équipe TuniSalesGateway`,
    };

    return templates[type] ?? `Objet : Message TuniSalesGateway\n\nMadame, Monsieur ${clientName},\n\nVeuillez trouver ci-joint notre message.\n\nCordialement,\nÉquipe TuniSalesGateway`;
  }
}
