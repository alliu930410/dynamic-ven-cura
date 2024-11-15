import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import {
  GetBalanceDto,
  GetCustodialWalletsDto,
  GetTransactionHistoryDto,
  PaginatedMessageHistoryDto,
  SendTransactionDto,
  SendTransactionReceiptDto,
  SignedMessageDto,
  SignMessageDto,
} from './custodial.dto';
import { AuthenticatedDynamicUserDto } from 'src/auth/auth.dto';
import {
  InsufficientFundException,
  InvalidChainIdException,
} from 'src/evm/evm.exceptions';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  HasPendingTransactionException,
  InteractionTooFrequentException,
  WalletNotFoundException,
} from './custodial.exceptions';
import { sepolia } from 'viem/chains';

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
  @ApiException(() => [
    WalletNotFoundException,
    InvalidChainIdException,
    HasPendingTransactionException,
    InsufficientFundException,
    InteractionTooFrequentException,
  ])
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

  @Get('/wallet/messages/:address')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description:
      'Returns paginated messages for the specified custodial wallet address',
    type: PaginatedMessageHistoryDto,
    isArray: true,
  })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'Must be a valid jwt token from Dynamic',
    },
  ])
  @ApiException(() => [WalletNotFoundException])
  async getWalletMessageHistory(
    @Req() req: AuthenticatedDynamicUserDto,
    @Param('address') address: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const { dynamicUserId } = req.user;
    return this.custodialService.getMessageHistory(
      dynamicUserId,
      address,
      page,
      limit,
    );
  }

  /**
   * Note that this needs special handling to do pagination as it's from EtherscanProvider
   * we'll simplify it by only retuning a maximum of 100 latest transactions without pagination
   */
  @Get('/wallet/transactions/:chainId/:address')
  @ApiOkResponse({
    description:
      'Returns all transactions for the specified custodial wallet address',
    type: GetTransactionHistoryDto,
    isArray: true,
  })
  @ApiQuery({ name: 'chainId', required: true, example: sepolia.id })
  @ApiException(() => [WalletNotFoundException])
  async getWalletTransactionHistory(
    @Param('address') address: string,
    @Param('chainId', ParseIntPipe) chainId: number,
  ) {
    return this.custodialService.getTransactionHistory(chainId, address);
  }
}
