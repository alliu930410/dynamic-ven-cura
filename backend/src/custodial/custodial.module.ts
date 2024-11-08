import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustodialService } from './custodial.service';
import { CustodialController } from './custodial.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CustodialController],
  providers: [CustodialService],
})
export class CustodialModule {}
