import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IStockAuditLine } from '../stock-audit-line.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../stock-audit-line.test-samples';

import { StockAuditLineService, RestStockAuditLine } from './stock-audit-line.service';

const requireRestSample: RestStockAuditLine = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
};

describe('StockAuditLine Service', () => {
  let service: StockAuditLineService;
  let httpMock: HttpTestingController;
  let expectedResult: IStockAuditLine | IStockAuditLine[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(StockAuditLineService);
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

    it('should create a StockAuditLine', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const stockAuditLine = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(stockAuditLine).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a StockAuditLine', () => {
      const stockAuditLine = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(stockAuditLine).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a StockAuditLine', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of StockAuditLine', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a StockAuditLine', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addStockAuditLineToCollectionIfMissing', () => {
      it('should add a StockAuditLine to an empty array', () => {
        const stockAuditLine: IStockAuditLine = sampleWithRequiredData;
        expectedResult = service.addStockAuditLineToCollectionIfMissing([], stockAuditLine);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockAuditLine);
      });

      it('should not add a StockAuditLine to an array that contains it', () => {
        const stockAuditLine: IStockAuditLine = sampleWithRequiredData;
        const stockAuditLineCollection: IStockAuditLine[] = [
          {
            ...stockAuditLine,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addStockAuditLineToCollectionIfMissing(stockAuditLineCollection, stockAuditLine);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a StockAuditLine to an array that doesn't contain it", () => {
        const stockAuditLine: IStockAuditLine = sampleWithRequiredData;
        const stockAuditLineCollection: IStockAuditLine[] = [sampleWithPartialData];
        expectedResult = service.addStockAuditLineToCollectionIfMissing(stockAuditLineCollection, stockAuditLine);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockAuditLine);
      });

      it('should add only unique StockAuditLine to an array', () => {
        const stockAuditLineArray: IStockAuditLine[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const stockAuditLineCollection: IStockAuditLine[] = [sampleWithRequiredData];
        expectedResult = service.addStockAuditLineToCollectionIfMissing(stockAuditLineCollection, ...stockAuditLineArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const stockAuditLine: IStockAuditLine = sampleWithRequiredData;
        const stockAuditLine2: IStockAuditLine = sampleWithPartialData;
        expectedResult = service.addStockAuditLineToCollectionIfMissing([], stockAuditLine, stockAuditLine2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockAuditLine);
        expect(expectedResult).toContain(stockAuditLine2);
      });

      it('should accept null and undefined values', () => {
        const stockAuditLine: IStockAuditLine = sampleWithRequiredData;
        expectedResult = service.addStockAuditLineToCollectionIfMissing([], null, stockAuditLine, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockAuditLine);
      });

      it('should return initial array if no StockAuditLine is added', () => {
        const stockAuditLineCollection: IStockAuditLine[] = [sampleWithRequiredData];
        expectedResult = service.addStockAuditLineToCollectionIfMissing(stockAuditLineCollection, undefined, null);
        expect(expectedResult).toEqual(stockAuditLineCollection);
      });
    });

    describe('compareStockAuditLine', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareStockAuditLine(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareStockAuditLine(entity1, entity2);
        const compareResult2 = service.compareStockAuditLine(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareStockAuditLine(entity1, entity2);
        const compareResult2 = service.compareStockAuditLine(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareStockAuditLine(entity1, entity2);
        const compareResult2 = service.compareStockAuditLine(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
