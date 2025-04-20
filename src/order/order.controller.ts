import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderPayload } from './types/CreateOrderPayload';

@Controller('api/orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.orderClient.subscribeToResponseOf('order.create');
    this.orderClient.subscribeToResponseOf('order.cancel');
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
}
