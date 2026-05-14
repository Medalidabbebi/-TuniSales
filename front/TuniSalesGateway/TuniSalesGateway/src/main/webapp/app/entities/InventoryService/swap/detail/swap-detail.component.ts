import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISwap } from '../swap.model';

@Component({
  selector: 'jhi-swap-detail',
  templateUrl: './swap-detail.component.html',
})
export class SwapDetailComponent implements OnInit {
  swap: ISwap | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ swap }) => {
      this.swap = swap;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
