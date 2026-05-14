import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from 'ngx-webstorage';

import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { Account } from 'app/core/auth/account.model';
import { LANGUAGES } from 'app/config/language.constants';
import { ProfileService } from 'app/layouts/profiles/profile.service';

@Component({
  selector: 'jhi-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  account: Account | null = null;
  languages = LANGUAGES;
  currentLang = '';
  isDarkMode = false;
  openAPIEnabled = false;
  showUserMenu = false;
  showLangMenu = false;
  showNotifications = false;

  constructor(
    private accountService: AccountService,
    private loginService: LoginService,
    private translateService: TranslateService,
    private sessionStorageService: SessionStorageService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
    this.currentLang = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
    this.profileService.getProfileInfo().subscribe(info => {
      this.openAPIEnabled = info.openAPIEnabled ?? false;
    });

    // Check saved theme
    const saved = localStorage.getItem('tsg-theme');
    if (saved === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  changeLanguage(lang: string): void {
    this.sessionStorageService.store('locale', lang);
    this.translateService.use(lang);
    this.showLangMenu = false;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tsg-theme', theme);
  }

  logout(): void {
    this.showUserMenu = false;
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  getLangDisplay(lang: string): string {
    const map: Record<string, string> = { fr: 'FR', en: 'EN', 'ar-ly': 'AR' };
    return map[lang] || lang.toUpperCase();
  }
}
