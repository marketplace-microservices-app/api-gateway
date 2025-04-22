import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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
}
