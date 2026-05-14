import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ClientContactDetailComponent } from './client-contact-detail.component';

describe('ClientContact Management Detail Component', () => {
  let comp: ClientContactDetailComponent;
  let fixture: ComponentFixture<ClientContactDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientContactDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ clientContact: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ClientContactDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ClientContactDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load clientContact on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.clientContact).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
