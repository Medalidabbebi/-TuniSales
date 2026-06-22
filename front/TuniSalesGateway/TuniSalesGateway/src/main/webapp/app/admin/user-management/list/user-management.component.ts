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

  private readonly roleLabels: Record<string, string> = {
    ROLE_ADMIN: 'Admin',
    ROLE_ADMIN_SYSTEME: 'Admin Système',
    ROLE_ADMIN_COMMERCIAL: 'Admin Commercial',
    ROLE_COMMERCIAL: 'Commercial',
    ROLE_MAGASINIER: 'Magasinier',
    ROLE_CHEF_PARC: 'Chef Parc',
    ROLE_RESPONSABLE_PV: 'Responsable PV',
    ROLE_VENDEUR: 'Vendeur',
    ROLE_ADMIN_CLIENT: 'Admin Client',
    ROLE_USER: 'User',
  };

  private readonly roleClasses: Record<string, string> = {
    ROLE_ADMIN: 'um-role-badge--admin',
    ROLE_ADMIN_SYSTEME: 'um-role-badge--system',
    ROLE_ADMIN_COMMERCIAL: 'um-role-badge--commercial',
    ROLE_COMMERCIAL: 'um-role-badge--commercial',
    ROLE_MAGASINIER: 'um-role-badge--magasinier',
    ROLE_CHEF_PARC: 'um-role-badge--chefparc',
    ROLE_RESPONSABLE_PV: 'um-role-badge--respo',
    ROLE_VENDEUR: 'um-role-badge--vendeur',
    ROLE_ADMIN_CLIENT: 'um-role-badge--client',
    ROLE_USER: 'um-role-badge--user',
  };

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

  countActive(): number {
    return this.users?.filter(u => u.activated).length ?? 0;
  }

  countInactive(): number {
    return this.users?.filter(u => !u.activated).length ?? 0;
  }

  countDistinctRoles(): number {
    const roles = new Set<string>();
    this.users?.forEach(u => u.authorities?.forEach(role => roles.add(role)));
    return roles.size;
  }

  getInitials(login?: string): string {
    if (!login) {
      return '?';
    }
    return login.slice(0, 2).toUpperCase();
  }

  getAvatarClass(login?: string): string {
    const code = (login ?? '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `um-avatar--${(code % 5) + 1}`;
  }

  getVisibleRoles(authorities?: string[]): string[] {
    return (authorities ?? []).slice(0, 3);
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] ?? role.replace('ROLE_', '').replace(/_/g, ' ');
  }

  getRoleClass(role: string): string {
    return this.roleClasses[role] ?? '';
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
