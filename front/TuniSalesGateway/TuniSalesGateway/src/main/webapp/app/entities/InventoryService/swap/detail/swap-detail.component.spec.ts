import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SwapDetailComponent } from './swap-detail.component';

describe('Swap Management Detail Component', () => {
  let comp: SwapDetailComponent;
  let fixture: ComponentFixture<SwapDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SwapDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ swap: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(SwapDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SwapDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load swap on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.swap).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
