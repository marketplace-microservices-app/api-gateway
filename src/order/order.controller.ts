import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderPayload } from './types/CreateOrderPayload';

@Controller('api/orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.orderClient.subscribeToResponseOf('order.create');
    this.orderClient.subscribeToResponseOf('order.cancel');
    this.orderClient.subscribeToResponseOf('order.get-all-orders-by-userId');
    this.orderClient.subscribeToResponseOf('order.get-orders-by-buyerId');
    this.userClient.subscribeToResponseOf(
      'users.get-buyer-details-from-userId',
    );
    await this.orderClient.connect();
  }

  @Post('create')
  async create(@Body() body: CreateOrderPayload) {
    return this.orderClient.send('order.create', body).toPromise();
  }

  @Post('cancel')
  async cancel(@Body() orderId: string) {
    return this.orderClient.send('order.cancel', orderId).toPromise();
  }

  @Post('get-all-orders-by-userId')
  async getAllOrdersByUserId(@Body() userId: string) {
    // Get buyer_id from the user_id

    const buyerDetails = await this.userClient
      .send('users.get-buyer-details-from-userId', userId)
      .toPromise();

    const buyerId = buyerDetails?.data.id;
    if (!buyerId) {
      throw new Error('Buyer ID not found for the given user ID');
    }

    const orders = await this.orderClient
      .send('order.get-orders-by-buyerId', buyerId)
      .toPromise();

    return orders;
  }
}
