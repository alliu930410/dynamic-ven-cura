import {
  Body,
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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeaders,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  GetBalanceDto,
  GetCustodialWalletsDto,
  SendTransactionDto,
  SendTransactionReceiptDto,
  SignedMessageDto,
  SignMessageDto,
} from './custodial.dto';
import { AuthenticatedDynamicUserDto } from 'src/auth/auth.dto';
import { InvalidChainIdException } from 'src/evm/evm.exceptions';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { WalletNotFoundException } from './custodial.exceptions';

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
  @ApiException(() => [InvalidChainIdException])
  async getBalance(
    @Param('chainId', ParseIntPipe) chainId: number,
    @Param('address') address: string,
  ) {
    return this.custodialService.getBalance(chainId, address);
  }

  @Post('/wallet/signMessage')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    required: true,
    type: SignMessageDto,
  })
  @ApiCreatedResponse({
    description: 'Signs a message with the specified custodial wallet',
    type: SignedMessageDto,
  })
  @ApiException(() => [WalletNotFoundException])
  async signMessage(
    @Req() req: AuthenticatedDynamicUserDto,
    @Body() signMessageDto: SignMessageDto,
  ) {
    const { dynamicUserId } = req.user;
    const { address, message } = signMessageDto;
    return this.custodialService.signMessage(dynamicUserId, address, message);
  }

  @Post('/wallet/sendTransaction')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    required: true,
    type: SendTransactionDto,
  })
  @ApiCreatedResponse({
    description:
      'Send a basic transaction to the specified chain with the specified wallet',
    type: SendTransactionReceiptDto,
  })
  async sendTransaction(
    @Req() req: AuthenticatedDynamicUserDto,
    @Body() sendTransactionDto: SendTransactionDto,
  ) {
    const { dynamicUserId } = req.user;
    const { chainId, address, to, amountInEth } = sendTransactionDto;
    return this.custodialService.sendTransaction(
      dynamicUserId,
      chainId,
      address,
      to,
      amountInEth,
    );
  }
}
