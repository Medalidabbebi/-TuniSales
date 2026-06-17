import { Component, OnInit } from '@angular/core';

import { GatewayRoutesService } from './gateway-routes.service';
import { GatewayRoute } from './gateway-route.model';

@Component({
  selector: 'jhi-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss'],
  providers: [GatewayRoutesService],
})
export class GatewayComponent implements OnInit {
  gatewayRoutes: GatewayRoute[] = [];
  updatingRoutes = false;

  constructor(private gatewayRoutesService: GatewayRoutesService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.updatingRoutes = true;
    this.gatewayRoutesService.findAll().subscribe(gatewayRoutes => {
      this.gatewayRoutes = gatewayRoutes;
      this.updatingRoutes = false;
    });
  }

  getServiceColor(serviceId: string): string {
    const map: Record<string, string> = {
      platformservice: 'purple',
      inventoryservice: 'teal',
      businessservice: 'blue',
      'jhipster-registry': 'orange',
    };
    return map[serviceId?.toLowerCase()] ?? 'gray';
  }

  getServiceIcon(serviceId: string): string {
    const map: Record<string, string> = {
      platformservice: 'chart-line',
      inventoryservice: 'box',
      businessservice: 'briefcase',
      'jhipster-registry': 'server',
    };
    return map[serviceId?.toLowerCase()] ?? 'globe';
  }

  getOverallStatus(route: GatewayRoute): string {
    if (!route.serviceInstances.length) return 'DOWN';
    const statuses = route.serviceInstances
      .filter((i: any) => i.instanceInfo)
      .map((i: any) => i.instanceInfo.status as string);
    if (!statuses.length) return 'DOWN';
    if (statuses.every(s => s === 'UP')) return 'UP';
    if (statuses.some(s => s === 'UP')) return 'PARTIAL';
    return 'DOWN';
  }

  getOverallStatusClass(route: GatewayRoute): string {
    const s = this.getOverallStatus(route);
    if (s === 'UP') return 'gw-status-badge--up';
    if (s === 'PARTIAL') return 'gw-status-badge--mixed';
    return 'gw-status-badge--down';
  }

  countServicesUp(): number {
    return this.gatewayRoutes.filter(r => this.getOverallStatus(r) === 'UP').length;
  }

  countServicesDown(): number {
    return this.gatewayRoutes.filter(r => this.getOverallStatus(r) === 'DOWN').length;
  }
}
