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
  message: string;

  @ApiProperty()
  createdAt: Date;
}
