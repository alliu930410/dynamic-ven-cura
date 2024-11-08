import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustodialService } from './custodial.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiCreatedResponse, ApiHeaders, ApiOkResponse } from '@nestjs/swagger';
import { GetBalanceDto, GetCustodialWalletsDto } from './custodial.dto';
import { AuthenticatedDynamicUserDto } from 'src/auth/auth.dto';

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
  async getCustodialWallets(@Req() req: AuthenticatedDynamicUserDto) {
    const { dynamicUserId } = req.user;
    return this.custodialService.getWallets(dynamicUserId);
  }

  @Post('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    description: 'Creates a new custodial wallet for the authenticated user',
    type: GetCustodialWalletsDto,
  })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'Must be a valid jwt token from Dynamic',
    },
  ])
  async createWallet(@Req() req: AuthenticatedDynamicUserDto) {
    const { dynamicUserId } = req.user;
    return this.custodialService.createWallet(dynamicUserId);
  }

  @Get('/wallet/balance/:chainId/:address')
  @ApiOkResponse({
    description:
      'Returns the balance for the specified address on the specified chain',
    type: GetBalanceDto,
  })
  async getBalance(
    @Param('chainId', ParseIntPipe) chainId: number,
    @Param('address') address: string,
  ) {
    return this.custodialService.getBalance(chainId, address);
  }
}
