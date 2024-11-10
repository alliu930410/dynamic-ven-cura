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
      message: `Transaction ${txHash} is pending, please wait until it is confirmed`,
    });
  }
}

export class InteractionTooFrequentException extends BadRequestException {
  constructor() {
    super({
      error: 'InteractionTooFrequent',
      message: 'Interaction too frequent, please wait a moment',
    });
  }
}
