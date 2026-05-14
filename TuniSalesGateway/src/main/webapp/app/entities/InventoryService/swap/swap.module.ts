import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SwapComponent } from './list/swap.component';
import { SwapDetailComponent } from './detail/swap-detail.component';
import { SwapUpdateComponent } from './update/swap-update.component';
import { SwapDeleteDialogComponent } from './delete/swap-delete-dialog.component';
import { SwapRoutingModule } from './route/swap-routing.module';

@NgModule({
  imports: [SharedModule, SwapRoutingModule],
  declarations: [SwapComponent, SwapDetailComponent, SwapUpdateComponent, SwapDeleteDialogComponent],
})
export class InventoryServiceSwapModule {}
