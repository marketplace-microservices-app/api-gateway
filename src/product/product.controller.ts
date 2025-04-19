import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';

@Controller('api/product')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.productClient.subscribeToResponseOf('product.create');
    this.productClient.subscribeToResponseOf('product.get-all-paginated');
    this.userClient.subscribeToResponseOf('users.get-seller-by-seller-id');
    await this.productClient.connect();
  }

  @Post('create')
  async register(@Body() body: CreateProdcutPayload) {
    return this.productClient.send('product.create', body).toPromise();
  }

  @Get('get-all-products/paginated')
  async getAllProductsPaginated(
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    const payload = {
      skip: Number(skip),
      take: Number(take),
    };

    const products = await this.productClient
      .send('product.get-all-paginated', payload)
      .toPromise();

    // Fetch seller details for each product useing the seller_id
    // To decouple the products and users services
    const productsWithSeller = await Promise.all(
      products?.data.map(async (product) => {
        const seller = await this.userClient
          .send('users.get-seller-by-seller-id', {
            sellerId: product.seller_id,
          })
          .toPromise();
        console.log(JSON.stringify(seller, null, 2));
        return { ...product, seller };
      }),
    );

    return productsWithSeller;
  }
}
