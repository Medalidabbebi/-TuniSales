import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ISwap } from '../swap.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../swap.test-samples';

import { SwapService, RestSwap } from './swap.service';

const requireRestSample: RestSwap = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  resolvedAt: sampleWithRequiredData.resolvedAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Swap Service', () => {
  let service: SwapService;
  let httpMock: HttpTestingController;
  let expectedResult: ISwap | ISwap[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(SwapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Swap', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const swap = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(swap).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Swap', () => {
      const swap = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(swap).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Swap', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Swap', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Swap', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSwapToCollectionIfMissing', () => {
      it('should add a Swap to an empty array', () => {
        const swap: ISwap = sampleWithRequiredData;
        expectedResult = service.addSwapToCollectionIfMissing([], swap);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(swap);
      });

      it('should not add a Swap to an array that contains it', () => {
        const swap: ISwap = sampleWithRequiredData;
        const swapCollection: ISwap[] = [
          {
            ...swap,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSwapToCollectionIfMissing(swapCollection, swap);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Swap to an array that doesn't contain it", () => {
        const swap: ISwap = sampleWithRequiredData;
        const swapCollection: ISwap[] = [sampleWithPartialData];
        expectedResult = service.addSwapToCollectionIfMissing(swapCollection, swap);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(swap);
      });

      it('should add only unique Swap to an array', () => {
        const swapArray: ISwap[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const swapCollection: ISwap[] = [sampleWithRequiredData];
        expectedResult = service.addSwapToCollectionIfMissing(swapCollection, ...swapArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const swap: ISwap = sampleWithRequiredData;
        const swap2: ISwap = sampleWithPartialData;
        expectedResult = service.addSwapToCollectionIfMissing([], swap, swap2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(swap);
        expect(expectedResult).toContain(swap2);
      });

      it('should accept null and undefined values', () => {
        const swap: ISwap = sampleWithRequiredData;
        expectedResult = service.addSwapToCollectionIfMissing([], null, swap, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(swap);
      });

      it('should return initial array if no Swap is added', () => {
        const swapCollection: ISwap[] = [sampleWithRequiredData];
        expectedResult = service.addSwapToCollectionIfMissing(swapCollection, undefined, null);
        expect(expectedResult).toEqual(swapCollection);
      });
    });

    describe('compareSwap', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSwap(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareSwap(entity1, entity2);
        const compareResult2 = service.compareSwap(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareSwap(entity1, entity2);
        const compareResult2 = service.compareSwap(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareSwap(entity1, entity2);
        const compareResult2 = service.compareSwap(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
