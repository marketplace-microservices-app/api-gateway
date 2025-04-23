import { Controller, Post, Body } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RegisterUserPayload } from './types/RegisterUserPayload.interface';
import { LoginUserPayload } from './types/LoginUserPayload.interface';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('auth.register');
    this.authClient.subscribeToResponseOf('auth.login');
    this.authClient.subscribeToResponseOf('auth.refresh');
    await this.authClient.connect();
  }

  @Post('register')
  async register(@Body() body: RegisterUserPayload) {
    return this.authClient.send('auth.register', body).toPromise();
  }

  @Post('login')
  async login(@Body() body: LoginUserPayload) {
    return this.authClient.send('auth.login', body).toPromise();
  }

  @Post('refresh')
  async refresh(@Body() body) {
    return this.authClient.send('auth.refresh', body).toPromise();
  }
}
