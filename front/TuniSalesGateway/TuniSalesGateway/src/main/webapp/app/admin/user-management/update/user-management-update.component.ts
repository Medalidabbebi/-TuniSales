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

  isRoleSelected(role: string): boolean {
    return (this.editForm.get('authorities')?.value ?? []).includes(role);
  }

  toggleRole(role: string): void {
    const current: string[] = [...(this.editForm.get('authorities')?.value ?? [])];
    const idx = current.indexOf(role);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(role);
    }
    this.editForm.get('authorities')?.setValue(current);
  }

  getRoleColor(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN:             '#ef4444',
      ROLE_USER:              '#64748b',
      ROLE_ADMIN_SYSTEME:     '#4f46e5',
      ROLE_ADMIN_COMMERCIAL:  '#ea580c',
      ROLE_COMMERCIAL:        '#2563eb',
      ROLE_MAGASINIER:       '#0d9488',
      ROLE_CHEF_PARC:        '#16a34a',
      ROLE_RESPONSABLE_PV:   '#7c3aed',
      ROLE_VENDEUR:          '#db2777',
      ROLE_ADMIN_CLIENT:     '#374151',
    };
    return map[role] ?? '#6366f1';
  }

  getRoleIcon(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN:             'shield-alt',
      ROLE_USER:              'user',
      ROLE_ADMIN_SYSTEME:     'cogs',
      ROLE_ADMIN_COMMERCIAL:  'briefcase',
      ROLE_COMMERCIAL:        'chart-bar',
      ROLE_MAGASINIER:        'boxes',
      ROLE_CHEF_PARC:         'car',
      ROLE_RESPONSABLE_PV:    'map-marker-alt',
      ROLE_VENDEUR:           'tag',
      ROLE_ADMIN_CLIENT:      'user-circle',
    };
    return map[role] ?? 'user';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN:             'Administrateur',
      ROLE_USER:              'Utilisateur',
      ROLE_ADMIN_SYSTEME:     'Admin Systeme',
      ROLE_ADMIN_COMMERCIAL:  'Admin Commercial',
      ROLE_COMMERCIAL:        'Commercial',
      ROLE_MAGASINIER:        'Magasinier',
      ROLE_CHEF_PARC:         'Chef de Parc',
      ROLE_RESPONSABLE_PV:    'Responsable PV',
      ROLE_VENDEUR:           'Vendeur',
      ROLE_ADMIN_CLIENT:      'Admin Client',
    };
    return map[role] ?? role.replace('ROLE_', '');
  }

  private onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  private onSaveError(): void {
    this.isSaving = false;
  }
}
