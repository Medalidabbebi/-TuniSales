import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { ASC, DESC, SORT } from 'app/config/navigation.constants';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';
import { UserManagementDeleteDialogComponent } from '../delete/user-management-delete-dialog.component';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  currentAccount: Account | null = null;
  users: User[] | null = null;
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;

  constructor(
    private userService: UserManagementService,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => (this.currentAccount = account));
    this.handleNavigation();
  }

  setActive(user: User, isActivated: boolean): void {
    this.userService.update({ ...user, activated: isActivated }).subscribe(() => this.loadAll());
  }

  trackIdentity(_index: number, item: User): number {
    return item.id!;
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.isLoading = true;
    this.userService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe({
        next: (res: HttpResponse<User[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers);
        },
        error: () => (this.isLoading = false),
      });
  }

  transition(): void {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: `${this.predicate},${this.ascending ? ASC : DESC}`,
      },
    });
  }

  countActive(): number {
    return this.users?.filter(u => u.activated).length ?? 0;
  }

  countInactive(): number {
    return this.users?.filter(u => !u.activated).length ?? 0;
  }

  countDistinctRoles(): number {
    const roles = new Set<string>();
    this.users?.forEach(u => u.authorities?.forEach(r => roles.add(r)));
    return roles.size;
  }

  getInitials(login: string): string {
    return login ? login.substring(0, 2).toUpperCase() : '?';
  }

  getAvatarClass(login: string): string {
    const colors = ['indigo', 'blue', 'green', 'teal', 'purple', 'pink', 'orange', 'red', 'dark'];
    let hash = 0;
    for (let i = 0; i < login.length; i++) hash = login.charCodeAt(i) + ((hash << 5) - hash);
    return `um-user__avatar--${colors[Math.abs(hash) % colors.length]}`;
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN: 'um-role-badge--red',
      ROLE_USER: 'um-role-badge--gray',
      ROLE_ADMIN_SYSTEME: 'um-role-badge--indigo',
      ROLE_ADMIN_COMMERCIAL: 'um-role-badge--orange',
      ROLE_COMMERCIAL: 'um-role-badge--blue',
      ROLE_MAGASINIER: 'um-role-badge--teal',
      ROLE_CHEF_PARC: 'um-role-badge--green',
      ROLE_RESPONSABLE_PV: 'um-role-badge--purple',
      ROLE_VENDEUR: 'um-role-badge--pink',
      ROLE_ADMIN_CLIENT: 'um-role-badge--dark',
    };
    return map[role] ?? 'um-role-badge--gray';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN: 'ADMIN',
      ROLE_USER: 'USER',
      ROLE_ADMIN_SYSTEME: 'ADM.SYS',
      ROLE_ADMIN_COMMERCIAL: 'ADM.COM',
      ROLE_COMMERCIAL: 'COMMERCIAL',
      ROLE_MAGASINIER: 'MAGASIN.',
      ROLE_CHEF_PARC: 'CH.PARC',
      ROLE_RESPONSABLE_PV: 'RESP.PV',
      ROLE_VENDEUR: 'VENDEUR',
      ROLE_ADMIN_CLIENT: 'ADM.CLI',
    };
    return map[role] ?? role.replace('ROLE_', '');
  }

  getVisibleRoles(authorities: string[] | undefined): string[] {
    return authorities ? authorities.slice(0, 2) : [];
  }

  private handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = +(page ?? 1);
      const sort = (params.get(SORT) ?? data['defaultSort']).split(',');
      this.predicate = sort[0];
      this.ascending = sort[1] === ASC;
      this.loadAll();
    });
  }

  private sort(): string[] {
    const result = [`${this.predicate},${this.ascending ? ASC : DESC}`];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  private onSuccess(users: User[] | null, headers: HttpHeaders): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.users = users;
  }
}
