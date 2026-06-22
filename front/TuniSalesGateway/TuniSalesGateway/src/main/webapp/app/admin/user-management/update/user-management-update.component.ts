import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { LANGUAGES } from 'app/config/language.constants';
import { IUser } from '../user-management.model';
import { UserManagementService } from '../service/user-management.service';

const userTemplate = {} as IUser;

const newUser: IUser = {
  langKey: 'fr',
  activated: true,
} as IUser;

@Component({
  selector: 'jhi-user-mgmt-update',
  templateUrl: './user-management-update.component.html',
  styleUrls: ['./user-management-update.component.scss'],
})
export class UserManagementUpdateComponent implements OnInit {
  languages = LANGUAGES;
  authorities: string[] = [];
  isSaving = false;

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

  private readonly roleColors: Record<string, string> = {
    ROLE_ADMIN: 'uu-role-pill--admin',
    ROLE_ADMIN_SYSTEME: 'uu-role-pill--system',
    ROLE_ADMIN_COMMERCIAL: 'uu-role-pill--commercial',
    ROLE_COMMERCIAL: 'uu-role-pill--commercial',
    ROLE_MAGASINIER: 'uu-role-pill--magasinier',
    ROLE_CHEF_PARC: 'uu-role-pill--chefparc',
    ROLE_RESPONSABLE_PV: 'uu-role-pill--respo',
    ROLE_VENDEUR: 'uu-role-pill--vendeur',
    ROLE_ADMIN_CLIENT: 'uu-role-pill--client',
    ROLE_USER: 'uu-role-pill--user',
  };

  editForm = new FormGroup({
    id: new FormControl(userTemplate.id),
    login: new FormControl(userTemplate.login, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    firstName: new FormControl(userTemplate.firstName, { validators: [Validators.maxLength(50)] }),
    lastName: new FormControl(userTemplate.lastName, { validators: [Validators.maxLength(50)] }),
    email: new FormControl(userTemplate.email, {
      nonNullable: true,
      validators: [Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    activated: new FormControl(userTemplate.activated, { nonNullable: true }),
    langKey: new FormControl(userTemplate.langKey, { nonNullable: true }),
    authorities: new FormControl(userTemplate.authorities, { nonNullable: true }),
  });

  constructor(private userService: UserManagementService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(({ user }) => {
      if (user) {
        this.editForm.reset(user);
      } else {
        this.editForm.reset(newUser);
      }
    });
    this.userService.authorities().subscribe(authorities => (this.authorities = authorities));
  }

  previousState(): void {
    window.history.back();
  }

  isRoleSelected(authority: string): boolean {
    return (this.editForm.value.authorities ?? []).includes(authority);
  }

  toggleRole(authority: string): void {
    const current = this.editForm.value.authorities ?? [];
    const next = current.includes(authority) ? current.filter(a => a !== authority) : [...current, authority];
    this.editForm.patchValue({ authorities: next });
  }

  getRoleLabel(authority: string): string {
    return this.roleLabels[authority] ?? authority.replace('ROLE_', '').replace(/_/g, ' ');
  }

  getRoleColor(authority: string): string {
    return this.roleColors[authority] ?? '';
  }

  getRoleIcon(_authority: string): string {
    return 'user';
  }

  save(): void {
    this.isSaving = true;
    const user = this.editForm.getRawValue();
    if (user.id !== null) {
      this.userService.update(user).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    } else {
      this.userService.create(user).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  private onSaveError(): void {
    this.isSaving = false;
  }
}
