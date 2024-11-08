import { ApiProperty } from '@nestjs/swagger';

export class DynamicUserDto {
  @ApiProperty()
  dynamicUserId: string;
}

export class AuthenticatedDynamicUserDto {
  @ApiProperty({ type: DynamicUserDto })
  user: DynamicUserDto;
}
