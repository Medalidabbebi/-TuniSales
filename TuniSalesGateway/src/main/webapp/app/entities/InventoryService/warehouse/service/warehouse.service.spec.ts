import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IWarehouse } from '../warehouse.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../warehouse.test-samples';

import { WarehouseService, RestWarehouse } from './warehouse.service';

const requireRestSample: RestWarehouse = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Warehouse Service', () => {
  let service: WarehouseService;
  let httpMock: HttpTestingController;
  let expectedResult: IWarehouse | IWarehouse[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(WarehouseService);
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

    it('should create a Warehouse', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const warehouse = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(warehouse).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Warehouse', () => {
      const warehouse = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(warehouse).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Warehouse', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Warehouse', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Warehouse', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addWarehouseToCollectionIfMissing', () => {
      it('should add a Warehouse to an empty array', () => {
        const warehouse: IWarehouse = sampleWithRequiredData;
        expectedResult = service.addWarehouseToCollectionIfMissing([], warehouse);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(warehouse);
      });

      it('should not add a Warehouse to an array that contains it', () => {
        const warehouse: IWarehouse = sampleWithRequiredData;
        const warehouseCollection: IWarehouse[] = [
          {
            ...warehouse,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addWarehouseToCollectionIfMissing(warehouseCollection, warehouse);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Warehouse to an array that doesn't contain it", () => {
        const warehouse: IWarehouse = sampleWithRequiredData;
        const warehouseCollection: IWarehouse[] = [sampleWithPartialData];
        expectedResult = service.addWarehouseToCollectionIfMissing(warehouseCollection, warehouse);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(warehouse);
      });

      it('should add only unique Warehouse to an array', () => {
        const warehouseArray: IWarehouse[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const warehouseCollection: IWarehouse[] = [sampleWithRequiredData];
        expectedResult = service.addWarehouseToCollectionIfMissing(warehouseCollection, ...warehouseArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const warehouse: IWarehouse = sampleWithRequiredData;
        const warehouse2: IWarehouse = sampleWithPartialData;
        expectedResult = service.addWarehouseToCollectionIfMissing([], warehouse, warehouse2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(warehouse);
        expect(expectedResult).toContain(warehouse2);
      });

      it('should accept null and undefined values', () => {
        const warehouse: IWarehouse = sampleWithRequiredData;
        expectedResult = service.addWarehouseToCollectionIfMissing([], null, warehouse, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(warehouse);
      });

      it('should return initial array if no Warehouse is added', () => {
        const warehouseCollection: IWarehouse[] = [sampleWithRequiredData];
        expectedResult = service.addWarehouseToCollectionIfMissing(warehouseCollection, undefined, null);
        expect(expectedResult).toEqual(warehouseCollection);
      });
    });

    describe('compareWarehouse', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareWarehouse(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareWarehouse(entity1, entity2);
        const compareResult2 = service.compareWarehouse(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareWarehouse(entity1, entity2);
        const compareResult2 = service.compareWarehouse(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareWarehouse(entity1, entity2);
        const compareResult2 = service.compareWarehouse(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
