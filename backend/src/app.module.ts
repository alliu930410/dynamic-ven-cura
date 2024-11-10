import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustodialModule } from './custodial/custodial.module';
import { AuthModule } from './auth/auth.module';
import { EVMService } from './evm/evm.service';

@Module({
  imports: [PrismaModule, CustodialModule, AuthModule],
  controllers: [],
  providers: [EVMService],
})
export class AppModule {}
