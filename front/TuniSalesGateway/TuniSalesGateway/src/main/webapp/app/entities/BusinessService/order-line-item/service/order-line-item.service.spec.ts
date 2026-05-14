import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IOrderLineItem } from '../order-line-item.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../order-line-item.test-samples';

import { OrderLineItemService, RestOrderLineItem } from './order-line-item.service';

const requireRestSample: RestOrderLineItem = {
  ...sampleWithRequiredData,
  assignedAt: sampleWithRequiredData.assignedAt?.toJSON(),
};

describe('OrderLineItem Service', () => {
  let service: OrderLineItemService;
  let httpMock: HttpTestingController;
  let expectedResult: IOrderLineItem | IOrderLineItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(OrderLineItemService);
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

    it('should create a OrderLineItem', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const orderLineItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(orderLineItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a OrderLineItem', () => {
      const orderLineItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(orderLineItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a OrderLineItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of OrderLineItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a OrderLineItem', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addOrderLineItemToCollectionIfMissing', () => {
      it('should add a OrderLineItem to an empty array', () => {
        const orderLineItem: IOrderLineItem = sampleWithRequiredData;
        expectedResult = service.addOrderLineItemToCollectionIfMissing([], orderLineItem);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(orderLineItem);
      });

      it('should not add a OrderLineItem to an array that contains it', () => {
        const orderLineItem: IOrderLineItem = sampleWithRequiredData;
        const orderLineItemCollection: IOrderLineItem[] = [
          {
            ...orderLineItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addOrderLineItemToCollectionIfMissing(orderLineItemCollection, orderLineItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a OrderLineItem to an array that doesn't contain it", () => {
        const orderLineItem: IOrderLineItem = sampleWithRequiredData;
        const orderLineItemCollection: IOrderLineItem[] = [sampleWithPartialData];
        expectedResult = service.addOrderLineItemToCollectionIfMissing(orderLineItemCollection, orderLineItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(orderLineItem);
      });

      it('should add only unique OrderLineItem to an array', () => {
        const orderLineItemArray: IOrderLineItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const orderLineItemCollection: IOrderLineItem[] = [sampleWithRequiredData];
        expectedResult = service.addOrderLineItemToCollectionIfMissing(orderLineItemCollection, ...orderLineItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const orderLineItem: IOrderLineItem = sampleWithRequiredData;
        const orderLineItem2: IOrderLineItem = sampleWithPartialData;
        expectedResult = service.addOrderLineItemToCollectionIfMissing([], orderLineItem, orderLineItem2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(orderLineItem);
        expect(expectedResult).toContain(orderLineItem2);
      });

      it('should accept null and undefined values', () => {
        const orderLineItem: IOrderLineItem = sampleWithRequiredData;
        expectedResult = service.addOrderLineItemToCollectionIfMissing([], null, orderLineItem, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(orderLineItem);
      });

      it('should return initial array if no OrderLineItem is added', () => {
        const orderLineItemCollection: IOrderLineItem[] = [sampleWithRequiredData];
        expectedResult = service.addOrderLineItemToCollectionIfMissing(orderLineItemCollection, undefined, null);
        expect(expectedResult).toEqual(orderLineItemCollection);
      });
    });

    describe('compareOrderLineItem', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareOrderLineItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareOrderLineItem(entity1, entity2);
        const compareResult2 = service.compareOrderLineItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareOrderLineItem(entity1, entity2);
        const compareResult2 = service.compareOrderLineItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareOrderLineItem(entity1, entity2);
        const compareResult2 = service.compareOrderLineItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
