import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWarehouse } from '../warehouse.model';

@Component({
  selector: 'jhi-warehouse-detail',
  templateUrl: './warehouse-detail.component.html',
  styleUrls: ['./warehouse-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseDetailComponent implements OnInit {
  warehouse: IWarehouse | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ warehouse }) => {
      this.warehouse = warehouse;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getTypeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      LOCAL:     'Local',
      SITE:      'Site',
      SWAP:      'Échange',
      DEFECTIVE: 'Défectueux',
      MISSING:   'Manquant',
    };
    return map[type ?? ''] || (type ?? '—');
  }

  getTypeClass(type: string | null | undefined): string {
    const map: Record<string, string> = {
      LOCAL:     'wd-type--local',
      SITE:      'wd-type--site',
      SWAP:      'wd-type--swap',
      DEFECTIVE: 'wd-type--defective',
      MISSING:   'wd-type--missing',
    };
    return map[type ?? ''] || '';
  }
}
