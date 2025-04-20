import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.productClient.subscribeToResponseOf(
      'product.get-product-details-by-productId',
    );
  }

  async attachProductDetailsToOrderItems(ordersDetails) {
    // Get Unique Products
    const productIds = new Set();

    ordersDetails.forEach((order) => {
      order.order_items.forEach((item) => {
        productIds.add(item.product_id);
      });
    });

    const uniqueProductIds = Array.from(productIds);

    // 3. Function to fetch product details
    const fetchProductDetails = async (productId) => {
      return await this.productClient
        .send('product.get-product-details-by-productId', productId)
        .toPromise();
    };

    const productDetailsMap = {};

    const fetchAllProductDetails = async () => {
      try {
        const productDetails = await Promise.all(
          uniqueProductIds.map((id) => fetchProductDetails(id)),
        );

        // Optional: Map product details by id for easy access later

        productDetails.forEach((product) => {
          productDetailsMap[product.data.id] = product.data;
        });

        return productDetailsMap; // or do what you need with it
      } catch (err) {
        console.error('Error fetching product details:', err);
      }
    };

    const res = await fetchAllProductDetails();

    console.log('Product Details Map:', res);

    const ordersWithProductDetails = ordersDetails.map((order) => {
      return {
        ...order,
        order_items: order.order_items.map((item) => {
          const productDetail = productDetailsMap?.[item.product_id] ?? null;
          return {
            ...item,
            product_details: productDetail,
          };
        }),
      };
    });
    return ordersWithProductDetails;
  }
}
