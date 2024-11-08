import { BadRequestException } from '@nestjs/common';

export class InvalidChainIdException extends BadRequestException {
  constructor(chainId: number) {
    super({
      error: 'Invalid chain ID',
      message: `Chain ID ${chainId} is not supported`,
    });
  }
}
