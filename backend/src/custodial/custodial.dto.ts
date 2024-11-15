import { ApiProperty } from '@nestjs/swagger';
import { CustodialWallet, MessageHistory } from '@prisma/client';

export class GetCustodialWalletsDto
  implements
    Omit<CustodialWallet, 'id' | 'privateKey' | 'privateKeyIV' | 'userId'>
{
  @ApiProperty()
  address: string;

  @ApiProperty()
  nickName: string | null;

  @ApiProperty()
  publicKey: string;

  @ApiProperty()
  createdAt: Date;
}

export class CreateCustodialWalletDto
  implements
    Omit<
      CustodialWallet,
      'id' | 'privateKey' | 'privateKeyIV' | 'userId' | 'createdAt'
    >
{
  @ApiProperty()
  address: string;

  @ApiProperty()
  nickName: string | null;

  @ApiProperty()
  publicKey: string;
}

export class GetBalanceDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  balance: string;
}

export class SignedMessageDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  signature: string;
}

export class SignMessageDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  message: string;
}

export class SendTransactionDto {
  @ApiProperty()
  chainId: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  amountInEth: number;
}

export class SendTransactionReceiptDto {
  @ApiProperty()
  chainId: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  amountInEth: number;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  nonce: number;
}

export class GetWalletMessageHistoryDto
  implements
    Omit<
      MessageHistory,
      'id' | 'signature' | 'signatureIV' | 'custodialWalletId'
    >
{
  @ApiProperty()
  address: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedMessageHistoryDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ type: [GetWalletMessageHistoryDto] })
  items: GetWalletMessageHistoryDto[];
}

export class GetTransactionHistoryDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  nonce: number;

  @ApiProperty()
  sealed: boolean;

  @ApiProperty()
  amountInEth: string;

  @ApiProperty()
  isInternal: boolean;

  @ApiProperty()
  nickName?: string | null;

  @ApiProperty()
  direction: 'incoming' | 'outgoing';

  @ApiProperty()
  createdAt: Date;
}
