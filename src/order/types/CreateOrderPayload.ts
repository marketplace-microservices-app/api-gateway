import { ApiProperty } from '@nestjs/swagger';

export class PurchasedProducts {
  @ApiProperty({
    example: 'd47ef880-06cd-4fdc-aa63-1dad7b02b2ce',
    description: 'UUID of the product being purchased',
  })
  productId: string;
  @ApiProperty({
    example: 10,
    description: 'Number of units purchased for this product',
  })
  quantity: number;
  @ApiProperty({
    example: 25.99,
    description: 'Price per unit of the product at the time of purchase',
  })
  itemPrice: number;
  @ApiProperty({
    example: 150,
    description: 'Available stock at the time of ordering',
  })
  availableStock: number;
}
export class CreateOrderPayload {
  @ApiProperty({
    example: '0862df85-e0ad-449b-85cd-229903ee4f02',
    description: 'UUID of the buyer placing the order',
  })
  buyerId: string;
  @ApiProperty({
    type: [PurchasedProducts],
    description: 'List of products being ordered',
  })
  products: PurchasedProducts[];
}
