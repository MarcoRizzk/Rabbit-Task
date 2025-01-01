import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { GetAllProductsDTO } from './dto/get-all-products.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Get()
  async getAllProducts(@Query() filters: GetAllProductsDTO) {
    return this.productsService.getAllProducts(filters);
  }

  //optional area parameter
  @Get('top-ten-ordered-products')
  async topTenOrderedProducts(@Query('area') area?: string) {
    return this.productsService.getTopTenOrderedProducts(area);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(Number(id));
  }
}
