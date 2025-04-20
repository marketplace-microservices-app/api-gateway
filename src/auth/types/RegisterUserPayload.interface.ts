import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserPayload {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address used for registration',
  })
  email: string;
  @ApiProperty({
    example: 'SecurePassw0rd!',
    description: 'Password for the new user account',
  })
  password: string;
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  firstName: string;
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName: string;
  @ApiProperty({
    example: 'buyer',
    description: 'Role assigned to the user (e.g., buyer or seller)',
  })
  role: string;
  @ApiProperty({
    example: 'US',
    description:
      'Optional country code (ISO 3166-1 alpha-2 format, e.g., US, IN, GB)',
    required: false,
  })
  country?: string;
}
