import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IClientContact } from '../client-contact.model';

@Component({
  selector: 'jhi-client-contact-detail',
  templateUrl: './client-contact-detail.component.html',
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
}
