import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { ClaimType } from '../claim.model';
import { ClaimService } from '../service/claim.service';

@Component({
  selector: 'jhi-claim-update',
  templateUrl: './claim-update.component.html',
})
export class ClaimUpdateComponent {
  isSaving = false;
  ClaimType = ClaimType;
  claimTypeValues = Object.keys(ClaimType);

  editForm = new FormGroup({
    type: new FormControl<ClaimType | null>(null, { validators: [Validators.required] }),
    subject: new FormControl<string | null>(null, { validators: [Validators.required, Validators.maxLength(200)] }),
    description: new FormControl<string | null>(null, { validators: [Validators.maxLength(1000)] }),
  });

  constructor(protected claimService: ClaimService, protected router: Router) {}

  previousState(): void {
    this.router.navigate(['/claim']);
  }

  save(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const value = this.editForm.getRawValue();
    this.claimService
      .create({
        id: null,
        type: value.type,
        subject: value.subject,
        description: value.description,
      })
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: HttpResponse<any>) => {
          if (res.ok) {
            this.previousState();
          }
        },
      });
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      RECLAMATION: 'Réclamation',
      RECUPERATION: 'Demande de récupération',
    };
    return map[type] || type;
  }
}
