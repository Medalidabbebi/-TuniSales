import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
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

  private readonly roleOrder = [
    'ROLE_ADMIN_SYSTEME',
    'ROLE_ADMIN_COMMERCIAL',
    'ROLE_COMMERCIAL',
    'ROLE_MAGASINIER',
    'ROLE_CHEF_PARC',
    'ROLE_RESPONSABLE_PV',
    'ROLE_VENDEUR',
    'ROLE_ADMIN_CLIENT',
    'ROLE_ADMIN',
    'ROLE_USER',
  ];

  private readonly roleLabels: Record<string, string> = {
    ROLE_ADMIN_SYSTEME: 'Admin Système',
    ROLE_ADMIN_COMMERCIAL: 'Admin Commercial',
    ROLE_COMMERCIAL: 'Commercial',
    ROLE_MAGASINIER: 'Magasinier',
    ROLE_CHEF_PARC: 'Chef Parc',
    ROLE_RESPONSABLE_PV: 'Resp. PV',
    ROLE_VENDEUR: 'Vendeur',
    ROLE_ADMIN_CLIENT: 'Admin Client',
    ROLE_ADMIN: 'Admin',
    ROLE_USER: 'Utilisateur',
  };

  private readonly roleClasses: Record<string, string> = {
    ROLE_ADMIN_SYSTEME: 'um-role-badge--red',
    ROLE_ADMIN_COMMERCIAL: 'um-role-badge--orange',
    ROLE_COMMERCIAL: 'um-role-badge--blue',
    ROLE_MAGASINIER: 'um-role-badge--green',
    ROLE_CHEF_PARC: 'um-role-badge--teal',
    ROLE_RESPONSABLE_PV: 'um-role-badge--purple',
    ROLE_VENDEUR: 'um-role-badge--indigo',
    ROLE_ADMIN_CLIENT: 'um-role-badge--pink',
    ROLE_ADMIN: 'um-role-badge--dark',
    ROLE_USER: 'um-role-badge--gray',
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

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
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

  getActiveCount(): number {
    return this.users?.filter(u => u.activated).length ?? 0;
  }

  getInactiveCount(): number {
    return this.users?.filter(u => !u.activated).length ?? 0;
  }

  getInitial(user: User): string {
    return (user.firstName?.charAt(0) || user.login?.charAt(0) || 'U').toUpperCase();
  }

  getAvatarClass(user: User): string {
    const primary = this.getPrimaryRole(user);
    const map: Record<string, string> = {
      ROLE_ADMIN_SYSTEME: 'um-user__avatar--red',
      ROLE_ADMIN_COMMERCIAL: 'um-user__avatar--orange',
      ROLE_COMMERCIAL: 'um-user__avatar--blue',
      ROLE_MAGASINIER: 'um-user__avatar--green',
      ROLE_CHEF_PARC: 'um-user__avatar--teal',
      ROLE_RESPONSABLE_PV: 'um-user__avatar--purple',
      ROLE_VENDEUR: 'um-user__avatar--indigo',
      ROLE_ADMIN_CLIENT: 'um-user__avatar--pink',
      ROLE_ADMIN: 'um-user__avatar--dark',
      ROLE_USER: 'um-user__avatar--gray',
    };
    return map[primary] ?? 'um-user__avatar--gray';
  }

  getPrimaryRole(user: User): string {
    const authorities = user.authorities ?? [];
    for (const role of this.roleOrder) {
      if (authorities.includes(role)) return role;
    }
    return 'ROLE_USER';
  }

  getPrimaryRoleLabel(user: User): string {
    return this.roleLabels[this.getPrimaryRole(user)] ?? 'Utilisateur';
  }

  getPrimaryRoleClass(user: User): string {
    return this.roleClasses[this.getPrimaryRole(user)] ?? 'um-role-badge--gray';
  }

  getExtraRolesCount(user: User): number {
    const authorities = user.authorities ?? [];
    const meaningful = authorities.filter(a => a !== 'ROLE_USER');
    return Math.max(0, meaningful.length - 1);
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
