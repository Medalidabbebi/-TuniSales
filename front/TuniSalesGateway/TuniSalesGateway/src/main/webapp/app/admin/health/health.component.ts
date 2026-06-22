import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { HealthService } from './health.service';
import { Health, HealthDetails, HealthStatus } from './health.model';
import { HealthModalComponent } from './modal/health-modal.component';

@Component({
  selector: 'jhi-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit {
  health?: Health;

  constructor(private modalService: NgbModal, private healthService: HealthService) {}

  ngOnInit(): void {
    this.refresh();
  }

  getBadgeClass(statusState: HealthStatus): string {
    if (statusState === 'UP') {
      return 'bg-success';
    }
    return 'bg-danger';
  }

  refresh(): void {
    this.healthService.checkHealth().subscribe({
      next: health => (this.health = health),
      error: (error: HttpErrorResponse) => {
        if (error.status === 503) {
          this.health = error.error;
        }
      },
    });
  }

  showHealth(health: { key: string; value: HealthDetails }): void {
    const modalRef = this.modalService.open(HealthModalComponent);
    modalRef.componentInstance.health = health;
  }

  getComponentCount(): number {
    return this.health ? Object.keys(this.health.components).length : 0;
  }

  countUp(): number {
    if (!this.health) {
      return 0;
    }
    return Object.values(this.health.components).filter(c => c?.status === 'UP').length;
  }

  countDown(): number {
    if (!this.health) {
      return 0;
    }
    return Object.values(this.health.components).filter(c => c?.status !== 'UP').length;
  }

  getStatusColor(status: HealthStatus | undefined): string {
    switch (status) {
      case 'UP':
        return 'green';
      case 'DOWN':
        return 'red';
      case 'OUT_OF_SERVICE':
        return 'amber';
      default:
        return 'gray';
    }
  }

  getStatusIcon(status: HealthStatus | undefined): string {
    switch (status) {
      case 'UP':
        return 'check-circle';
      case 'DOWN':
        return 'times-circle';
      case 'OUT_OF_SERVICE':
        return 'exclamation-triangle';
      default:
        return 'exclamation-circle';
    }
  }

  getStatusLabel(status: HealthStatus | undefined): string {
    switch (status) {
      case 'UP':
        return 'DISPONIBLE';
      case 'DOWN':
        return 'HORS SERVICE';
      case 'OUT_OF_SERVICE':
        return 'SUSPENDU';
      default:
        return 'INCONNU';
    }
  }
}
