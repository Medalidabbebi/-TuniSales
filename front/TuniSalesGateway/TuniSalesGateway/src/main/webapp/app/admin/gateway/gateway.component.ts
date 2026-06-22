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

  private readonly serviceIcons: Record<string, string> = {
    platformservice: 'server',
    inventoryservice: 'warehouse',
    businessservice: 'briefcase',
    'jhipster-registry': 'sitemap',
  };

  private readonly serviceColors: Record<string, string> = {
    platformservice: 'gw-route-card__icon--purple',
    inventoryservice: 'gw-route-card__icon--amber',
    businessservice: 'gw-route-card__icon--green',
    'jhipster-registry': 'gw-route-card__icon--cyan',
  };

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

  getServiceIcon(serviceId: string): string {
    return this.serviceIcons[serviceId] ?? 'server';
  }

  getServiceColor(serviceId: string): string {
    return this.serviceColors[serviceId] ?? '';
  }

  countServicesUp(): number {
    return this.gatewayRoutes.reduce(
      (count, route) => count + route.serviceInstances.filter((i: any) => i.instanceInfo?.status === 'UP').length,
      0
    );
  }

  countServicesDown(): number {
    return this.gatewayRoutes.reduce(
      (count, route) => count + route.serviceInstances.filter((i: any) => i.instanceInfo?.status !== 'UP').length,
      0
    );
  }
}
