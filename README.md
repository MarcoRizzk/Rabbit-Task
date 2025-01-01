This is a brief documentation for the changes happened and the enhancements all over the code repository.

### Task 1: Top 10 Most Frequently Ordered Products API
#### Implementation Details
##### Controller:

* Added a new endpoint `/product/top-ten-ordered-products` that accepts an optional `area` query parameter to filter results by area.
* Example usage:
    * `GET /product/top-ten-ordered-products`
    * `GET /product/top-ten-ordered-products?area=Maadi`
    ```
    @Get('top-ten-ordered-products')
    async topTenOrderedProducts(@Query('area') area?: string) {
    return this.productsService.getTopTenOrderedProducts(area);
    }
    ```
#### Service:
- Added a service function `getTopTenOrderedProducts` to retrieve the top 10 most frequently ordered products.
- Delegates the database query logic to the repository layer.

```
async getTopTenOrderedProducts(area?: string): Promise<ProductDTO[]> {
    return this.productsRepository.getTopTenOrderedProducts(area);
}
```
##### Repository:

* Used raw SQL queries for efficient data aggregation and filtering by area.
* Queries the OrderItem and Product tables to calculate total quantities ordered, grouped by product, and sorts the results in descending order.

```
async getTopTenOrderedProducts(area?: string): Promise<Product[]> {
const query = Prisma.sql`
    SELECT 
      "Product"."id",
      "Product"."name",
      "Product"."category",
      "Product"."area",
      "Product"."createdAt",
      CAST(SUM("OrderItem"."quantity") AS TEXT) AS totalQuantity
    FROM 
      rabbit."Product"
    JOIN 
      rabbit."OrderItem" 
      ON "Product"."id" = "OrderItem"."productId"
    ${area ? Prisma.sql`WHERE "Product"."area" = ${area}`: Prisma.empty}
    GROUP BY 
      "Product"."id", 
      "Product"."name", 
      "Product"."category", 
      "Product"."area", 
      "Product"."createdAt"
    ORDER BY 
      totalQuantity DESC
    LIMIT 10;
 `;

return this.prisma.$queryRaw<Product[]>(query);
}
```
### Task 2: Optimization of List Products API and Add Unit Tests to All Services
#### Implementation Details
##### Enhancements:

* Modified the `findAll` method to support pagination, category filtering, and a maximum limit of 30 products per page to mitigate inefficiencies and prevent system abuse.
* Applied a dynamic where clause based on the provided category filters.
* Indexing:
Added database indexes on frequently queried fields such as `area` and `category` to optimize query performance.

```
async findAll(filters: GetAllProductsDTO): Promise<Product[]> {
const { categories, page = 1 } = filters;
let { productsPerPage = 10 } = filters;

if (+productsPerPage > 30) {
productsPerPage = 30;
}

const whereClause =
categories && categories.length
? {
category: {
in: Array.isArray(categories) ? categories : [categories],
},
}
: {};

return this.prisma.product.findMany({
where: whereClause,
skip: (page - 1) \* +productsPerPage,
take: +productsPerPage,
});
} 
```
##### DTO:

* Created GetAllProductsDTO to encapsulate filters for pagination, product count, and categories.
```
export class GetAllProductsDTO {
categories?: string[];
page?: number;
productsPerPage?: number;
}
```

##### Unit Testing
* Added unit tests using jest and supertest to validate API functionality and performance:

* Fetching all products with filters.
* Fetching the top 10 ordered products with and without the area parameter.
```
describe('ProductService', () => {
it('/product (GET) - should return all products with filters', async () => {
const filters = {
categories: ['Product 21 Category', 'Product 22 Category'],
page: 1,
productsPerPage: 10,
};

    const response = await request(app.getHttpServer())
      .get('/product')
      .query(filters)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(filters.productsPerPage);

});

it('/product/top-ten-ordered-products (GET) - should return top ten ordered products', async () => {
const response = await request(app.getHttpServer())
.get('/product/top-ten-ordered-products')
.expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(10);

});
});
```
###### Assumptions:
* Database tables (Product, OrderItem) follow the schema outlined in the provided raw SQL query.
* Performance optimization for /products API assumes pagination and limited products per request.
* top-ten-ordered-products API assumes a high-traffic use case and optimizes for read-heavy operations.

###### Future Enhancements We Can Add:
* Caching:
Implement a caching mechanism (e.g., Redis) to reduce database hits for frequently accessed data like the top 10 products.
* Rate Limiting:
Implement rate limiting to prevent API abuse.
* Integration:
Use a notification library to notify administrators when new products or orders are created.
#### Conclusion
The implementation ensures clean, modular, and scalable APIs that meet the requirements of the Rabbit Coding Challenge. Testing, optimization, and documentation were prioritized to deliver production-ready solutions.
