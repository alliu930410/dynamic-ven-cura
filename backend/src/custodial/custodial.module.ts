import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustodialService } from './custodial.service';
import { CustodialController } from './custodial.controller';
import { EVMService } from 'src/evm/evm.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustodialController],
  providers: [CustodialService, EVMService],
})
export class CustodialModule {}
