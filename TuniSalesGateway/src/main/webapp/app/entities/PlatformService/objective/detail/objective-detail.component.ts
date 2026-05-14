import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IObjective } from '../objective.model';

@Component({
  selector: 'jhi-objective-detail',
  templateUrl: './objective-detail.component.html',
})
export class ObjectiveDetailComponent implements OnInit {
  objective: IObjective | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ objective }) => {
      this.objective = objective;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
