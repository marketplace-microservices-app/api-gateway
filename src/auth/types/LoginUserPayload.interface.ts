import { ApiProperty } from '@nestjs/swagger';

export class LoginUserPayload {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user trying to log in',
  })
  email: string;
  @ApiProperty({
    example: 'strongPassword123!',
    description: 'Password associated with the email',
  })
  password: string;
}
