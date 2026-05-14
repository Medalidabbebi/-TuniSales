import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IClientContact } from '../client-contact.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../client-contact.test-samples';

import { ClientContactService, RestClientContact } from './client-contact.service';

const requireRestSample: RestClientContact = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
};

describe('ClientContact Service', () => {
  let service: ClientContactService;
  let httpMock: HttpTestingController;
  let expectedResult: IClientContact | IClientContact[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ClientContactService);
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

    it('should create a ClientContact', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientContact = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(clientContact).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ClientContact', () => {
      const clientContact = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(clientContact).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ClientContact', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ClientContact', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ClientContact', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addClientContactToCollectionIfMissing', () => {
      it('should add a ClientContact to an empty array', () => {
        const clientContact: IClientContact = sampleWithRequiredData;
        expectedResult = service.addClientContactToCollectionIfMissing([], clientContact);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(clientContact);
      });

      it('should not add a ClientContact to an array that contains it', () => {
        const clientContact: IClientContact = sampleWithRequiredData;
        const clientContactCollection: IClientContact[] = [
          {
            ...clientContact,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addClientContactToCollectionIfMissing(clientContactCollection, clientContact);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ClientContact to an array that doesn't contain it", () => {
        const clientContact: IClientContact = sampleWithRequiredData;
        const clientContactCollection: IClientContact[] = [sampleWithPartialData];
        expectedResult = service.addClientContactToCollectionIfMissing(clientContactCollection, clientContact);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(clientContact);
      });

      it('should add only unique ClientContact to an array', () => {
        const clientContactArray: IClientContact[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const clientContactCollection: IClientContact[] = [sampleWithRequiredData];
        expectedResult = service.addClientContactToCollectionIfMissing(clientContactCollection, ...clientContactArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const clientContact: IClientContact = sampleWithRequiredData;
        const clientContact2: IClientContact = sampleWithPartialData;
        expectedResult = service.addClientContactToCollectionIfMissing([], clientContact, clientContact2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(clientContact);
        expect(expectedResult).toContain(clientContact2);
      });

      it('should accept null and undefined values', () => {
        const clientContact: IClientContact = sampleWithRequiredData;
        expectedResult = service.addClientContactToCollectionIfMissing([], null, clientContact, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(clientContact);
      });

      it('should return initial array if no ClientContact is added', () => {
        const clientContactCollection: IClientContact[] = [sampleWithRequiredData];
        expectedResult = service.addClientContactToCollectionIfMissing(clientContactCollection, undefined, null);
        expect(expectedResult).toEqual(clientContactCollection);
      });
    });

    describe('compareClientContact', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareClientContact(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareClientContact(entity1, entity2);
        const compareResult2 = service.compareClientContact(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareClientContact(entity1, entity2);
        const compareResult2 = service.compareClientContact(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareClientContact(entity1, entity2);
        const compareResult2 = service.compareClientContact(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
