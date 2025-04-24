import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { ProductController } from './product/product.controller';
import { OrderController } from './order/order.controller';
import { RedisModule } from '@nestjs-modules/ioredis';
import CacheService from './cache.service';
import { OrderService } from './order/order.service';
import { UsersController } from './users/users.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule setup
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER || ''],
          },
          consumer: {
            groupId: 'api-gateway-auth-consumer',
          },
        },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER || ''],
          },
          consumer: {
            groupId: 'api-gateway-user-consumer',
          },
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER || ''],
          },
          consumer: {
            groupId: 'api-gateway-product-consumer',
          },
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER || ''],
          },
          consumer: {
            groupId: 'api-gateway-order-consumer',
          },
        },
      },
    ]),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || '',
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    ProductController,
    OrderController,
    UsersController,
  ],
  providers: [AppService, CacheService, OrderService],
})
export class AppModule {}
