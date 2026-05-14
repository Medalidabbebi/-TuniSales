import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MissionDetailComponent } from './mission-detail.component';

describe('Mission Management Detail Component', () => {
  let comp: MissionDetailComponent;
  let fixture: ComponentFixture<MissionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissionDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ mission: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(MissionDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(MissionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load mission on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.mission).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
