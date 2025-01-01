import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { GetAllProductsDTO } from './dto/get-all-products.dto';
import { ProductDTO } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productsRepository: ProductRepository) {}

  async getAllProducts(filters: GetAllProductsDTO): Promise<ProductDTO[]> {
    return this.productsRepository.findAll(filters);
  }

  async getProductById(id: number): Promise<ProductDTO> {
    return this.productsRepository.findById(id);
  }

  async getTopTenOrderedProducts(area?: string): Promise<ProductDTO[]> {
    return this.productsRepository.getTopTenOrderedProducts(area);
  }
}
