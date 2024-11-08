import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustodialModule } from './custodial/custodial.module';
import { AuthModule } from './auth/auth.module';
import { EVMService } from './evm/evm.service';

@Module({
  imports: [PrismaModule, CustodialModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, EVMService],
})
export class AppModule {}
