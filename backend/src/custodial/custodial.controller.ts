import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CustodialService } from './custodial.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiHeaders, ApiOkResponse } from '@nestjs/swagger';
import { GetCustodialWalletsDto } from './custodial.dto';

@Controller('custodial')
export class CustodialController {
  constructor(private readonly custodialService: CustodialService) {}

  @Get('wallets')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Returns custodial wallets for the authenticated user',
    type: GetCustodialWalletsDto,
    isArray: true,
  })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'Must be a valid jwt token from Dynamic',
    },
  ])
  async getCustodialWallets(@Req() req: any) {
    console.log('request', req);
    return this.custodialService.getCustodialWallets('dynamicUserId');
  }
}
