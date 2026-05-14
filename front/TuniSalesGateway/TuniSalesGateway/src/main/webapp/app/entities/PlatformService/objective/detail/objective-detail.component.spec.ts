import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ObjectiveDetailComponent } from './objective-detail.component';

describe('Objective Management Detail Component', () => {
  let comp: ObjectiveDetailComponent;
  let fixture: ComponentFixture<ObjectiveDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectiveDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ objective: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ObjectiveDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ObjectiveDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load objective on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.objective).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
