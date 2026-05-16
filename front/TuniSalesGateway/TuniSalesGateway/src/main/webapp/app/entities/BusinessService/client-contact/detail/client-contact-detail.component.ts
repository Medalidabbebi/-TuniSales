import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClientContact } from '../client-contact.model';

@Component({
  selector: 'jhi-client-contact-detail',
  templateUrl: './client-contact-detail.component.html',
  styleUrls: ['./client-contact-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClientContactDetailComponent implements OnInit {
  clientContact: IClientContact | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ clientContact }) => {
      this.clientContact = clientContact;
    });
  }

  previousState(): void {
    window.history.back();
  }

  // Helper methods
  getRoleLabel(role: string | null | undefined): string {
    switch (role) {
      case 'BUYER':       return 'Acheteur';
      case 'ACCOUNTING':  return 'Comptabilité';
      case 'MANAGEMENT':  return 'Direction';
      case 'TECHNICAL':   return 'Technique';
      case 'OTHER':       return 'Autre';
      default:            return role ?? '—';
    }
  }

  getRoleBadgeClass(role: string | null | undefined): string {
    switch (role) {
      case 'BUYER':       return 'ccd-role-badge--blue';
      case 'ACCOUNTING':  return 'ccd-role-badge--green';
      case 'MANAGEMENT':  return 'ccd-role-badge--indigo';
      case 'TECHNICAL':   return 'ccd-role-badge--teal';
      default:            return 'ccd-role-badge--gray';
    }
  }

  getContactAvatar(contact: IClientContact): string {
    const src = contact.fullName || contact.email || '?';
    return src.charAt(0).toUpperCase();
  }
}
