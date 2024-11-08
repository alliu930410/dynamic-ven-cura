import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustodialModule } from './custodial/custodial.module';

@Module({
  imports: [PrismaModule, CustodialModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
