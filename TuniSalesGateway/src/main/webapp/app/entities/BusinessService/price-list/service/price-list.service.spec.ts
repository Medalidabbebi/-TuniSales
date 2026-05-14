import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IPriceList } from '../price-list.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../price-list.test-samples';

import { PriceListService, RestPriceList } from './price-list.service';

const requireRestSample: RestPriceList = {
  ...sampleWithRequiredData,
  validFrom: sampleWithRequiredData.validFrom?.toJSON(),
  validTo: sampleWithRequiredData.validTo?.toJSON(),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
};

describe('PriceList Service', () => {
  let service: PriceListService;
  let httpMock: HttpTestingController;
  let expectedResult: IPriceList | IPriceList[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(PriceListService);
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

    it('should create a PriceList', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const priceList = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(priceList).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PriceList', () => {
      const priceList = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(priceList).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PriceList', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PriceList', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PriceList', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPriceListToCollectionIfMissing', () => {
      it('should add a PriceList to an empty array', () => {
        const priceList: IPriceList = sampleWithRequiredData;
        expectedResult = service.addPriceListToCollectionIfMissing([], priceList);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(priceList);
      });

      it('should not add a PriceList to an array that contains it', () => {
        const priceList: IPriceList = sampleWithRequiredData;
        const priceListCollection: IPriceList[] = [
          {
            ...priceList,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPriceListToCollectionIfMissing(priceListCollection, priceList);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PriceList to an array that doesn't contain it", () => {
        const priceList: IPriceList = sampleWithRequiredData;
        const priceListCollection: IPriceList[] = [sampleWithPartialData];
        expectedResult = service.addPriceListToCollectionIfMissing(priceListCollection, priceList);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(priceList);
      });

      it('should add only unique PriceList to an array', () => {
        const priceListArray: IPriceList[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const priceListCollection: IPriceList[] = [sampleWithRequiredData];
        expectedResult = service.addPriceListToCollectionIfMissing(priceListCollection, ...priceListArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const priceList: IPriceList = sampleWithRequiredData;
        const priceList2: IPriceList = sampleWithPartialData;
        expectedResult = service.addPriceListToCollectionIfMissing([], priceList, priceList2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(priceList);
        expect(expectedResult).toContain(priceList2);
      });

      it('should accept null and undefined values', () => {
        const priceList: IPriceList = sampleWithRequiredData;
        expectedResult = service.addPriceListToCollectionIfMissing([], null, priceList, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(priceList);
      });

      it('should return initial array if no PriceList is added', () => {
        const priceListCollection: IPriceList[] = [sampleWithRequiredData];
        expectedResult = service.addPriceListToCollectionIfMissing(priceListCollection, undefined, null);
        expect(expectedResult).toEqual(priceListCollection);
      });
    });

    describe('comparePriceList', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePriceList(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.comparePriceList(entity1, entity2);
        const compareResult2 = service.comparePriceList(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.comparePriceList(entity1, entity2);
        const compareResult2 = service.comparePriceList(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.comparePriceList(entity1, entity2);
        const compareResult2 = service.comparePriceList(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
