import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'audit-log',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceAuditLog.home.title' },
        loadChildren: () => import('./PlatformService/audit-log/audit-log.module').then(m => m.PlatformServiceAuditLogModule),
      },
      {
        path: 'client',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceClient.home.title' },
        loadChildren: () => import('./BusinessService/client/client.module').then(m => m.BusinessServiceClientModule),
      },
      {
        path: 'client-contact',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceClientContact.home.title' },
        loadChildren: () =>
          import('./BusinessService/client-contact/client-contact.module').then(m => m.BusinessServiceClientContactModule),
      },
      {
        path: 'client-score',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceClientScore.home.title' },
        loadChildren: () => import('./PlatformService/client-score/client-score.module').then(m => m.PlatformServiceClientScoreModule),
      },
      {
        path: 'delivery',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceDelivery.home.title' },
        loadChildren: () => import('./BusinessService/delivery/delivery.module').then(m => m.BusinessServiceDeliveryModule),
      },
      {
        path: 'document',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceDocument.home.title' },
        loadChildren: () => import('./PlatformService/document/document.module').then(m => m.PlatformServiceDocumentModule),
      },
      {
        path: 'invoice',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceInvoice.home.title' },
        loadChildren: () => import('./BusinessService/invoice/invoice.module').then(m => m.BusinessServiceInvoiceModule),
      },
      {
        path: 'mission',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceMission.home.title' },
        loadChildren: () => import('./BusinessService/mission/mission.module').then(m => m.BusinessServiceMissionModule),
      },
      {
        path: 'notification',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceNotification.home.title' },
        loadChildren: () => import('./PlatformService/notification/notification.module').then(m => m.PlatformServiceNotificationModule),
      },
      {
        path: 'objective',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceObjective.home.title' },
        loadChildren: () => import('./PlatformService/objective/objective.module').then(m => m.PlatformServiceObjectiveModule),
      },
      {
        path: 'order',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceOrder.home.title' },
        loadChildren: () => import('./BusinessService/order/order.module').then(m => m.BusinessServiceOrderModule),
      },
      {
        path: 'claim',
        data: { pageTitle: 'Réclamations' },
        loadChildren: () => import('./BusinessService/claim/claim.module').then(m => m.BusinessServiceClaimModule),
      },
      {
        path: 'order-line',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceOrderLine.home.title' },
        loadChildren: () => import('./BusinessService/order-line/order-line.module').then(m => m.BusinessServiceOrderLineModule),
      },
      {
        path: 'order-line-item',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceOrderLineItem.home.title' },
        loadChildren: () =>
          import('./BusinessService/order-line-item/order-line-item.module').then(m => m.BusinessServiceOrderLineItemModule),
      },
      {
        path: 'performance-score',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServicePerformanceScore.home.title' },
        loadChildren: () =>
          import('./PlatformService/performance-score/performance-score.module').then(m => m.PlatformServicePerformanceScoreModule),
      },
      {
        path: 'price-list',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServicePriceList.home.title' },
        loadChildren: () => import('./BusinessService/price-list/price-list.module').then(m => m.BusinessServicePriceListModule),
      },
      {
        path: 'product',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceProduct.home.title' },
        loadChildren: () => import('./BusinessService/product/product.module').then(m => m.BusinessServiceProductModule),
      },
      {
        path: 'sales-offer',
        data: { pageTitle: 'Creation Offre Vente' },
        loadChildren: () => import('./BusinessService/sales-offer/sales-offer.module').then(m => m.BusinessServiceSalesOfferModule),
      },
      {
        path: 'stock-audit',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceStockAudit.home.title' },
        loadChildren: () => import('./InventoryService/stock-audit/stock-audit.module').then(m => m.InventoryServiceStockAuditModule),
      },
      {
        path: 'stock-audit-line',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceStockAuditLine.home.title' },
        loadChildren: () =>
          import('./InventoryService/stock-audit-line/stock-audit-line.module').then(m => m.InventoryServiceStockAuditLineModule),
      },
      {
        path: 'stock-item',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceStockItem.home.title' },
        loadChildren: () => import('./InventoryService/stock-item/stock-item.module').then(m => m.InventoryServiceStockItemModule),
      },
      {
        path: 'stock-movement',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceStockMovement.home.title' },
        loadChildren: () =>
          import('./InventoryService/stock-movement/stock-movement.module').then(m => m.InventoryServiceStockMovementModule),
      },
      {
        path: 'swap',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceSwap.home.title' },
        loadChildren: () => import('./InventoryService/swap/swap.module').then(m => m.InventoryServiceSwapModule),
      },
      {
        path: 'tenant',
        data: { pageTitle: 'tuniSalesGatewayApp.platformServiceTenant.home.title' },
        loadChildren: () => import('./PlatformService/tenant/tenant.module').then(m => m.PlatformServiceTenantModule),
      },
      {
        path: 'visit',
        data: { pageTitle: 'tuniSalesGatewayApp.businessServiceVisit.home.title' },
        loadChildren: () => import('./BusinessService/visit/visit.module').then(m => m.BusinessServiceVisitModule),
      },
      {
        path: 'warehouse',
        data: { pageTitle: 'tuniSalesGatewayApp.inventoryServiceWarehouse.home.title' },
        loadChildren: () => import('./InventoryService/warehouse/warehouse.module').then(m => m.InventoryServiceWarehouseModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
