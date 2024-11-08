import { NotFoundException } from '@nestjs/common';

export class WalletNotFoundException extends NotFoundException {
  constructor(address: string) {
    super({
      error: 'Wallet not found',
      message: `Wallet with address ${address} not found`,
    });
  }
}
