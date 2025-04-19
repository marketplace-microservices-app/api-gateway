import { Controller, Post, Body } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RegisterUserPayload } from './types/RegisterUserPayload.interface';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('auth.register');
    await this.authClient.connect();
  }

  @Post('register')
  async register(@Body() body: RegisterUserPayload) {
    return this.authClient.send('auth.register', body).toPromise();
  }
}
