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
  requiredAuthority?: string;
}

export interface NavItem {
  label: string;
  translateKey: string;
  icon: IconProp;
  route: string;
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
    },
    {
      label: 'Sales',
      translateKey: 'global.menu.sales',
      icon: 'chart-line',
      children: [
        { label: 'Clients', translateKey: 'global.menu.entities.businessServiceClient', icon: 'users', route: '/client' },
        { label: 'Orders', translateKey: 'global.menu.entities.businessServiceOrder', icon: 'shopping-cart', route: '/order' },
        { label: 'Sales Offers', translateKey: 'global.menu.salesOffers', icon: 'file-signature', route: '/sales-offer' },
        { label: 'Invoices', translateKey: 'global.menu.entities.businessServiceInvoice', icon: 'file-invoice-dollar', route: '/invoice' },
        { label: 'Products', translateKey: 'global.menu.entities.businessServiceProduct', icon: 'box', route: '/product' },
        { label: 'Price Lists', translateKey: 'global.menu.entities.businessServicePriceList', icon: 'tags', route: '/price-list' },
      ],
    },
    {
      label: 'Operations',
      translateKey: 'global.menu.operations',
      icon: 'truck',
      children: [
        { label: 'Deliveries', translateKey: 'global.menu.entities.businessServiceDelivery', icon: 'truck', route: '/delivery' },
        { label: 'Missions', translateKey: 'global.menu.entities.businessServiceMission', icon: 'map-marked-alt', route: '/mission' },
        { label: 'Visits', translateKey: 'global.menu.entities.businessServiceVisit', icon: 'calendar-check', route: '/visit' },
      ],
    },
    {
      label: 'Inventory',
      translateKey: 'global.menu.inventory',
      icon: 'warehouse',
      children: [
        { label: 'Stock Items', translateKey: 'global.menu.entities.inventoryServiceStockItem', icon: 'cubes', route: '/stock-item' },
        { label: 'Warehouses', translateKey: 'global.menu.entities.inventoryServiceWarehouse', icon: 'warehouse', route: '/warehouse' },
        {
          label: 'Movements',
          translateKey: 'global.menu.entities.inventoryServiceStockMovement',
          icon: 'exchange-alt',
          route: '/stock-movement',
        },
        { label: 'Audits', translateKey: 'global.menu.entities.inventoryServiceStockAudit', icon: 'clipboard-check', route: '/stock-audit' },
        { label: 'Swaps', translateKey: 'global.menu.entities.inventoryServiceSwap', icon: 'retweet', route: '/swap' },
      ],
    },
    {
      label: 'Performance',
      translateKey: 'global.menu.performance',
      icon: 'bullseye',
      children: [
        { label: 'Objectives', translateKey: 'global.menu.entities.platformServiceObjective', icon: 'bullseye', route: '/objective' },
        {
          label: 'Scores',
          translateKey: 'global.menu.entities.platformServicePerformanceScore',
          icon: 'chart-bar',
          route: '/performance-score',
        },
        {
          label: 'Client Scores',
          translateKey: 'global.menu.entities.platformServiceClientScore',
          icon: 'star',
          route: '/client-score',
        },
      ],
    },
    {
      label: 'Admin',
      translateKey: 'global.menu.admin.main',
      icon: 'cogs',
      requiredAuthority: Authority.ADMIN,
      children: [
        { label: 'Users', translateKey: 'global.menu.admin.userManagement', icon: 'users-cog', route: '/admin/user-management' },
        { label: 'Gateway', translateKey: 'global.menu.admin.gateway', icon: 'road', route: '/admin/gateway' },
        { label: 'Metrics', translateKey: 'global.menu.admin.metrics', icon: 'tachometer-alt', route: '/admin/metrics' },
        { label: 'Health', translateKey: 'global.menu.admin.health', icon: 'heart', route: '/admin/health' },
        { label: 'Logs', translateKey: 'global.menu.admin.logs', icon: 'tasks', route: '/admin/logs' },
        { label: 'Audit Logs', translateKey: 'global.menu.entities.platformServiceAuditLog', icon: 'history', route: '/audit-log' },
        { label: 'Tenants', translateKey: 'global.menu.entities.platformServiceTenant', icon: 'building', route: '/tenant' },
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
    if (!section.requiredAuthority) {
      return true;
    }
    return this.account?.authorities?.includes(section.requiredAuthority) ?? false;
  }
}
