import { Component, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { Authority } from 'app/config/authority.constants';

@Component({
  selector: 'jhi-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('username', { static: false })
  username!: ElementRef;

  authenticationError = false;

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(private accountService: AccountService, private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate([this.getDefaultRouteForAccount()]);
      }
    });
  }

  ngAfterViewInit(): void {
    this.username.nativeElement.focus();
  }

  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.authenticationError = false;
        if (!this.router.getCurrentNavigation()) {
          this.router.navigate([this.getDefaultRouteForAccount()]);
        }
      },
      error: () => (this.authenticationError = true),
    });
  }

  private getDefaultRouteForAccount(): string {
    if (this.accountService.hasAnyAuthority([Authority.ADMIN_SYSTEME])) {
      return '/admin/user-management';
    }
    if (this.accountService.hasAnyAuthority([Authority.ADMIN_COMMERCIAL])) {
      return '/order';
    }
    if (this.accountService.hasAnyAuthority([Authority.COMMERCIAL])) {
      return '/order';
    }
    if (this.accountService.hasAnyAuthority([Authority.MAGASINIER])) {
      return '/stock-item';
    }
    if (this.accountService.hasAnyAuthority([Authority.CHEF_PARC])) {
      return '/performance-score';
    }
    if (this.accountService.hasAnyAuthority([Authority.RESPONSABLE_PV])) {
      return '/delivery';
    }
    if (this.accountService.hasAnyAuthority([Authority.VENDEUR])) {
      return '/order';
    }
    if (this.accountService.hasAnyAuthority([Authority.ADMIN_CLIENT])) {
      return '/client-score';
    }
    return '';
  }
}
