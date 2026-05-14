import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AuditLogComponent } from './list/audit-log.component';
import { AuditLogDetailComponent } from './detail/audit-log-detail.component';
import { AuditLogUpdateComponent } from './update/audit-log-update.component';
import { AuditLogDeleteDialogComponent } from './delete/audit-log-delete-dialog.component';
import { AuditLogRoutingModule } from './route/audit-log-routing.module';

@NgModule({
  imports: [SharedModule, AuditLogRoutingModule],
  declarations: [AuditLogComponent, AuditLogDetailComponent, AuditLogUpdateComponent, AuditLogDeleteDialogComponent],
})
export class PlatformServiceAuditLogModule {}
