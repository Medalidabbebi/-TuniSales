import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuditLogFormService, AuditLogFormGroup } from './audit-log-form.service';
import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { AuditAction } from 'app/entities/enumerations/audit-action.model';

@Component({
  selector: 'jhi-audit-log-update',
  templateUrl: './audit-log-update.component.html',
})
export class AuditLogUpdateComponent implements OnInit {
  isSaving = false;
  auditLog: IAuditLog | null = null;
  auditActionValues = Object.keys(AuditAction);

  editForm: AuditLogFormGroup = this.auditLogFormService.createAuditLogFormGroup();

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected auditLogService: AuditLogService,
    protected auditLogFormService: AuditLogFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ auditLog }) => {
      this.auditLog = auditLog;
      if (auditLog) {
        this.updateForm(auditLog);
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('tuniSalesGatewayApp.error', { ...err, key: 'error.file.' + err.key })
        ),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const auditLog = this.auditLogFormService.getAuditLog(this.editForm);
    if (auditLog.id !== null) {
      this.subscribeToSaveResponse(this.auditLogService.update(auditLog));
    } else {
      this.subscribeToSaveResponse(this.auditLogService.create(auditLog));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAuditLog>>): void {
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

  protected updateForm(auditLog: IAuditLog): void {
    this.auditLog = auditLog;
    this.auditLogFormService.resetForm(this.editForm, auditLog);
  }
}
