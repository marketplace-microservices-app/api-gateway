import { ApiProperty } from '@nestjs/swagger';

export class CreateProdcutPayload {
  @ApiProperty({
    example: 'PROD001',
    description: 'Unique product code (e.g., SKU or internal reference)',
  })
  productCode: string;
  @ApiProperty({
    example: 'iPhone 16',
    description: 'Name of the product',
  })
  productName: string;
  @ApiProperty({
    example: 'Latest generation smartphone with advanced features',
    description: 'A short description of the product',
  })
  shortDesc: string;
  @ApiProperty({
    example: 999.99,
    description: 'Price of a single unit of the product in USD',
  })
  itemPrice: number;
  @ApiProperty({
    example: 100,
    description: 'Number of units available in stock',
  })
  availableStock: number;
  @ApiProperty({
    example: 'e0bd2f0b-9bd0-485b-a0f0-adba62c35686',
    description: 'UUID of the seller who owns this product',
  })
  sellerId: string;
}
