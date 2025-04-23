import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.userClient.subscribeToResponseOf(
      'users.get-buyer-details-from-userId',
    );
    await this.userClient.connect();
  }

  @UseGuards(AuthGuard)
  @Get('get-buyer-details-from-userId/:userId')
  async getBuyerIdFromUserId(@Param('userId') userId: string) {
    const payload = {
      userId: userId,
    };

    const buyerDetails = await this.userClient
      .send('users.get-buyer-details-from-userId', payload)
      .toPromise();

    if (!buyerDetails) {
      throw new Error('Buyer ID not found for the given user ID');
    }

    return buyerDetails;
  }

  @UseGuards(AuthGuard)
  @Get('get-seller-details-from-userId/:userId')
  async getSellerIdFromUserId(@Param('userId') userId: string) {
    const sellerDetails = await this.userClient
      .send('users.get-seller-details-from-userId', userId)
      .toPromise();

    if (!sellerDetails) {
      throw new Error('Seller ID not found for the given user ID');
    }

    return sellerDetails;
  }
}
