import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClientFormService, ClientFormGroup } from './client-form.service';
import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { ClientType } from 'app/entities/enumerations/client-type.model';
import { ClientStatus } from 'app/entities/enumerations/client-status.model';
import { TenantService } from 'app/entities/PlatformService/tenant/service/tenant.service';
import { ITenant } from 'app/entities/PlatformService/tenant/tenant.model';

@Component({
  selector: 'jhi-client-update',
  templateUrl: './client-update.component.html',
  styleUrls: ['./client-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClientUpdateComponent implements OnInit {
  isSaving = false;
  client: IClient | null = null;
  clientTypeValues = Object.keys(ClientType);
  clientStatusValues = Object.keys(ClientStatus);
  tenants: ITenant[] = [];

  editForm: ClientFormGroup = this.clientFormService.createClientFormGroup();

  constructor(
    protected clientService: ClientService,
    protected clientFormService: ClientFormService,
    protected activatedRoute: ActivatedRoute,
    protected tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.tenantService.query({ size: 200 }).subscribe(res => {
      this.tenants = res.body ?? [];
    });

    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
      if (client) {
        this.updateForm(client);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const client = this.clientFormService.getClient(this.editForm);
    if (client.id !== null) {
      this.subscribeToSaveResponse(this.clientService.update(client));
    } else {
      this.subscribeToSaveResponse(this.clientService.create(client));
    }
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      ACTIVE:     'cu-status-badge--active',
      INACTIVE:   'cu-status-badge--inactive',
      SUSPENDED:  'cu-status-badge--suspended',
      CHURN_RISK: 'cu-status-badge--churn-risk',
    };
    return map[status || ''] || 'cu-status-badge--inactive';
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

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClient>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(client: IClient): void {
    this.client = client;
    this.clientFormService.resetForm(this.editForm, client);
  }
}
