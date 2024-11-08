import { Controller } from '@nestjs/common';
import { CustodialService } from './custodial.service';

@Controller('custodial')
export class CustodialController {
  constructor(private readonly custodialService: CustodialService) {}
}
