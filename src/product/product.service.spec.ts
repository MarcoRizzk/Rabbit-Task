import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('ProductService', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/product (GET) - should return all products with filters', async () => {
    const filters = {
      //try to add any category filter here
      categories: ['Product 21 Category', 'Product 22 Category'],
      page: 1,
      productsPerPage: 10,
    };

    const response = await request(app.getHttpServer())
      .get('/product')
      .query(filters)
      .expect(200);
    //this is used to show the result
    console.log(response);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(filters.productsPerPage);
  });

  it('/product/top-ten-ordered-products (GET) - should return top ten ordered products without area', async () => {
    const response = await request(app.getHttpServer())
      .get('/product/top-ten-ordered-products')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  it('/product/top-ten-ordered-products (GET) - should return top ten ordered products for a specific area', async () => {
    const area = 'Maadi';

    const response = await request(app.getHttpServer())
      .get('/product/top-ten-ordered-products')
      .query({ area })
      .expect(200);
    console.log(response);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });
});
