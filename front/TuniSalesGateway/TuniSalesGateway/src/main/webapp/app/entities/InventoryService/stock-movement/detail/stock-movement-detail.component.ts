import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStockMovement } from '../stock-movement.model';

@Component({
  selector: 'jhi-stock-movement-detail',
  templateUrl: './stock-movement-detail.component.html',
  styleUrls: ['./stock-movement-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockMovementDetailComponent implements OnInit {
  stockMovement: IStockMovement | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockMovement }) => {
      this.stockMovement = stockMovement;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getTypeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      INBOUND:              'Entrée',
      OUTBOUND:             'Sortie',
      TRANSFER:             'Transfert',
      RETURN:               'Retour',
      SWAP_OUT:             'Échange sortant',
      SWAP_IN:              'Échange entrant',
      INVENTORY_ADJUSTMENT: 'Ajustement inventaire',
    };
    return type ? (map[type] || type) : '—';
  }

  getTypeClass(type: string | null | undefined): string {
    const map: Record<string, string> = {
      INBOUND:              'smd-type--green',
      OUTBOUND:             'smd-type--red',
      TRANSFER:             'smd-type--blue',
      RETURN:               'smd-type--navy',
      SWAP_OUT:             'smd-type--purple',
      SWAP_IN:              'smd-type--teal',
      INVENTORY_ADJUSTMENT: 'smd-type--orange',
    };
    return type ? (map[type] || 'smd-type--gray') : 'smd-type--gray';
  }

  getTypeIcon(type: string | null | undefined): any {
    const map: Record<string, string> = {
      INBOUND:              'sign-in-alt',
      OUTBOUND:             'sign-out-alt',
      TRANSFER:             'exchange-alt',
      RETURN:               'undo',
      SWAP_OUT:             'minus-circle',
      SWAP_IN:              'plus-circle',
      INVENTORY_ADJUSTMENT: 'sliders-h',
    };
    return type ? (map[type] || 'exchange-alt') : 'exchange-alt';
  }
}
