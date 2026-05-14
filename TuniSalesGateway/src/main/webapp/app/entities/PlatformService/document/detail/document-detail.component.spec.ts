import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DocumentDetailComponent } from './document-detail.component';

describe('Document Management Detail Component', () => {
  let comp: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ document: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DocumentDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DocumentDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load document on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.document).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
