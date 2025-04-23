import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';
import { UpdateProdcutPayload } from './types/UpdateProductPayload.interface';
import CacheService from 'src/cache.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/product')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
    private _cacheService: CacheService,
  ) {}

  async onModuleInit() {
    this.productClient.subscribeToResponseOf('product.create');
    this.productClient.subscribeToResponseOf('product.update');
    this.productClient.subscribeToResponseOf('product.get-all-paginated');
    this.productClient.subscribeToResponseOf(
      'product.get-all-products-by-sellerId',
    );
    this.userClient.subscribeToResponseOf('users.get-seller-by-seller-id');
    this.userClient.subscribeToResponseOf(
      'users.get-seller-details-from-userId',
    );
    await this.productClient.connect();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async register(@Body() body: CreateProdcutPayload) {
    return this.productClient.send('product.create', body).toPromise();
  }

  @UseGuards(AuthGuard)
  @Post('update')
  async update(@Body() body: UpdateProdcutPayload) {
    return this.productClient.send('product.update', body).toPromise();
  }

  @UseGuards(AuthGuard)
  @Get('get-all-products/paginated')
  async getAllProductsPaginated(
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    // Check if the data is already cached
    const cacheKey = `products:${skip}:${take}`;
    const cachedProducts = await this._cacheService.get(cacheKey);
    if (cachedProducts) {
      console.log(`Cache found for ${cacheKey}`);
      return JSON.parse(cachedProducts);
    }
    console.log(`NO Cache found for ${cacheKey}! Fetching from Servers...`);

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
        return { ...product, seller };
      }),
    );

    const finalResponse = {
      status: products.status,
      message: products.message,
      total: products.total,
      data: productsWithSeller,
    };

    // Step 4: Cache it
    // Cache the result for next requests
    await this._cacheService
      .set(cacheKey, JSON.stringify(finalResponse), 300)
      .catch((err) => {
        console.error('Error caching data:', err);
      });
    console.log(`${cacheKey} Data cached successfully!`);

    return finalResponse;
  }

  @UseGuards(AuthGuard)
  @Get('get-product-details-by-productId/:productId')
  async getProductDetailsByProductId(@Param('productId') productId: string) {
    const productData = await this.productClient
      .send('product.get-product-details-by-productId', productId)
      .toPromise();
    // Populate Seller data
    const seller = await this.userClient
      .send('users.get-seller-by-seller-id', {
        sellerId: productData.seller_id,
      })
      .toPromise();

    productData.data['seller'] = seller;

    return productData;
  }

  @UseGuards(AuthGuard)
  @Get('get-all-products-by-userId/:userId')
  async getAllProductsByUserId(@Param('userId') userId: string) {
    const sellerDetails = await this.userClient
      .send('users.get-seller-details-from-userId', userId)
      .toPromise();

    const sellerId = sellerDetails?.data.id;
    if (!sellerId) {
      throw new Error('Seller ID not found for the given user ID');
    }

    const products = await this.productClient
      .send('product.get-all-products-by-sellerId', sellerId)
      .toPromise();

    return products;
  }
}
