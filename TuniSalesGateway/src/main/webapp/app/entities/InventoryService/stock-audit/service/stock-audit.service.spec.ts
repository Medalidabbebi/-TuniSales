import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IStockAudit } from '../stock-audit.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../stock-audit.test-samples';

import { StockAuditService, RestStockAudit } from './stock-audit.service';

const requireRestSample: RestStockAudit = {
  ...sampleWithRequiredData,
  startedAt: sampleWithRequiredData.startedAt?.toJSON(),
  closedAt: sampleWithRequiredData.closedAt?.toJSON(),
};

describe('StockAudit Service', () => {
  let service: StockAuditService;
  let httpMock: HttpTestingController;
  let expectedResult: IStockAudit | IStockAudit[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(StockAuditService);
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

    it('should create a StockAudit', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const stockAudit = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(stockAudit).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a StockAudit', () => {
      const stockAudit = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(stockAudit).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a StockAudit', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of StockAudit', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a StockAudit', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addStockAuditToCollectionIfMissing', () => {
      it('should add a StockAudit to an empty array', () => {
        const stockAudit: IStockAudit = sampleWithRequiredData;
        expectedResult = service.addStockAuditToCollectionIfMissing([], stockAudit);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockAudit);
      });

      it('should not add a StockAudit to an array that contains it', () => {
        const stockAudit: IStockAudit = sampleWithRequiredData;
        const stockAuditCollection: IStockAudit[] = [
          {
            ...stockAudit,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addStockAuditToCollectionIfMissing(stockAuditCollection, stockAudit);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a StockAudit to an array that doesn't contain it", () => {
        const stockAudit: IStockAudit = sampleWithRequiredData;
        const stockAuditCollection: IStockAudit[] = [sampleWithPartialData];
        expectedResult = service.addStockAuditToCollectionIfMissing(stockAuditCollection, stockAudit);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockAudit);
      });

      it('should add only unique StockAudit to an array', () => {
        const stockAuditArray: IStockAudit[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const stockAuditCollection: IStockAudit[] = [sampleWithRequiredData];
        expectedResult = service.addStockAuditToCollectionIfMissing(stockAuditCollection, ...stockAuditArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const stockAudit: IStockAudit = sampleWithRequiredData;
        const stockAudit2: IStockAudit = sampleWithPartialData;
        expectedResult = service.addStockAuditToCollectionIfMissing([], stockAudit, stockAudit2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockAudit);
        expect(expectedResult).toContain(stockAudit2);
      });

      it('should accept null and undefined values', () => {
        const stockAudit: IStockAudit = sampleWithRequiredData;
        expectedResult = service.addStockAuditToCollectionIfMissing([], null, stockAudit, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockAudit);
      });

      it('should return initial array if no StockAudit is added', () => {
        const stockAuditCollection: IStockAudit[] = [sampleWithRequiredData];
        expectedResult = service.addStockAuditToCollectionIfMissing(stockAuditCollection, undefined, null);
        expect(expectedResult).toEqual(stockAuditCollection);
      });
    });

    describe('compareStockAudit', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareStockAudit(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareStockAudit(entity1, entity2);
        const compareResult2 = service.compareStockAudit(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareStockAudit(entity1, entity2);
        const compareResult2 = service.compareStockAudit(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareStockAudit(entity1, entity2);
        const compareResult2 = service.compareStockAudit(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
