import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { Authority } from 'app/config/authority.constants';

export interface NavSection {
  label: string;
  translateKey: string;
  icon: IconProp;
  children: NavItem[];
  requiredAuthorities?: string[];
}

export interface NavItem {
  label: string;
  translateKey: string;
  icon: IconProp;
  route: string;
  requiredAuthorities?: string[];
}

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  account: Account | null = null;
  currentUrl = '';
  expandedSections: Set<string> = new Set(['sales']);

  navSections: NavSection[] = [
    {
      label: 'Dashboard',
      translateKey: 'global.menu.dashboard',
      icon: 'tachometer-alt',
      children: [],
      requiredAuthorities: [
        Authority.ADMIN,
        Authority.ADMIN_SYSTEME,
        Authority.ADMIN_COMMERCIAL,
        Authority.COMMERCIAL,
        Authority.MAGASINIER,
        Authority.CHEF_PARC,
        Authority.RESPONSABLE_PV,
        Authority.VENDEUR,
        Authority.ADMIN_CLIENT,
      ],
    },
    {
      label: 'Sales',
      translateKey: 'global.menu.sales',
      icon: 'chart-line',
      requiredAuthorities: [
        Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL,
        Authority.COMMERCIAL, Authority.VENDEUR, Authority.MAGASINIER, Authority.ADMIN_CLIENT,
      ],
      children: [
        {
          label: 'Clients', translateKey: 'global.menu.entities.businessServiceClient', icon: 'users', route: '/client',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL, Authority.VENDEUR],
        },
        {
          label: 'Orders', translateKey: 'global.menu.entities.businessServiceOrder', icon: 'shopping-cart', route: '/order',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL, Authority.VENDEUR],
        },
        {
          label: 'Invoices', translateKey: 'global.menu.entities.businessServiceInvoice', icon: 'file-invoice-dollar', route: '/invoice',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL, Authority.ADMIN_CLIENT],
        },
        {
          label: 'Products', translateKey: 'global.menu.entities.businessServiceProduct', icon: 'box', route: '/product',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL, Authority.VENDEUR, Authority.MAGASINIER],
        },
        {
          label: 'Price Lists', translateKey: 'global.menu.entities.businessServicePriceList', icon: 'tags', route: '/price-list',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL],
        },
      ],
    },
    {
      label: 'Operations',
      translateKey: 'global.menu.operations',
      icon: 'truck',
      requiredAuthorities: [
        Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL,
        Authority.COMMERCIAL, Authority.MAGASINIER, Authority.CHEF_PARC, Authority.RESPONSABLE_PV,
      ],
      children: [
        {
          label: 'Deliveries', translateKey: 'global.menu.entities.businessServiceDelivery', icon: 'truck', route: '/delivery',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER],
        },
        {
          label: 'Missions', translateKey: 'global.menu.entities.businessServiceMission', icon: 'map-marked-alt', route: '/mission',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.CHEF_PARC, Authority.COMMERCIAL],
        },
        {
          label: 'Visits', translateKey: 'global.menu.entities.businessServiceVisit', icon: 'calendar-check', route: '/visit',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.RESPONSABLE_PV, Authority.COMMERCIAL],
        },
      ],
    },
    {
      label: 'Inventory',
      translateKey: 'global.menu.inventory',
      icon: 'warehouse',
      requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER, Authority.CHEF_PARC],
      children: [
        {
          label: 'Stock Items', translateKey: 'global.menu.entities.inventoryServiceStockItem', icon: 'cubes', route: '/stock-item',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER, Authority.CHEF_PARC],
        },
        {
          label: 'Warehouses', translateKey: 'global.menu.entities.inventoryServiceWarehouse', icon: 'warehouse', route: '/warehouse',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER, Authority.CHEF_PARC],
        },
        {
          label: 'Movements', translateKey: 'global.menu.entities.inventoryServiceStockMovement', icon: 'exchange-alt', route: '/stock-movement',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER],
        },
        {
          label: 'Audits', translateKey: 'global.menu.entities.inventoryServiceStockAudit', icon: 'clipboard-check', route: '/stock-audit',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.MAGASINIER],
        },
        {
          label: 'Swaps', translateKey: 'global.menu.entities.inventoryServiceSwap', icon: 'retweet', route: '/swap',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.CHEF_PARC],
        },
      ],
    },
    {
      label: 'Performance',
      translateKey: 'global.menu.performance',
      icon: 'bullseye',
      requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL, Authority.ADMIN_CLIENT],
      children: [
        {
          label: 'Objectives', translateKey: 'global.menu.entities.platformServiceObjective', icon: 'bullseye', route: '/objective',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL],
        },
        {
          label: 'Scores', translateKey: 'global.menu.entities.platformServicePerformanceScore', icon: 'chart-bar', route: '/performance-score',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.COMMERCIAL],
        },
        {
          label: 'Client Scores', translateKey: 'global.menu.entities.platformServiceClientScore', icon: 'star', route: '/client-score',
          requiredAuthorities: [Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL, Authority.ADMIN_CLIENT],
        },
      ],
    },
    {
      label: 'Admin',
      translateKey: 'global.menu.admin.main',
      icon: 'cogs',
      requiredAuthorities: [Authority.ADMIN, Authority.ADMIN_SYSTEME],
      children: [
        {
          label: 'Users', translateKey: 'global.menu.admin.userManagement', icon: 'users-cog', route: '/admin/user-management',
          requiredAuthorities: [Authority.ADMIN, Authority.ADMIN_SYSTEME],
        },
        {
          label: 'Gateway', translateKey: 'global.menu.admin.gateway', icon: 'road', route: '/admin/gateway',
          requiredAuthorities: [Authority.ADMIN],
        },
        {
          label: 'Metrics', translateKey: 'global.menu.admin.metrics', icon: 'tachometer-alt', route: '/admin/metrics',
          requiredAuthorities: [Authority.ADMIN],
        },
        {
          label: 'Health', translateKey: 'global.menu.admin.health', icon: 'heart', route: '/admin/health',
          requiredAuthorities: [Authority.ADMIN],
        },
        {
          label: 'Logs', translateKey: 'global.menu.admin.logs', icon: 'tasks', route: '/admin/logs',
          requiredAuthorities: [Authority.ADMIN],
        },
        {
          label: 'Audit Logs', translateKey: 'global.menu.entities.platformServiceAuditLog', icon: 'history', route: '/audit-log',
          requiredAuthorities: [Authority.ADMIN, Authority.ADMIN_SYSTEME, Authority.ADMIN_COMMERCIAL],
        },
        {
          label: 'Tenants', translateKey: 'global.menu.entities.platformServiceTenant', icon: 'building', route: '/tenant',
          requiredAuthorities: [Authority.ADMIN, Authority.ADMIN_SYSTEME],
        },
      ],
    },
  ];

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects || e.url;
    });

    this.currentUrl = this.router.url;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleSection(label: string): void {
    if (this.expandedSections.has(label)) {
      this.expandedSections.delete(label);
    } else {
      this.expandedSections.add(label);
    }
  }

  isSectionExpanded(label: string): boolean {
    return this.expandedSections.has(label) && !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  isDashboard(section: NavSection): boolean {
    return section.children.length === 0;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/']);
  }

  hasAuthority(section: NavSection): boolean {
    if (!section.requiredAuthorities || section.requiredAuthorities.length === 0) return true;
    const userAuthorities = this.account?.authorities ?? [];
    return section.requiredAuthorities.some(auth => userAuthorities.includes(auth));
  }

  hasItemAuthority(item: NavItem): boolean {
    if (!item.requiredAuthorities || item.requiredAuthorities.length === 0) return true;
    const userAuthorities = this.account?.authorities ?? [];
    return item.requiredAuthorities.some(auth => userAuthorities.includes(auth));
  }

  getVisibleChildren(section: NavSection): NavItem[] {
    return section.children.filter(item => this.hasItemAuthority(item));
  }
}
