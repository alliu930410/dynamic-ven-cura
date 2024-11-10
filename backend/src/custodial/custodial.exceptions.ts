import { BadRequestException, NotFoundException } from '@nestjs/common';

export class WalletNotFoundException extends NotFoundException {
  constructor(address: string) {
    super({
      error: 'Wallet not found',
      message: `Wallet with address ${address} not found`,
    });
  }
}

export class HasPendingTransactionException extends BadRequestException {
  constructor(txHash: string) {
    super({
      error: 'HasPendingTransaction',
      message: `Transaction ${txHash} is pending pending, please wait until it is confirmed`,
    });
  }
}
