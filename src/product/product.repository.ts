import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { GetAllProductsDTO } from './dto/get-all-products.dto';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: GetAllProductsDTO): Promise<Product[]> {
    const { categories, page = 1 } = filters;
    let { productsPerPage = 10 } = filters;
    // limiting products returned to mitigate spamming the system or retrieving too much data which will affect efficiency
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
      skip: (page - 1) * +productsPerPage,
      take: +productsPerPage,
    });
  }

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    category: string;
    area: string;
  }): Promise<Product> {
    return this.prisma.product.create({ data });
  }

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
      ${area ? Prisma.sql`WHERE "Product"."area" = ${area}` : Prisma.empty}
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
}
