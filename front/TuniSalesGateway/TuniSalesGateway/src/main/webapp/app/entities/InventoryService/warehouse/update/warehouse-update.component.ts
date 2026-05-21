import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as L from 'leaflet';

import dayjs from 'dayjs/esm';
import { WarehouseFormService, WarehouseFormGroup } from './warehouse-form.service';
import { IWarehouse } from '../warehouse.model';
import { WarehouseService } from '../service/warehouse.service';
import { WarehouseType } from 'app/entities/enumerations/warehouse-type.model';

@Component({
  selector: 'jhi-warehouse-update',
  templateUrl: './warehouse-update.component.html',
  styleUrls: ['./warehouse-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseUpdateComponent implements OnInit, AfterViewInit, OnDestroy {
  isSaving = false;
  warehouse: IWarehouse | null = null;
  warehouseTypeValues = Object.keys(WarehouseType);

  editForm: WarehouseFormGroup = this.warehouseFormService.createWarehouseFormGroup();

  // Map picker
  mapSearchQuery = '';
  mapAddress: string | null = null;
  mapCity: string | null = null;
  isGeocoding = false;
  private _map: L.Map | null = null;
  private _marker: L.Marker | null = null;

  constructor(
    protected warehouseService: WarehouseService,
    protected warehouseFormService: WarehouseFormService,
    protected activatedRoute: ActivatedRoute,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ warehouse }) => {
      this.warehouse = warehouse;
      if (warehouse) {
        this.updateForm(warehouse);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy(): void {
    this._map?.remove();
    this._map = null;
  }

  private initMap(): void {
    const el = document.getElementById('wu-leaflet-map');
    if (!el || this._map) return;

    // Fix default marker icon paths for Angular builds
    const iconDefault = L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this._map = L.map(el, { zoomControl: true }).setView([33.8869, 9.5375], 6); // Tunisia center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this._map);

    // If editing and address already set, try to center
    const city = this.editForm.get('city')?.value;
    if (city) {
      this.mapSearchQuery = city;
      this.searchAddress();
    }

    this._map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng.lat, e.latlng.lng, iconDefault);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  private placeMarker(lat: number, lng: number, icon?: L.Icon): void {
    if (!this._map) return;
    if (this._marker) this._marker.remove();
    this._marker = L.marker([lat, lng], { icon: icon ?? L.icon({
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    })}).addTo(this._map);
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`;
    this.http.get<any>(url).subscribe({
      next: res => {
        const addr = res.address ?? {};
        this.mapAddress = res.display_name ?? null;
        this.mapCity = addr.city ?? addr.town ?? addr.village ?? addr.county ?? null;
      },
      error: () => { this.mapAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`; },
    });
  }

  searchAddress(): void {
    const q = this.mapSearchQuery.trim();
    if (!q) return;
    this.isGeocoding = true;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1&accept-language=fr`;
    this.http.get<any[]>(url).subscribe({
      next: results => {
        this.isGeocoding = false;
        if (!results?.length || !this._map) return;
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        this._map.setView([lat, lng], 14);
        this.placeMarker(lat, lng);
        this.reverseGeocode(lat, lng);
      },
      error: () => { this.isGeocoding = false; },
    });
  }

  applyMapLocation(): void {
    if (this.mapAddress) {
      this.editForm.patchValue({ address: this.mapAddress });
    }
    if (this.mapCity) {
      this.editForm.patchValue({ city: this.mapCity });
    }
    this.mapAddress = null;
    this.mapCity = null;
  }

  get isNew(): boolean {
    return this.editForm.controls.id.value === null;
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const warehouse = this.warehouseFormService.getWarehouse(this.editForm);
    const now = dayjs();
    if (warehouse.id !== null) {
      (warehouse as any).updatedAt = now;
      this.subscribeToSaveResponse(this.warehouseService.update(warehouse));
    } else {
      (warehouse as any).createdAt = now;
      (warehouse as any).updatedAt = now;
      (warehouse as any).tenantId  = (warehouse as any).tenantId ?? 1;
      this.subscribeToSaveResponse(this.warehouseService.create(warehouse));
    }
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      LOCAL:     'Local',
      SITE:      'Site',
      SWAP:      'Échange',
      DEFECTIVE: 'Défectueux',
      MISSING:   'Manquant',
    };
    return map[type] || type;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWarehouse>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // error displayed via jhi-alert-error
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(warehouse: IWarehouse): void {
    this.warehouse = warehouse;
    this.warehouseFormService.resetForm(this.editForm, warehouse);
  }
}
