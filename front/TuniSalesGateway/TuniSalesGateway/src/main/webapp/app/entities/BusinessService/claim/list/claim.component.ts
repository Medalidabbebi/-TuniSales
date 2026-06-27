import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { ITEMS_PER_PAGE, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC } from 'app/config/navigation.constants';
import { AccountService } from 'app/core/auth/account.service';
import { Authority } from 'app/config/authority.constants';
import { IClaim, ClaimStatus } from '../claim.model';
import { ClaimService } from '../service/claim.service';

@Component({
  selector: 'jhi-claim',
  templateUrl: './claim.component.html',
})
export class ClaimComponent implements OnInit {
  claims: IClaim[] = [];
  isLoading = false;
  predicate = 'id';
  ascending = true;
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  ClaimStatus = ClaimStatus;
  canResolve = false;
  canCreate = false;

  constructor(
    protected claimService: ClaimService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.canResolve = this.accountService.hasAnyAuthority([Authority.ADMIN, Authority.ADMIN_COMMERCIAL, Authority.ADMIN_SYSTEME]);
    this.canCreate = this.accountService.hasAnyAuthority([
      Authority.ADMIN,
      Authority.RESPONSABLE_PV,
      Authority.ADMIN_COMMERCIAL,
      Authority.ADMIN_SYSTEME,
    ]);
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.claimService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: [this.predicate + ',' + (this.ascending ? ASC : DESC)],
      })
      .subscribe({
        next: (res: HttpResponse<IClaim[]>) => {
          this.isLoading = false;
          this.claims = res.body ?? [];
          this.totalItems = Number(res.headers.get(TOTAL_COUNT_RESPONSE_HEADER));
        },
        error: () => (this.isLoading = false),
      });
  }

  resolve(claim: IClaim, status: ClaimStatus): void {
    this.claimService.partialUpdate({ id: claim.id, status }).subscribe(() => this.load());
  }

  statusLabel(status: ClaimStatus | null | undefined): string {
    const map: Record<string, string> = {
      OPEN: 'Ouverte',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolue',
      REJECTED: 'Rejetée',
    };
    return map[status ?? ''] || 'Inconnu';
  }

  typeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      RECLAMATION: 'Réclamation',
      RECUPERATION: 'Demande de récupération',
    };
    return map[type ?? ''] || 'Inconnu';
  }
}
