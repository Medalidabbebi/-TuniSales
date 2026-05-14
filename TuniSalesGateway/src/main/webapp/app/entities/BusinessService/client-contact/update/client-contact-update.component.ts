import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ClientContactFormService, ClientContactFormGroup } from './client-contact-form.service';
import { IClientContact } from '../client-contact.model';
import { ClientContactService } from '../service/client-contact.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { ContactRole } from 'app/entities/enumerations/contact-role.model';

@Component({
  selector: 'jhi-client-contact-update',
  templateUrl: './client-contact-update.component.html',
})
export class ClientContactUpdateComponent implements OnInit {
  isSaving = false;
  clientContact: IClientContact | null = null;
  contactRoleValues = Object.keys(ContactRole);

  clientsSharedCollection: IClient[] = [];

  editForm: ClientContactFormGroup = this.clientContactFormService.createClientContactFormGroup();

  constructor(
    protected clientContactService: ClientContactService,
    protected clientContactFormService: ClientContactFormService,
    protected clientService: ClientService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ clientContact }) => {
      this.clientContact = clientContact;
      if (clientContact) {
        this.updateForm(clientContact);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const clientContact = this.clientContactFormService.getClientContact(this.editForm);
    if (clientContact.id !== null) {
      this.subscribeToSaveResponse(this.clientContactService.update(clientContact));
    } else {
      this.subscribeToSaveResponse(this.clientContactService.create(clientContact));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClientContact>>): void {
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

  protected updateForm(clientContact: IClientContact): void {
    this.clientContact = clientContact;
    this.clientContactFormService.resetForm(this.editForm, clientContact);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(
      this.clientsSharedCollection,
      clientContact.client
    );
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.clientContact?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));
  }
}
