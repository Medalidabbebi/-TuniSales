import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { PriceListFormService } from './price-list-form.service';
import { PriceListService } from '../service/price-list.service';
import { IPriceList } from '../price-list.model';
import { IProduct } from 'app/entities/BusinessService/product/product.model';
import { ProductService } from 'app/entities/BusinessService/product/service/product.service';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';

import { PriceListUpdateComponent } from './price-list-update.component';

describe('PriceList Management Update Component', () => {
  let comp: PriceListUpdateComponent;
  let fixture: ComponentFixture<PriceListUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let priceListFormService: PriceListFormService;
  let priceListService: PriceListService;
  let productService: ProductService;
  let clientService: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [PriceListUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PriceListUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PriceListUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    priceListFormService = TestBed.inject(PriceListFormService);
    priceListService = TestBed.inject(PriceListService);
    productService = TestBed.inject(ProductService);
    clientService = TestBed.inject(ClientService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Product query and add missing value', () => {
      const priceList: IPriceList = { id: 456 };
      const product: IProduct = { id: 20540 };
      priceList.product = product;

      const productCollection: IProduct[] = [{ id: 17776 }];
      jest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      jest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ priceList });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(expect.objectContaining)
      );
      expect(comp.productsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Client query and add missing value', () => {
      const priceList: IPriceList = { id: 456 };
      const client: IClient = { id: 67693 };
      priceList.client = client;

      const clientCollection: IClient[] = [{ id: 94026 }];
      jest.spyOn(clientService, 'query').mockReturnValue(of(new HttpResponse({ body: clientCollection })));
      const additionalClients = [client];
      const expectedCollection: IClient[] = [...additionalClients, ...clientCollection];
      jest.spyOn(clientService, 'addClientToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ priceList });
      comp.ngOnInit();

      expect(clientService.query).toHaveBeenCalled();
      expect(clientService.addClientToCollectionIfMissing).toHaveBeenCalledWith(
        clientCollection,
        ...additionalClients.map(expect.objectContaining)
      );
      expect(comp.clientsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const priceList: IPriceList = { id: 456 };
      const product: IProduct = { id: 53017 };
      priceList.product = product;
      const client: IClient = { id: 64003 };
      priceList.client = client;

      activatedRoute.data = of({ priceList });
      comp.ngOnInit();

      expect(comp.productsSharedCollection).toContain(product);
      expect(comp.clientsSharedCollection).toContain(client);
      expect(comp.priceList).toEqual(priceList);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceList>>();
      const priceList = { id: 123 };
      jest.spyOn(priceListFormService, 'getPriceList').mockReturnValue(priceList);
      jest.spyOn(priceListService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceList });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: priceList }));
      saveSubject.complete();

      // THEN
      expect(priceListFormService.getPriceList).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(priceListService.update).toHaveBeenCalledWith(expect.objectContaining(priceList));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceList>>();
      const priceList = { id: 123 };
      jest.spyOn(priceListFormService, 'getPriceList').mockReturnValue({ id: null });
      jest.spyOn(priceListService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceList: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: priceList }));
      saveSubject.complete();

      // THEN
      expect(priceListFormService.getPriceList).toHaveBeenCalled();
      expect(priceListService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceList>>();
      const priceList = { id: 123 };
      jest.spyOn(priceListService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceList });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(priceListService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProduct', () => {
      it('Should forward to productService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(productService, 'compareProduct');
        comp.compareProduct(entity, entity2);
        expect(productService.compareProduct).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareClient', () => {
      it('Should forward to clientService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(clientService, 'compareClient');
        comp.compareClient(entity, entity2);
        expect(clientService.compareClient).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
